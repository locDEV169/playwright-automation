/**
 * Dataset: worked example of the CSV → dataset → Examples chain. Replace it when starting a real project.
 * Spec: docs/specs/sample/SAMPLE.md
 * Tester verify: docs/scenario/sample/SAMPLE_TESTER_VERIFY.md
 */

export type SampleCaseId = "homeOpens" | "homeOpensWithQuery";

export type SampleFlow = "openPath";

export type SampleCase = {
  id: SampleCaseId;
  tc: readonly string[];
  note: string;
  flow: SampleFlow;
  /** App path opened by the flow. */
  path: string;
  expect: {
    responseOk?: boolean;
  };
};

export const DATASET = {
  homeOpens: {
    id: "homeOpens",
    tc: ["TC_1"],
    note: "TC_1: open home page",
    flow: "openPath",
    path: "/",
    expect: { responseOk: true },
  },
  homeOpensWithQuery: {
    id: "homeOpensWithQuery",
    tc: ["TC_2"],
    note: "TC_2: open home page with query",
    flow: "openPath",
    path: "/?e2e=1",
    expect: { responseOk: true },
  },
} as const satisfies Record<SampleCaseId, SampleCase>;

export function getSampleCase(caseId: string): SampleCase {
  const row = (DATASET as Record<string, SampleCase>)[caseId];
  if (!row) {
    throw new Error(`Unknown sample case "${caseId}". Known: ${Object.keys(DATASET).join(", ")}`);
  }
  return row;
}
