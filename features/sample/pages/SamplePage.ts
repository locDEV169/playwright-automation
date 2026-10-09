import { expect, type Page, type Response } from "@playwright/test";
import { getSampleCase } from "../datasets/sample.dataset";

export class SamplePage {
  private response: Response | null = null;

  constructor(private readonly page: Page) {}

  async runCase(caseId: string) {
    const row = getSampleCase(caseId);
    switch (row.flow) {
      case "openPath":
        this.response = await this.page.goto(row.path);
        return;
    }
  }

  async expectCase(caseId: string) {
    const { expect: e } = getSampleCase(caseId);
    if (e.responseOk) expect(this.response?.ok(), `HTTP status ${this.response?.status()}`).toBe(true);
  }
}
