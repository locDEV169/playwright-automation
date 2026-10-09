/**
 * Creates playwright/.auth/user.json for @authenticated scenarios.
 * With TEST_EMAIL/TEST_PASSWORD in .env the Google popup is filled automatically;
 * otherwise sign in by hand in the opened browser. Re-run when the session expires.
 */
import { chromium, type Page } from "@playwright/test";
import { AUTH_FILE, requireEnv } from "../shared/env";

const MANUAL_LOGIN_TIMEOUT_MS = 5 * 60_000;

async function fillGooglePopup(popup: Page, email: string, password: string) {
  await popup.getByRole("textbox", { name: /Email|メール|phone/i }).fill(email);
  await popup.getByRole("button", { name: /Next|次へ/i }).click();
  const passwordInput = popup.locator('input[name="Passwd"]');
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.fill(password);
  await popup.getByRole("button", { name: /Next|次へ/i }).click();

  // Unverified-app warning shows only for some accounts. "Advanced" is an <a href="#"> that
  // navigates away if clicked before Google's JS binds it, so wait for "load" first.
  const advanced = popup.locator("#details-button").or(popup.getByText("Advanced", { exact: true })).first();
  if (await advanced.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false)) {
    await popup.waitForLoadState("load");
    await advanced.click();
    await popup.locator("#proceed-link").or(popup.getByText(/Go to .+ \(unsafe\)/)).first().click();
  }

  // Up to two consent pages; each click must land on a loaded page and then leave it.
  const continueButton = popup.getByRole("button", { name: "Continue", exact: true });
  for (let step = 0; step < 2; step++) {
    if (!(await continueButton.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false))) break;
    const stepUrl = popup.url();
    await popup.waitForLoadState("load");
    await continueButton.click();
    await popup.waitForURL((url) => url.href !== stepUrl, { timeout: 15_000 }).catch(() => undefined);
  }
}

async function main() {
  const baseUrl = new URL(requireEnv("BASE_URL"));
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(baseUrl.href);
    if (email && password) {
      const popupPromise = page.waitForEvent("popup");
      await page.getByRole("button", { name: /Googleでサインイン/i }).click();
      await fillGooglePopup(await popupPromise, email, password);
    } else {
      console.log("TEST_EMAIL/TEST_PASSWORD not set: sign in with Google in the opened browser.");
    }
    await page.waitForURL(
      (url) => url.origin === baseUrl.origin && url.pathname.startsWith("/mail"),
      { timeout: MANUAL_LOGIN_TIMEOUT_MS },
    );
    await context.storageState({ path: AUTH_FILE });
    console.log(`Saved session to ${AUTH_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
