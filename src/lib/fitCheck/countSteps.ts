// The steps the drop-off counter knows, in the order people meet them. The server
// accepts only these names, and the morning email lists them in this order.
export const COUNT_STEPS = [
  { id: "opened", label: "Opened the check" },
  { id: "businessTypes", label: "Business type" },
  { id: "teamSize", label: "Team size" },
  { id: "cipa", label: "Registered" },
  { id: "mainTools", label: "Tools used" },
  { id: "decider", label: "Who decides" },
  { id: "missedSales", label: "Missed sales" },
  { id: "gettingPaid", label: "Getting paid" },
  { id: "diary", label: "Bookings", someOnly: true },
  { id: "betweenApps", label: "Time between apps" },
  { id: "stock", label: "Stock", someOnly: true },
  { id: "reports", label: "Reports" },
  { id: "result", label: "Saw their result" },
  { id: "details", label: "Details form" },
  { id: "sent", label: "Report sent" },
  { id: "report-opened", label: "Opened the report page", afterTheCheck: true },
  { id: "book", label: "Clicked to book", afterTheCheck: true },
] as const;

export type CountStepId = (typeof COUNT_STEPS)[number]["id"];
export const COUNT_STEP_IDS = COUNT_STEPS.map((s) => s.id) as [CountStepId, ...CountStepId[]];
