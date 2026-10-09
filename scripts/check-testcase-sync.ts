/**
 * pnpm check:sync — exit 1 when CSV ↔ dataset ↔ Examples ↔ tester docs are out of sync.
 * Dataset files must export `DATASET` (record of rows with id / tc / flow).
 */
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import { checkSync, readExampleCaseIds, readTestcases, type DatasetCase } from "./lib/testcase-sync";

const ROOT = path.resolve(__dirname, "..");
const CSV_DIR = path.join(ROOT, "docs", "testcases");

function walk(dir: string, accept: (file: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, accept);
    return accept(full) ? [full] : [];
  });
}

const relative = (file: string) => path.relative(ROOT, file).split(path.sep).join("/");

/** features/{domain}/{datasets|tests}/x → {domain} */
function domainOf(file: string, folder: "datasets" | "tests") {
  const rel = relative(file);
  return rel.slice("features/".length, rel.lastIndexOf(`/${folder}/`));
}

async function main() {
  const csvFiles = walk(CSV_DIR, (file) => file.endsWith(".csv"));
  if (csvFiles.length !== 1) throw new Error(`Expected exactly one CSV in docs/testcases, found ${csvFiles.length}`);
  const testcases = readTestcases(fs.readFileSync(csvFiles[0], "utf8"));

  const datasets: Record<string, DatasetCase[]> = {};
  for (const file of walk(path.join(ROOT, "features"), (f) => f.endsWith(".dataset.ts"))) {
    const mod = await import(pathToFileURL(file).href);
    if (!mod.DATASET) throw new Error(`${relative(file)} must export DATASET`);
    const domain = domainOf(file, "datasets");
    datasets[domain] = [...(datasets[domain] ?? []), ...(Object.values(mod.DATASET) as DatasetCase[])];
  }

  const examples: Record<string, string[]> = {};
  for (const file of walk(path.join(ROOT, "features"), (f) => f.endsWith(".feature"))) {
    const domain = domainOf(file, "tests");
    examples[domain] = [...(examples[domain] ?? []), ...readExampleCaseIds(fs.readFileSync(file, "utf8"))];
  }

  const scenarioText = walk(path.join(ROOT, "docs", "scenario"), (f) => f.endsWith("_TESTER_VERIFY.md"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  const sources = ["features", "shared"]
    .flatMap((dir) => walk(path.join(ROOT, dir), (f) => f.endsWith(".ts")))
    .map((file) => ({ file: relative(file), text: fs.readFileSync(file, "utf8") }));

  const issues = checkSync({ testcases, datasets, examples, scenarioText, sources });
  const errors = issues.filter((issue) => issue.level === "error");
  for (const issue of issues) console.log(`${issue.level === "error" ? "ERROR" : "warn "} ${issue.message}`);

  const auto = testcases.filter((row) => row.automation === "Auto").length;
  const untriaged = testcases.filter((row) => !row.automation).length;
  console.log(
    `\n${testcases.length} TC rows (${auto} Auto, ${untriaged} not triaged) · ` +
      `${Object.values(datasets).flat().length} dataset rows · ${errors.length} error(s)`,
  );
  process.exit(errors.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
