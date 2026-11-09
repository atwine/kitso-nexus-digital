// The industries shown on Home ("Built for your industry") and About
// ("Across sectors"). Manufacturing's text is from the Paper design; the others
// were drafted and approved by the owner on 4 Nov 2026. Non-profits & Churches
// was removed the same day: Kitso doesn't serve that sector.

export interface Industry {
  id: string;
  name: string; // the tab label on Home
  aboutName?: string; // the button label on About, when it differs
  aboutLine: string; // About's one sentence
  headline: string;
  line: string;
  modules: string[]; // typical Odoo apps
  oftenAdded: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    id: "manufacturing",
    aboutLine: "Production lines, inventory and supply-chain optimisation, set up in Odoo around how your floor really runs.",
    name: "Manufacturing",
    headline: "Manufacturing, on one screen",
    line: "Production lines, inventory and supply chain, connected to your accounts.",
    modules: ["Manufacturing", "Inventory", "Purchase", "Quality", "Accounting"],
    oftenAdded: ["Shop-floor automations", "AI demand reports", "Team training"],
  },
  {
    id: "equipment",
    aboutLine: "Asset tracking, maintenance scheduling and fleet management, set up in Odoo so every machine earns its keep.",
    name: "Equipment & Machinery",
    headline: "Every machine, tracked and serviced",
    line: "Asset tracking, maintenance schedules and field service, tied to billing.",
    modules: ["Maintenance", "Field Service", "Inventory", "Rental", "Accounting"],
    oftenAdded: ["Service reminders", "Technician phone app", "Parts reordering"],
  },
  {
    id: "professional-services",
    aboutLine: "Project billing, time tracking and resource planning, set up in Odoo so every billable hour reaches an invoice.",
    name: "Professional Services",
    headline: "Every hour billed, every project on track",
    line: "Time tracking, project billing and resource planning, linked to invoices.",
    modules: ["Projects", "Timesheets", "Planning", "Sales", "Accounting"],
    oftenAdded: ["Proposal templates", "Automatic invoicing", "AI status reports"],
  },
  {
    id: "retail",
    aboutName: "Retail & Distribution",
    aboutLine: "Point of sale, warehousing and order fulfilment, set up in Odoo around one live stock count.",
    name: "Retail",
    headline: "Shop, stock and till in sync",
    line: "Point of sale, warehousing and order fulfilment on one stock count.",
    modules: ["Point of Sale", "Inventory", "eCommerce", "Purchase", "Accounting"],
    oftenAdded: ["Reorder alerts", "Loyalty programme", "Staff training"],
  },
  {
    id: "construction",
    aboutLine: "Job costing, project management and subcontractor tracking, set up in Odoo so you see each job's margin as it happens.",
    name: "Construction",
    headline: "Every job costed as it happens",
    line: "Job costing, project management and subcontractor tracking, live.",
    modules: ["Projects", "Purchase", "Inventory", "Timesheets", "Accounting"],
    oftenAdded: ["Site reports from phones", "Budget alerts", "Team training"],
  },
];
