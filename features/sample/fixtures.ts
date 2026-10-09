import { test as base } from "../../shared/fixtures";
import { SamplePage } from "./pages/SamplePage";

export const test = base.extend<{ samplePage: SamplePage }>({
  samplePage: async ({ page }, use) => use(new SamplePage(page)),
});
