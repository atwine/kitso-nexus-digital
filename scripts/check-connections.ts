// One-off check that the website can reach Kitso's Odoo and send email from
// Google Workspace. Reads the real settings from `.env` (never committed).
//
//   npm run check:connections            creates one TEST lead and sends one test email
//   npm run check:connections -- --cleanup  deletes the TEST leads this check created
import fs from "node:fs";
import { readServerConfig } from "../netlify/lib/config.ts";
import { createGmailTransport, sendMail } from "../netlify/lib/mailer.ts";
import { createLeadForSales, createOdooClient } from "../netlify/lib/odoo.ts";

const TITLE_PREFIX = "TEST · Sprint 1 connection check";

// Print one plain line on failure: no stack trace, and never a setting's value.
process.on("uncaughtException", (err) => {
  console.error(`Stopped: ${err.message}`);
  process.exit(1);
});

if (!fs.existsSync(".env")) {
  console.error("No .env file yet. Copy .env.example to .env and fill in the real values.");
  process.exit(1);
}
process.loadEnvFile(".env");
const cfg = readServerConfig();
const odoo = createOdooClient({ url: cfg.ODOO_URL, db: cfg.ODOO_DB, apiKey: cfg.ODOO_API_KEY });

if (process.argv.includes("--cleanup")) {
  const ids = await odoo.call<number[]>("crm.lead", "search", {
    domain: [["name", "=like", `${TITLE_PREFIX}%`]],
    context: { active_test: false },
  });
  await odoo.deleteLeads(ids);
  console.log(`Deleted ${ids.length} test lead(s).`);
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
console.log("1. Odoo: creating a test lead...");
const id = await createLeadForSales(odoo, {
  title: `${TITLE_PREFIX} · ${stamp}`,
  contactName: "Website test",
  email: cfg.MAIL_FROM,
  notes: "Created by the Sprint 1 connection check.\nSafe to delete: run the check with --cleanup.",
  tags: ["TEST"],
  salespersonLogin: cfg.ODOO_SALESPERSON_LOGIN,
});
const lead = await odoo.readLead(id, ["name", "user_id"]);
const owner = Array.isArray(lead?.user_id) ? lead.user_id[1] : "nobody";
console.log(`   Created lead ${id}, assigned to ${owner}.`);
console.log(`   Open it: ${cfg.ODOO_URL}/web#id=${id}&model=crm.lead&view_type=form`);

console.log("2. Email: sending a test message...");
const messageId = await sendMail(createGmailTransport({ user: cfg.GMAIL_USER, appPassword: cfg.GMAIL_APP_PASSWORD }), `Kitso Nexus <${cfg.MAIL_FROM}>`, {
  to: cfg.ALERT_TO,
  subject: "Kitso website: test email (Sprint 1)",
  text: `This is the Sprint 1 test email from the Kitso website setup.\nIt was sent through ${cfg.GMAIL_USER} at ${stamp} UTC.\nThe test lead in Odoo is number ${id}.`,
});
console.log(`   Sent to ${cfg.ALERT_TO.join(", ")} (message ${messageId}).`);
console.log("Both connections work.");
