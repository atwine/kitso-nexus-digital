import { useId } from "react";
import { adviceFor } from "@/lib/fitCheck/advice";
import { areasWithCost, isReadySoon, type FitCheckResult, type Severity } from "@/lib/fitCheck/calculate";
import type { FitCheckAnswers } from "@/lib/fitCheck/questions";
import { TIMING } from "@/lib/fitCheck/questions";
import { cn } from "@/lib/utils";
import KNLogo from "@/components/KNLogo";
import { BackToSite, FitShell, ScreenTitle, Tick } from "./parts";
import { formatRange, primaryButton, verdictPill } from "./shared";

const RING = 2 * Math.PI * 76;

const ScoreRing = ({ score }: { score: number }) => (
  <div className="relative flex size-[180px] items-center justify-center">
    <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true" className="absolute inset-0">
      <circle cx="90" cy="90" r="76" fill="none" stroke="#FFFFFF26" strokeWidth="14" />
      <circle
        cx="90"
        cy="90"
        r="76"
        transform="rotate(-90 90 90)"
        fill="none"
        stroke="#A5C337"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * RING} ${RING}`}
      />
    </svg>
    <p className="flex flex-col items-center gap-0.5">
      <span className="text-[56px] font-extrabold leading-14 tracking-[-0.05em] text-white">{score}</span>
      <span className="text-[13px] font-medium leading-4 text-white/70">out of 100</span>
    </p>
  </div>
);

const Lock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
    <rect x="3" y="7" width="10" height="7" rx="2" fill="none" stroke="#6B6965" strokeWidth="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="#6B6965" strokeWidth="1.5" />
  </svg>
);

interface Props {
  result: FitCheckResult;
  answers: FitCheckAnswers;
  timing: string | undefined;
  onTiming: (id: string) => void;
  onGetReport: () => void;
}

// Screen 4, "score first", on Paper page I (the owner's pick), with the timing
// question under the Pula figure (Paper page L): asked once people have seen
// what they lose. "Now" or "Within 3 months" offers a call straight away.
const SEVERITY_STYLE: Record<Severity, { label: string; bar: string }> = {
  small: { label: "Small", bar: "bg-[#4E9A5B]" },
  "worth-fixing": { label: "Worth fixing", bar: "bg-[#D69A2D]" },
  serious: { label: "Serious", bar: "bg-kn-terracotta" },
};
const BAR_FULL_AT = 0.1; // a tenth of yearly sales fills the bar
const barWidth = (share: number) => Math.max(4, Math.min(100, (share / BAR_FULL_AT) * 100));
// One decimal under 10%, so 2.8% never rounds up to the 3% where "Serious" starts.
const shareText = (share: number) =>
  share < 0.01 ? "under 1%" : `about ${share < 0.1 ? String(Math.round(share * 1000) / 10) : Math.round(share * 100)}%`;

const VERDICT_STYLE = {
  "strong-fit": "bg-kn-lime text-kn-night",
  fit: "bg-white text-kn-teal",
  "not-yet": "bg-white/15 text-white",
} as const;

const STRONG_LINE = "You have the team, the size and enough slipping away for one system to pay for itself.";
const FIT_LINE = "Odoo can genuinely help. Start with one or two apps on your costliest problem, then look at the result together.";
const NOT_DECIDER_LINE = "Odoo could help your business, but the decision isn't yours. Share this result with whoever decides.";
const REGISTERING_LINE = "Odoo can genuinely help once your registration is done. Start with one or two apps on your costliest problem.";

const fitLine = (answers: FitCheckAnswers) =>
  answers.decider === "someone-else" ? NOT_DECIDER_LINE : answers.cipa === "in-progress" ? REGISTERING_LINE : FIT_LINE;

const ResultScreen = ({ result, answers, timing, onTiming, onGetReport }: Props) => {
  const notYet = result.verdict === "not-yet";
  const advice = notYet ? adviceFor(answers, result) : null;
  const shown = new Set(result.weakestTwo.map((a) => a.id));
  // Areas that lose nothing aren't shown: a zero could read as "all fine" or as a mistake.
  const locked = result.areas.filter((a) => !shown.has(a.id) && a.pula.high > 0);
  const two = result.weakestTwo.length === 2;
  const timingId = useId();
  const bookCall = result.offersCall && isReadySoon(timing);

  return (
    <FitShell tone="white">
      <section className="relative flex flex-col items-center gap-4 rounded-b-[28px] bg-kn-teal px-6 pb-8 pt-8 lg:rounded-[28px]">
        <KNLogo className="absolute left-5 top-5 size-7 rounded-md" />
        <p className="text-[13px] font-bold uppercase leading-4 tracking-[0.04em] text-kn-lime">Your free result</p>
        <ScoreRing score={result.score} />
        <ScreenTitle className="text-center text-[22px] font-bold leading-7 tracking-[-0.03em] text-white">
          <span className="sr-only">Your </span>Business health score<span className="sr-only">: {result.score} out of 100</span>
        </ScreenTitle>
        <div aria-live="polite" className="flex flex-col items-center gap-3">
          <p className={cn("flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold leading-[18px]", VERDICT_STYLE[result.verdict])}>
            {!notYet && <Tick className="size-3.5" stroke={result.verdict === "fit" ? "var(--color-kn-teal)" : undefined} />}
            {verdictPill(result, answers.decider)}
          </p>
          <p className="text-center text-[15px] leading-[22px] text-white/85">{advice ? advice.why : result.verdict === "strong-fit" ? STRONG_LINE : fitLine(answers)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 px-6 pt-7" aria-labelledby="stand">
        <h2 id="stand" className="text-lg font-bold leading-6 tracking-[-0.02em] text-kn-night">
          Where you stand
        </h2>
        {result.weakestTwo.length === 0 ? (
          <p className="text-[15px] leading-[22px] text-kn-body">We didn't find money slipping away in the areas you told us about.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {/* Most painful first. The bar fills on a 0 to 10% of yearly sales
                scale; its colour and word say how serious that is. */}
            {result.weakestTwo.map((area) => (
              <li key={area.id} className="flex flex-col gap-2">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-[15px] leading-5">
                  <span className="font-semibold text-kn-night">
                    {area.label}
                    {area.estimated && <span className="font-normal text-kn-muted"> (estimated)</span>}
                  </span>
                  <span className="shrink-0 text-right font-bold text-kn-night">{formatRange(area.pula.low, area.pula.high)} a year</span>
                </p>
                <div className="h-2 rounded-full bg-kn-card" aria-hidden="true">
                  <div className={cn("h-2 rounded-full", SEVERITY_STYLE[area.severity].bar)} style={{ width: `${barWidth(area.share)}%` }} />
                </div>
                <p className="flex items-center gap-2 text-[13px] leading-[18px] text-kn-body">
                  <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", SEVERITY_STYLE[area.severity].bar)} />
                  <span>
                    <span className="font-semibold text-kn-night">{SEVERITY_STYLE[area.severity].label}</span> · {shareText(area.share)} of your yearly sales
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!notYet && locked.length > 0 && (
        <section className="flex flex-col gap-3.5 px-6 pt-5" aria-label="In your full report">
          <ul className="flex flex-col gap-3.5">
            {locked.map((area) => (
              <li key={area.id} className="flex items-center gap-2.5">
                <Lock />
                <span className="grow text-[15px] font-medium leading-5 text-kn-body">{area.label}</span>
                {/* A made-up figure, blurred: the real one is only in the full report. */}
                <span aria-hidden="true" className="select-none text-[15px] font-bold leading-5 text-kn-night blur-[5px]">
                  P48,000 a year
                </span>
                <span className="sr-only">: figure in your full report</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!notYet && result.weakestTwo.length > 0 && <div className="px-6 pt-6">
        <div className="flex flex-col gap-1 rounded-2xl bg-kn-stone px-[18px] py-4">
          <p className="text-sm font-medium leading-5 text-kn-body">{two ? "Fixing these two areas" : "Fixing this area"} could be worth</p>
          <p className="text-[22px] font-extrabold leading-7 tracking-[-0.03em] text-kn-night">
            {formatRange(result.weakestTwoPula.low, result.weakestTwoPula.high)} a year
          </p>
        </div>
      </div>}

      {advice && (
        <section className="flex flex-col gap-4 px-6 pt-6" aria-labelledby="in-your-place">
          <div className="flex flex-col gap-3 rounded-2xl bg-kn-stone px-[18px] py-4">
            <h2 id="in-your-place" className="text-lg font-bold leading-6 tracking-[-0.02em] text-kn-night">
              What we'd do in your place
            </h2>
            <ul className="flex flex-col gap-2.5">
              {advice.steps.map((step) => (
                <li key={step} className="flex gap-2.5 text-[15px] leading-[22px] text-kn-body">
                  <Tick className="mt-1.5 size-3.5 shrink-0" stroke="var(--color-kn-teal)" />
                  {step}
                </li>
              ))}
            </ul>
            {advice.customSoftware && (
              <p className="text-[15px] leading-[22px] text-kn-body">If your system ever leaves a gap, we also build custom software.</p>
            )}
          </div>
          {advice.comeBackWhen.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[15px] font-bold leading-5 tracking-normal text-kn-night">Odoo starts to make sense when</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-[22px] text-kn-body">
                {advice.comeBackWhen.map((sign) => (
                  <li key={sign}>{sign}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {(!notYet || result.customSoftwareLead) && <fieldset className="flex flex-col gap-3 px-6 pt-[22px]">
        <legend id={timingId} className="float-left w-full text-lg font-bold leading-6 tracking-[-0.02em] text-kn-night">
          {notYet ? "If there's a gap you'd want closed, how soon?" : "How soon do you want this sorted?"}
        </legend>
        <div className="clear-left flex flex-wrap gap-2">
          {TIMING.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center rounded-full border-[1.5px] px-4 py-2.5 text-[15px] leading-[18px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-kn-teal",
                timing === option.id ? "border-kn-teal bg-kn-teal font-semibold text-white" : "border-[#E3E1DC] font-medium text-kn-night hover:border-kn-teal/50",
              )}
            >
              <input type="radio" name={timingId} value={option.id} checked={timing === option.id} onChange={() => onTiming(option.id)} className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>

      </fieldset>}

      <div className="min-h-6 grow" />

      <div className="flex flex-col gap-3 px-6 pb-10 pt-6">
        <button type="button" onClick={onGetReport} className={`${primaryButton} bg-kn-teal text-white hover:bg-kn-teal/90`}>
          {/* Report first, then the call: everyone who wants a call leaves their details. */}
          <span aria-live="polite">{bookCall ? "Email my report and book a call" : notYet ? "Email me this advice" : "Email me my full report"}</span>
        </button>
        <p className="text-center text-[13px] leading-[18px] text-kn-body">{notYet ? (result.contactReason ? "Free · We'll be in touch about custom software" : "Free · No sales call") : `Free · All ${areasWithCost(result).length} areas · Your next steps`}</p>
        <BackToSite />
      </div>
    </FitShell>
  );
};

export default ResultScreen;
