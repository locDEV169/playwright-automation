import assert from "node:assert/strict";
import { test } from "node:test";
import { checkSync, readExampleCaseIds, readTestcases, type SyncInput } from "./testcase-sync";

const CSV = [
  "Total,Pass",
  "No,Title,Pre-condition,Steps,Expected results,Results,caseId,Automation,Domain,Flow,Tag",
  "Login,,,,,,,,,,",
  'TC_1,Login ok,"pre\r\nline",1. open,"Mail opens",Untested,loginOk,Auto,authentication,openPath,',
  "TC_2,,pre,,,Untested,,Out,,,",
  "TC_3,Blank expected,pre,1. x,,Untested,blankCase,Auto,authentication,,",
  "TC_3,Dup,pre,1. x,y,Untested,,,,,",
].join("\r\n");

const FEATURE = `
  Scenario Outline: x
    Examples: [<caseId>] <note>
      | caseId  | note |
      | loginOk | a    |
      | ghost   | b    |
`;

function input(overrides: Partial<SyncInput> = {}): SyncInput {
  return {
    testcases: readTestcases(CSV),
    datasets: { authentication: [{ id: "loginOk", tc: ["TC_1"], flow: "openPath" }] },
    examples: { authentication: readExampleCaseIds(FEATURE) },
    scenarioText: "### [loginOk]",
    sources: [],
    ...overrides,
  };
}

const messages = (overrides?: Partial<SyncInput>) =>
  checkSync(input(overrides)).filter((issue) => issue.level === "error").map((issue) => issue.message);

test("reads CSV by column name, keeps multi-line cells and sections", () => {
  const rows = readTestcases(CSV);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], {
    line: 4,
    tc: "TC_1",
    section: "Login",
    expected: "Mail opens",
    caseIds: ["loginOk"],
    automation: "Auto",
    domain: "authentication",
    flow: "openPath",
  });
});

test("reports blank Expected, missing caseId, unknown Examples and blocking duplicates", () => {
  const errors = messages();
  assert.ok(errors.some((m) => m.includes("TC_3: Automation=Auto but Expected results is blank")));
  assert.ok(errors.some((m) => m.includes('caseId "blankCase" not found')));
  assert.ok(errors.some((m) => m.includes('Examples: caseId "ghost"')));
  assert.ok(errors.some((m) => m.startsWith("TC_3 appears 2 times")));
  assert.ok(!errors.some((m) => m.includes("loginOk")));
});

test("flags flow mismatch, banned patterns and dataset TC not marked Auto", () => {
  const errors = messages({
    datasets: {
      authentication: [
        { id: "loginOk", tc: ["TC_1"], flow: "otherFlow" },
        { id: "outCase", tc: ["TC_2"], flow: "openPath" },
      ],
    },
    sources: [
      { file: "a.ts", text: 'await page.waitForTimeout(500);\nexpect(x.or(page.locator("main"))).toBeVisible();' },
      { file: "b.ts", text: "await page.waitForTimeout(500); // allow-wait: debounce" },
    ],
  });
  assert.ok(errors.some((m) => m.includes('Flow "openPath" but dataset row "loginOk" has flow "otherFlow"')));
  assert.ok(errors.some((m) => m.includes("TC_2 is not marked Automation=Auto")));
  assert.ok(errors.some((m) => m.startsWith("a.ts:1: waitForTimeout")));
  assert.ok(errors.some((m) => m.startsWith("a.ts:2: fallback assertion")));
  assert.ok(!errors.some((m) => m.startsWith("b.ts")));
});
