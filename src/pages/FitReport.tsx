import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { BackToSite, FitShell, ScreenTitle } from "@/components/fit/parts";
import { primaryButton } from "@/components/fit/shared";
import { BOOKING_URL, CONSULTATION_MINUTES, EMAIL, PHONE_DISPLAY, WHATSAPP_COMMUNITY_URL, WHATSAPP_URL } from "@/lib/contact";
import { calculateFitCheck, type Severity } from "@/lib/fitCheck/calculate";
import { countStep } from "@/lib/fitCheck/count";
import type { FitCheckAnswers } from "@/lib/fitCheck/questions";
import { buildReport, WHAT_IT_WONT_FIX, WHAT_ODOO_FIXES, type ReportCard } from "@/lib/fitCheck/reportContent";
import { loadReport, type ReportLookup } from "@/lib/fitCheck/reportPage";
import { shareFitCheck, shareReport } from "@/lib/fitCheck/share";
import { cn } from "@/lib/utils";

type Loaded = { status: "loading" } | ReportLookup;

const BAR: Record<Severity, string> = { small: "bg-[#4E9A5B]", "worth-fixing": "bg-[#D69A2D]", serious: "bg-[#C25C3D]" };
const REPORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Gaborone" });

const mainButton = `${primaryButton} h-[52px] bg-kn-lime text-base text-kn-night hover:bg-kn-lime/90`;
const outlineButton = `${primaryButton} h-[52px] border-[1.5px] border-white/40 text-base text-white hover:bg-white/10`;
const sectionTitle = "text-2xl font-bold leading-[30px] tracking-[-0.02em] text-kn-night";

const pillTone = (notYet: boolean, verdict: string) => (notYet ? "bg-[#3A6566] text-white" : verdict === "fit" ? "bg-white text-kn-teal" : "bg-kn-lime text-kn-night");

const PlanCard = ({ dark, eyebrow, title, lines, foot }: ReportCard) => (
  <div className={cn("flex flex-col gap-2 rounded-[20px] p-[22px]", dark ? "bg-kn-teal" : "bg-kn-stone")}>
    <p className={cn("text-[13px] font-bold leading-5", dark ? "text-kn-lime" : "text-kn-olive")}>{eyebrow}</p>
    <h3 className={cn("text-[19px] font-bold leading-[25px]", dark ? "text-white" : "text-kn-night")}>{title}</h3>
    {lines.map((line) => (
      <p key={line} className={cn("text-[15px] leading-[22px]", dark ? "text-white/90" : "text-kn-body")}>
        {line}
      </p>
    ))}
    {foot && <p className={cn("text-[15px] font-semibold leading-[22px]", dark ? "text-white" : "text-kn-night")}>{foot}</p>}
  </div>
);

const ReportBody = ({ answers, issuedAt, token }: { answers: FitCheckAnswers; issuedAt: Date; token: string }) => {
  const report = buildReport(answers, calculateFitCheck(answers));
  const { closing } = report;

  return (
    <main className="min-h-dvh bg-kn-stone [print-color-adjust:exact] lg:py-8 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[640px] overflow-hidden bg-white lg:rounded-[20px]">
        <header className="flex flex-col gap-3 bg-kn-teal px-6 pb-7 pt-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-bold leading-5 text-white">Kitso Nexus</p>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border-[1.5px] border-white/40 px-3.5 py-2 text-sm font-semibold leading-[18px] text-white hover:bg-white/10 print:hidden"
            >
              Save as PDF or print
            </button>
          </div>
          <p className="pt-2 text-[13px] font-semibold leading-5 text-white/75">Fit check report, {REPORT_DATE.format(issuedAt)}</p>
          <ScreenTitle className="text-[32px] font-bold leading-[38px] tracking-[-0.03em] text-white">Your fit check report</ScreenTitle>
          <p className="text-[15px] leading-[22px] text-white/85">{report.who}</p>
          <p className={cn("self-start rounded-full px-4 py-[9px] text-[15px] font-bold leading-[18px]", pillTone(report.notYet, report.verdict))}>{report.pill}</p>
          {report.why && <p className="pt-1 text-base leading-6 text-white/90">{report.why}</p>}
        </header>

        <section aria-label="Summary" className="flex flex-col gap-4 px-6 pt-6 lg:flex-row lg:gap-6 lg:px-8">
          {[
            [report.total, "slipping through the cracks each year"],
            [report.hours, report.timeLabel],
            [report.score, "business health score"],
          ].map(([figure, label]) => (
            <div key={label} className="flex flex-col lg:flex-1">
              <p className="text-[21px] font-extrabold leading-7 text-kn-night">{figure}</p>
              <p className="text-sm leading-5 text-kn-body">{label}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col px-6 pt-7 lg:px-8">
          <h2 className={sectionTitle}>Area by area</h2>
          <p className="pt-1 text-[13px] leading-5 text-kn-muted">Most costly first. Cost per year.</p>
          <ul className="pt-1.5">
            {report.areas.map((area, i) => (
              <li key={area.id} className={cn("flex flex-col gap-2 py-3.5", i > 0 && "border-t border-[#E3E3E3]")}>
                <div className="flex justify-between gap-3 text-[15px] font-bold leading-[22px] text-kn-night">
                  <span>{area.label}</span>
                  <span className="text-right">{area.cost}</span>
                </div>
                <p className="text-sm leading-[21px] text-kn-body">{area.story}</p>
                <div aria-hidden="true" className="h-1.5 rounded bg-[#F2F0EB]">
                  <div className={cn("h-1.5 rounded", BAR[area.severity])} style={{ width: `${area.barPercent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 px-6 pt-4 lg:px-8">
          <h2 className={sectionTitle}>{report.planHeading}</h2>
          {report.plan.map((card) => (
            <PlanCard key={card.title} {...card} />
          ))}
        </section>

        {!report.notYet && (
          <section aria-label="What to expect" className="flex flex-col gap-2 px-6 pt-4 text-[15px] leading-[22px] text-kn-body lg:px-8">
            <p>
              <strong>What Odoo will fix.</strong> {WHAT_ODOO_FIXES}
            </p>
            <p>
              <strong>What it won't fix on its own.</strong> {WHAT_IT_WONT_FIX}
            </p>
          </section>
        )}

        <section className="px-3 pt-5 lg:px-4 print:hidden">
          <div className="flex flex-col gap-2.5 rounded-[20px] bg-kn-teal px-[22px] py-[26px]">
            <h2 className="text-[23px] font-bold leading-[29px] text-white">{closing.title}</h2>
            {closing.main ? (
              <>
                <p className="pb-1.5 text-[15px] leading-[22px] text-white/90">{closing.body}</p>
                {closing.main.kind === "book" ? (
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={() => countStep("book", null)} className={mainButton}>
                    {closing.main.label}
                  </a>
                ) : (
                  <Link to="/fit" className={mainButton}>
                    {closing.main.label}
                  </Link>
                )}
                <button type="button" onClick={shareFitCheck} className={outlineButton}>
                  Send this check to a friend
                </button>
              </>
            ) : (
              <>
                <p className="pb-1.5 text-[15px] leading-[22px] text-white/90">Send them this page. It has everything they need.</p>
                <button type="button" onClick={() => shareReport(token)} className={outlineButton}>
                  Share this report
                </button>
                <div aria-hidden="true" className="my-2.5 h-px bg-white/20" />
                <h2 className="text-[19px] font-bold leading-[25px] text-white">If you make the decision here</h2>
                <p className="pb-1.5 text-[15px] leading-[22px] text-white/90">Book a free {CONSULTATION_MINUTES}-minute review. We go through this report with you, online.</p>
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={() => countStep("book", null)} className={mainButton}>
                  Book a review
                </a>
              </>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-1.5 px-6 pb-[26px] pt-5 text-[13px] leading-5 text-kn-body lg:px-8">
          <p>
            Kitso Nexus Advisory · Gaborone · {EMAIL} · {PHONE_DISPLAY}
          </p>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="self-start font-semibold text-kn-teal underline print:hidden">
            Join the WhatsApp community
          </a>
        </footer>
      </div>
    </main>
  );
};

const LinkNotWorking = () => (
  <FitShell tone="teal">
    <div className="flex flex-col gap-3.5 px-6 pb-8 pt-[72px] lg:pt-12">
      <ScreenTitle className="text-[34px] font-bold leading-[38px] tracking-[-0.04em] text-white">This report link isn't working.</ScreenTitle>
      <p className="text-base leading-6 text-white/85">Report links last 6 months, so this one may have expired, or part of it may be missing. The check is free and takes 4 minutes.</p>
      <Link to="/fit" className={`${primaryButton} mt-3.5 bg-kn-lime text-base text-kn-night hover:bg-kn-lime/90`}>
        Take the check again
      </Link>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${primaryButton} border-[1.5px] border-white/35 text-base font-semibold text-white hover:bg-white/10`}>
        Ask us on WhatsApp
      </a>
      <BackToSite tone="teal" className="pt-3" />
    </div>
  </FitShell>
);

const CouldNotOpen = () => (
  <FitShell tone="teal">
    <div className="flex flex-col gap-3.5 px-6 pb-8 pt-[72px] lg:pt-12">
      <ScreenTitle className="text-[34px] font-bold leading-[38px] tracking-[-0.04em] text-white">We couldn't open your report just now.</ScreenTitle>
      <p className="text-base leading-6 text-white/85">Your link is probably fine. Check your connection and try again.</p>
      <button type="button" onClick={() => window.location.reload()} className={`${primaryButton} mt-3.5 bg-kn-lime text-base text-kn-night hover:bg-kn-lime/90`}>
        Try again
      </button>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${primaryButton} border-[1.5px] border-white/35 text-base font-semibold text-white hover:bg-white/10`}>
        Ask us on WhatsApp
      </a>
    </div>
  </FitShell>
);

// /fit/report#<link>: the report from the email, as a page that can be forwarded or
// saved (Paper page L). The link sits after the # so it never reaches server logs.
const FitReport = () => {
  const token = useLocation().hash.slice(1);
  const [loaded, setLoaded] = useState<Loaded>(token ? { status: "loading" } : { status: "invalid" });

  // Someone's business figures don't belong in search results.
  useEffect(() => {
    document.title = "Your fit check report | Kitso Nexus";
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robots = existing ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
    const before = robots.content;
    robots.content = "noindex";
    return () => {
      if (existing) robots.content = before;
      else robots.remove();
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let current = true;
    void loadReport(token).then((report) => {
      if (!current) return;
      setLoaded(report);
      if (report.status === "ready") countStep("report-opened", null);
    });
    return () => {
      current = false;
    };
  }, [token]);

  if (loaded.status === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-kn-teal">
        <p role="status" className="text-base leading-6 text-white/85">
          Opening your report…
        </p>
      </main>
    );
  }
  if (loaded.status === "invalid") return <LinkNotWorking />;
  if (loaded.status === "unreachable") return <CouldNotOpen />;
  return <ReportBody answers={loaded.answers} issuedAt={loaded.issuedAt} token={token} />;
};

export default FitReport;
