/**
 * Test local des 4 emails sans passer par Gmail ni l'API HTTP.
 * Usage : npx tsx tests/run-tests.ts
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

import { extractLead } from "../lib/extractor";
import { generateDraft } from "../lib/draft";

const EMAILS_DIR = join(__dirname, "emails");

async function main() {
  const files = readdirSync(EMAILS_DIR).filter((f) => f.endsWith(".txt")).sort();

  for (const file of files) {
    const raw = readFileSync(join(EMAILS_DIR, file), "utf-8");
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Test : ${file}`);
    console.log("=".repeat(60));

    const lead = await extractLead(raw);
    const draft = await generateDraft(lead);

    console.log(JSON.stringify(lead, null, 2));
    console.log(`\nBrouillon : ${draft.slice(0, 150)}${draft.length > 150 ? "..." : ""}`);
    console.log(`Score confiance : ${lead.score_confiance} ${lead.score_confiance < 0.3 ? "⚠️  BAS" : "✓"}`);
  }
}

main().catch(console.error);
