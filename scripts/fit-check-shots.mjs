// Walks through the fit check as the sample car workshop and screenshots every
// screen at phone and laptop width, for checking against Paper page I.
// Usage: node scripts/fit-check-shots.mjs <base-url> <out-dir>
//   node scripts/fit-check-shots.mjs http://127.0.0.1:8080 shots/fit
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [baseUrl, outDir] = process.argv.slice(2);
if (!baseUrl || !outDir) {
  console.error("Usage: node scripts/fit-check-shots.mjs <base-url> <out-dir>");
  process.exit(1);
}

const WIDTHS = { phone: 390, laptop: 1440 };

// Each step: what to pick on the screen (by label, optionally inside a named
// question group), then the shot name.
const STEPS = [
  { name: "02-business-type", picks: ["Equipment & Machinery"] },
  { name: "03-team", picks: ["6–20"] },
  { name: "04-cipa", picks: ["Yes, with CIPA in Botswana"] },
  { name: "05-main-tools", picks: ["Excel or Google Sheets", "WhatsApp", "Another system"], text: [/Which system/, "Sage Evolution"] },
  { name: "06-decider", picks: ["Yes, it's my call"] },
  { name: "09-missed-sales", picks: ["30 to 100", "About a quarter"], amount: ["If one of those enquiries had become a sale, how much would the customer usually pay?", "3500"] },
  { name: "10-getting-paid", picks: ["P2 million to P10 million", "60 to 90 days", "Now and then"] },
  { name: "11-diary", picks: ["50 to 150", "About 1 in 10"], amount: ["When one of those bookings is lost, how much money do you lose?", "800"] },
  { name: "12-between-apps", picks: [["apps, spreadsheets", "4 to 6"], ["people do admin", "2 or 3"], "5 to 10 hours"] },
  { name: "13-stock", picks: ["P500,000 to P2 million", "Every month"] },
  { name: "14-reports", picks: ["About a week", "Fairly sure"] },
];

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [widthName, width] of Object.entries(WIDTHS)) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const shot = (name) => page.screenshot({ path: path.join(outDir, `${name}-${widthName}.png`), fullPage: true, animations: "disabled" });

    await page.goto(new URL("/fit", baseUrl).href, { waitUntil: "networkidle" });
    await shot("01-start");
    await page.getByRole("button", { name: /Start the check/ }).click();

    for (const step of STEPS) {
      for (const pick of step.picks) {
        const target = Array.isArray(pick)
          ? page.getByRole("group", { name: new RegExp(pick[0]) }).getByText(pick[1], { exact: true })
          : page.getByText(pick, { exact: true });
        await target.click();
      }
      if (step.amount) await page.getByLabel(step.amount[0]).fill(step.amount[1]);
      if (step.text) await page.getByLabel(step.text[0]).fill(step.text[1]);
      await shot(step.name);
      await page.getByRole("button", { name: "Next" }).click();
    }

    await shot("15-result");
    await page.getByText("Now", { exact: true }).click();
    await shot("15b-result-now");
    await page.getByRole("button", { name: /^Email m/ }).click();
    await page.getByRole("button", { name: "Send my report" }).click();
    await shot("16-details-errors");
    await page.getByLabel("First name").fill("Thabo");
    await page.getByLabel("Business name").fill("Tlotlo Auto Parts & Service");
    await page.getByLabel("Email", { exact: true }).fill("thabo@tlotloauto.co.bw");
    await page.getByLabel("WhatsApp number").fill("71 234 567");
    await shot("17-details");
    await page.getByRole("button", { name: "Send my report" }).click();
    await shot("18-done");
    await context.close();
    console.log(`${widthName}: done`);
  }
} finally {
  await browser.close();
}
