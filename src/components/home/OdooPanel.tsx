import { KeyboardEvent, useRef, useState } from "react";

// A small working picture of Odoo, just below the hero (Paper page H,
// "Product panel"; phone version on page K). Each app in the list is a tab
// that shows its own example screen; all figures are made-up examples.
// Every screen has the same shape (title, badge, three figures), so the panel
// never changes height when switching. Made clickable at the owner's request
// on 4 Nov 2026.
interface Screen {
  app: string;
  title: string;
  shortTitle: string; // for phones
  badge: string;
  shortBadge: string;
  stats: { label: string; value: string }[];
}

const SCREENS: Screen[] = [
  {
    app: "Inventory",
    title: "Stock overview · Gaborone warehouse",
    shortTitle: "Stock overview · Gaborone",
    badge: "Synced with Accounting",
    shortBadge: "Synced",
    stats: [
      { label: "Items in stock", value: "4,812" },
      { label: "Orders to ship today", value: "37" },
      { label: "Manual spreadsheets left", value: "0" },
    ],
  },
  {
    app: "Accounting",
    title: "Cash and invoices · November",
    shortTitle: "Cash and invoices",
    badge: "Bank feed connected",
    shortBadge: "Bank linked",
    stats: [
      { label: "Invoiced this month", value: "P 482,300" },
      { label: "Paid this month", value: "P 391,750" },
      { label: "Invoices overdue", value: "6" },
    ],
  },
  {
    app: "CRM",
    title: "Sales pipeline · this quarter",
    shortTitle: "Sales pipeline",
    badge: "Website leads arrive here",
    shortBadge: "Live leads",
    stats: [
      { label: "Open opportunities", value: "28" },
      { label: "Pipeline value", value: "P 1.2m" },
      { label: "Follow-ups due today", value: "5" },
    ],
  },
  {
    app: "Manufacturing",
    title: "Production · main workshop",
    shortTitle: "Production today",
    badge: "Linked to stock",
    shortBadge: "Linked",
    stats: [
      { label: "Work orders in progress", value: "12" },
      { label: "Units finished today", value: "340" },
      { label: "Orders running late", value: "0" },
    ],
  },
  {
    app: "HR & Payroll",
    title: "Team and payroll · November",
    shortTitle: "Team and payroll",
    badge: "Payslips ready",
    shortBadge: "Ready",
    stats: [
      { label: "Employees", value: "46" },
      { label: "Leave requests to approve", value: "3" },
      { label: "Payslips ready to send", value: "46" },
    ],
  },
  {
    app: "Projects",
    title: "Client projects · this week",
    shortTitle: "Client projects",
    badge: "Timesheets synced",
    shortBadge: "Synced",
    stats: [
      { label: "Active projects", value: "9" },
      { label: "Hours logged this week", value: "312" },
      { label: "Tasks overdue", value: "2" },
    ],
  },
];

const OdooPanel = () => {
  const [active, setActive] = useState(0);
  const desktopTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const phoneTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const screen = SCREENS[active];

  // Arrow keys (up/down on the laptop list, left/right on the phone row),
  // Home and End move between apps, as in any set of tabs.
  const onKeyDown = (tabs: typeof desktopTabs) => (e: KeyboardEvent) => {
    const last = SCREENS.length - 1;
    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    const next = forward ? (active === last ? 0 : active + 1)
      : back ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const tab = (tabs: typeof desktopTabs, i: number, prefix: string) => ({
    ref: (el: HTMLButtonElement | null) => {
      tabs.current[i] = el;
    },
    type: "button" as const,
    role: "tab",
    id: `${prefix}-tab-${i}`,
    "aria-selected": active === i,
    "aria-controls": `${prefix}-panel`,
    tabIndex: active === i ? 0 : -1,
    onClick: () => setActive(i),
  });

  return (
    <section
      aria-label="Example of Kitso's Odoo, with made-up figures"
      className="page-line bg-[linear-gradient(180deg,var(--color-kn-teal)_50%,var(--color-kn-stone)_50%)] pt-2 lg:bg-kn-teal lg:bg-none lg:pt-0"
    >
      {/* Laptop: the list of apps on the left picks the screen on the right. */}
      <div className="mx-auto hidden max-w-[1200px] gap-5 rounded-t-[20px] bg-kn-stone px-7 pt-7 lg:flex">
        <div className="flex w-[220px] shrink-0 flex-col gap-1 pb-7">
          <p className="px-2.5 py-1.5 text-xs uppercase leading-4 tracking-[0.08em] text-kn-muted">Your Odoo</p>
          <div role="tablist" aria-label="Odoo apps" aria-orientation="vertical" onKeyDown={onKeyDown(desktopTabs)} className="flex flex-col gap-1">
            {SCREENS.map((s, i) => (
              <button
                key={s.app}
                {...tab(desktopTabs, i, "odoo-desktop")}
                className={`rounded-[10px] px-3 py-[9px] text-left text-sm leading-[18px] text-kn-night transition-colors ${
                  active === i ? "bg-white font-semibold" : "hover:bg-white/60"
                }`}
              >
                {s.app}
              </button>
            ))}
          </div>
        </div>
        <div
          id="odoo-desktop-panel"
          role="tabpanel"
          aria-labelledby={`odoo-desktop-tab-${active}`}
          className="flex flex-1 flex-col gap-4 rounded-t-[14px] bg-white p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold leading-6 tracking-[-0.02em] text-kn-night">{screen.title}</h2>
            <p className="shrink-0 rounded-full bg-[#EEF4D6] px-3 py-1.5 text-[13px] font-semibold leading-4 text-kn-olive">{screen.badge}</p>
          </div>
          <dl className="flex gap-3.5">
            {screen.stats.map((stat) => (
              <div key={stat.label} className="flex flex-1 flex-col gap-1.5 rounded-xl bg-kn-card p-[18px]">
                <dt className="text-[13px] leading-4 text-kn-muted">{stat.label}</dt>
                <dd className="text-[30px] font-semibold leading-9 tracking-[-0.03em] text-kn-night">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Phone: one card; the row of apps scrolls sideways and picks the screen. */}
      <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgb(20_20_19/0.08)] lg:hidden">
        <div
          role="tablist"
          aria-label="Odoo apps"
          onKeyDown={onKeyDown(phoneTabs)}
          className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none]"
        >
          {SCREENS.map((s, i) => (
            <button
              key={s.app}
              {...tab(phoneTabs, i, "odoo-phone")}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] leading-4 transition-colors ${
                active === i ? "bg-kn-teal font-semibold text-white" : "bg-kn-card text-kn-night"
              }`}
            >
              {s.app}
            </button>
          ))}
        </div>
        <div id="odoo-phone-panel" role="tabpanel" aria-labelledby={`odoo-phone-tab-${active}`} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold leading-[22px] tracking-[-0.02em] text-kn-night">{screen.shortTitle}</h2>
            <p className="shrink-0 rounded-full bg-[#EEF4D6] px-2.5 py-[5px] text-xs font-semibold leading-4 text-kn-olive">{screen.shortBadge}</p>
          </div>
          <dl className="flex flex-col gap-3">
            {screen.stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl bg-kn-card px-4 py-3">
                <dt className="text-[13px] leading-4 text-kn-muted">{stat.label}</dt>
                <dd className="text-2xl font-semibold leading-[30px] tracking-[-0.03em] text-kn-night">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default OdooPanel;
