/**
 * Deterministic, check-only sync between the Excel CSV, datasets, feature Examples and tester docs.
 * Never generates or edits files.
 */

export const AUTOMATION_VALUES = ["Auto", "Manual", "Out", "Open", "Conflict"] as const;

export type CsvCase = {
  line: number;
  tc: string;
  section: string;
  expected: string;
  caseIds: string[];
  automation: string;
  domain: string;
  flow: string;
};

export type DatasetCase = { id: string; tc: readonly string[]; flow: string };

export type SyncInput = {
  testcases: CsvCase[];
  /** domain → dataset rows (all *.dataset.ts under features/{domain}/datasets) */
  datasets: Record<string, DatasetCase[]>;
  /** domain → caseIds used in Examples of features/{domain}/tests/*.feature */
  examples: Record<string, string[]>;
  /** Concatenated docs/scenario/**\/*_TESTER_VERIFY.md */
  scenarioText: string;
  /** Source files under features/ and shared/ */
  sources: { file: string; text: string }[];
};

export type Issue = { level: "error" | "warn"; message: string };

/** RFC 4180: quoted cells may contain commas, quotes ("") and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

/** Header row is the first row whose first cell is "No"; columns are read by name, not position. */
export function readTestcases(csvText: string): CsvCase[] {
  const rows = parseCsv(csvText);
  const headerIndex = rows.findIndex((row) => row[0]?.trim() === "No");
  if (headerIndex < 0) throw new Error('CSV header row not found (first cell must be "No")');
  const header = rows[headerIndex].map((name) => name.trim());
  const col = (row: string[], name: string) => {
    const index = header.indexOf(name);
    return index < 0 ? "" : (row[index] ?? "").trim();
  };

  const cases: CsvCase[] = [];
  let section = "";
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const no = col(row, "No");
    if (!/^TC_\d+$/.test(no)) {
      if (no && row.slice(1).every((cell) => !cell.trim())) section = no;
      return;
    }
    cases.push({
      line: headerIndex + offset + 2,
      tc: no,
      section,
      expected: col(row, "Expected results"),
      caseIds: col(row, "caseId").split(",").map((id) => id.trim()).filter(Boolean),
      automation: col(row, "Automation"),
      domain: col(row, "Domain"),
      flow: col(row, "Flow"),
    });
  });
  return cases;
}

/** caseIds from Examples tables that have a `caseId` column. */
export function readExampleCaseIds(featureText: string): string[] {
  const ids: string[] = [];
  const lines = featureText.split(/\r?\n/).map((line) => line.trim());
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("Examples:")) continue;
    let j = i + 1;
    while (j < lines.length && (!lines[j] || lines[j].startsWith("#"))) j++;
    const header = splitRow(lines[j] ?? "");
    const caseIdColumn = header.indexOf("caseId");
    for (j++; j < lines.length && lines[j].startsWith("|"); j++) {
      if (caseIdColumn >= 0) ids.push(splitRow(lines[j])[caseIdColumn]);
    }
  }
  return ids;
}

function splitRow(line: string) {
  return line.startsWith("|") ? line.slice(1, line.lastIndexOf("|")).split("|").map((cell) => cell.trim()) : [];
}

export function checkSync(input: SyncInput): Issue[] {
  const issues: Issue[] = [];
  const error = (message: string) => issues.push({ level: "error", message });
  const warn = (message: string) => issues.push({ level: "warn", message });

  const byTc = new Map<string, CsvCase[]>();
  for (const row of input.testcases) byTc.set(row.tc, [...(byTc.get(row.tc) ?? []), row]);
  const datasetTcs = new Set(Object.values(input.datasets).flat().flatMap((row) => row.tc));

  // CSV rows
  for (const row of input.testcases) {
    const where = `CSV line ${row.line} ${row.tc}`;
    if (row.automation && !(AUTOMATION_VALUES as readonly string[]).includes(row.automation)) {
      error(`${where}: Automation "${row.automation}" must be one of ${AUTOMATION_VALUES.join(" / ")}`);
    }
    if (row.automation !== "Auto") continue;
    if (!row.expected) error(`${where}: Automation=Auto but Expected results is blank (do not invent Expected)`);
    if (!row.domain) error(`${where}: Automation=Auto needs Domain`);
    if (!row.caseIds.length) error(`${where}: Automation=Auto needs caseId`);
    const rows = input.datasets[row.domain] ?? [];
    for (const caseId of row.caseIds) {
      const datasetRow = rows.find((candidate) => candidate.id === caseId);
      if (!datasetRow) {
        error(`${where}: caseId "${caseId}" not found in features/${row.domain}/datasets`);
        continue;
      }
      if (row.flow && datasetRow.flow !== row.flow) {
        error(`${where}: Flow "${row.flow}" but dataset row "${caseId}" has flow "${datasetRow.flow}"`);
      }
      if (!datasetRow.tc.includes(row.tc)) warn(`${where}: dataset row "${caseId}" does not list ${row.tc} in tc`);
    }
  }

  // Duplicate TC ids: blocking only when automation depends on them.
  const duplicates = [...byTc.entries()].filter(([, rows]) => rows.length > 1);
  const blocking = duplicates.filter(([tc, rows]) => datasetTcs.has(tc) || rows.some((row) => row.automation === "Auto"));
  for (const [tc, rows] of blocking) {
    error(`${tc} appears ${rows.length} times in CSV (lines ${rows.map((row) => row.line).join(", ")})`);
  }
  if (duplicates.length > blocking.length) {
    warn(`${duplicates.length - blocking.length} duplicate TC ids in CSV are not automated yet`);
  }

  // Datasets
  for (const [domain, rows] of Object.entries(input.datasets)) {
    const exampleIds = new Set(input.examples[domain] ?? []);
    const harness = rows.filter((row) => !row.tc.length).length;
    if (harness) warn(`features/${domain}: ${harness} harness case(s) with empty tc (not traced to CSV)`);
    for (const row of rows) {
      const where = `features/${domain} dataset "${row.id}"`;
      for (const tc of row.tc) {
        const csvRows = byTc.get(tc);
        if (!csvRows) error(`${where}: ${tc} not found in CSV`);
        else if (!csvRows.some((csvRow) => csvRow.automation === "Auto")) {
          error(`${where}: ${tc} is not marked Automation=Auto in CSV`);
        }
      }
      if (!exampleIds.has(row.id)) warn(`${where}: not used in any Examples table`);
      if (!input.scenarioText.includes(`[${row.id}]`)) warn(`${where}: no "[${row.id}]" section in TESTER_VERIFY docs`);
    }
  }

  // Examples
  for (const [domain, ids] of Object.entries(input.examples)) {
    const known = new Set((input.datasets[domain] ?? []).map((row) => row.id));
    for (const id of ids) {
      if (!known.has(id)) error(`features/${domain} Examples: caseId "${id}" not found in features/${domain}/datasets`);
    }
  }

  // Banned patterns
  for (const { file, text } of input.sources) {
    text.split(/\r?\n/).forEach((line, index) => {
      const where = `${file}:${index + 1}`;
      if (line.includes("waitForTimeout(") && !line.includes("allow-wait:")) {
        error(`${where}: waitForTimeout without an "allow-wait: <reason>" comment`);
      }
      if (/\.or\([^)]*locator\(\s*["'`](main|body|html)["'`]\s*\)/.test(line)) {
        error(`${where}: fallback assertion .or(locator("main"|"body"|"html")) always passes`);
      }
    });
  }

  return issues;
}
