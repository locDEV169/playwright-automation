import * as fs from "fs";
import { createBdd } from "playwright-bdd";
import { AUTH_FILE } from "../env";
import { expect, test } from "../fixtures";

const { Given } = createBdd(test);

// The only sign-in precondition in this repo. Session comes from `pnpm auth:login`.
Given("the user is signed in", async ({ page }) => {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error("Missing playwright/.auth/user.json. Run `pnpm auth:login` first.");
  }
  await page.goto("/mail");
  await expect(page, "Session expired. Run `pnpm auth:login` again.").not.toHaveURL(/\/login(\?|$)/);
});
