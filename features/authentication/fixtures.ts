import { test as base } from "../../shared/fixtures";
import { AuthAccessPage } from "./pages/AuthAccessPage";

export const test = base.extend<{ authAccessPage: AuthAccessPage }>({
  authAccessPage: async ({ page }, use) => use(new AuthAccessPage(page)),
});
