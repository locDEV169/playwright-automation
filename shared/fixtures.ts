import { test as base } from "playwright-bdd";

export const test = base.extend({
  // @unauthenticated scenarios start from an empty browser, even when playwright/.auth/user.json exists.
  storageState: async ({ $tags, storageState }, use) => {
    await use($tags.includes("@unauthenticated") ? { cookies: [], origins: [] } : storageState);
  },
});

export { expect } from "@playwright/test";
