import { createBdd } from "playwright-bdd";
import { test } from "../fixtures";

const { When, Then } = createBdd(test);

When("the user runs sample case {string}", async ({ samplePage }, caseId: string) => {
  await samplePage.runCase(caseId);
});

Then("the sample case {string} should pass", async ({ samplePage }, caseId: string) => {
  await samplePage.expectCase(caseId);
});
