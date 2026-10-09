import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";

const { When, Then } = createBdd(test);

When("the user runs auth access case {string}", async ({ authAccessPage }, caseId: string) => {
  await authAccessPage.runCase(caseId);
});

Then("the auth access case {string} should pass", async ({ authAccessPage }, caseId: string) => {
  await authAccessPage.expectCase(caseId);
});
