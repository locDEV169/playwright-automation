import { expect, type Page } from "@playwright/test";
import { requireEnv } from "../../../shared/env";
import { getAuthAccessCase } from "../datasets/authAccess.dataset";

function routePattern(appPath: string) {
  return new RegExp(`${appPath.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(\\?|$)`);
}

// Client-side JWT decode checks `exp` only; the signature is not verified in the browser.
function expiredJwt() {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: 1 })).toString("base64url");
  return `${header}.${payload}.e2e-expired-signature`;
}

export class AuthAccessPage {
  constructor(private readonly page: Page) {}

  async runCase(caseId: string) {
    const row = getAuthAccessCase(caseId);
    switch (row.flow) {
      case "openPath":
        return this.open(row.path!);
      case "callbackNoParams":
        return this.openCallback({});
      case "callbackInvalidParams":
        return this.openCallback({ code: "invalid-e2e-code", state: "invalid-e2e-state" });
      case "callbackErrorThenOpen":
        await this.openCallback({ code: "invalid-e2e-code", state: "invalid-e2e-state" });
        await this.page.waitForLoadState("networkidle");
        return this.open(row.path!);
      case "expiredJwtThenOpen":
        await this.setAccessToken(expiredJwt());
        return this.open(row.path!);
      case "malformedJwtThenOpen":
        await this.setAccessToken("not.a.valid.jwt");
        return this.open(row.path!);
    }
  }

  async expectCase(caseId: string) {
    const { expect: e } = getAuthAccessCase(caseId);
    if (e.accessTokenAbsent) await this.expectAccessTokenAbsent();
    if (e.staysOn) {
      await expect(this.page).not.toHaveURL(/\/login(\?|$)/);
      await expect(this.page).toHaveURL(routePattern(e.staysOn));
    }
    if (e.onLoginPage) await expect(this.page).toHaveURL(/\/login(\?|$)/);
    if (e.loginRedirectEquals !== undefined) expect(await this.loginRedirect()).toBe(e.loginRedirectEquals);
    if (e.loginRedirectContains !== undefined) expect(await this.loginRedirect()).toContain(e.loginRedirectContains);
    if (e.notOnRoute) await expect(this.page).not.toHaveURL(routePattern(e.notOnRoute));
    if (e.callbackErrorOutcome) {
      await expect(this.page).not.toHaveURL(/\/mail(\?|$)/);
      // Dedicated error route is not confirmed yet: login, callback or error page are all accepted.
      await expect(this.page).toHaveURL(/\/(login|auth\/callback|error)/);
    }
  }

  private async open(appPath: string) {
    await this.page.goto(appPath);
  }

  private async openCallback(query: Record<string, string>) {
    const params = new URLSearchParams(query).toString();
    await this.page.goto(`/auth/callback${params ? `?${params}` : ""}`);
  }

  private async setAccessToken(value: string) {
    const origin = new URL(requireEnv("BASE_URL"));
    await this.page.context().clearCookies();
    await this.page.context().addCookies([
      {
        name: "accessToken",
        value,
        domain: origin.hostname,
        path: "/",
        secure: origin.protocol === "https:",
        sameSite: "None",
        expires: Math.floor(Date.now() / 1000) + 86_400,
      },
    ]);
  }

  private async loginRedirect() {
    await expect(this.page).toHaveURL(/\/login\?redirect=/);
    return decodeURIComponent(new URL(this.page.url()).searchParams.get("redirect") ?? "");
  }

  private async expectAccessTokenAbsent() {
    await expect
      .poll(async () => (await this.page.context().cookies()).some((cookie) => cookie.name === "accessToken"))
      .toBe(false);
  }
}
