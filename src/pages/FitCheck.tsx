import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import SEO from "@/components/SEO";
import StartScreen from "@/components/fit/StartScreen";
import QuestionScreen, { type Draft } from "@/components/fit/QuestionScreen";
import ResultScreen from "@/components/fit/ResultScreen";
import DetailsScreen from "@/components/fit/DetailsScreen";
import { EMPTY_DETAILS } from "@/components/fit/shared";
import DoneScreen from "@/components/fit/DoneScreen";
import { areasWithCost, calculateFitCheck, isReadySoon, type ContactReason } from "@/lib/fitCheck/calculate";
import { fitCheckAnswers, otherSystemName } from "@/lib/fitCheck/questions";
import { screensFor, type Screen } from "@/lib/fitCheck/screens";
import type { DetailsInput } from "@/lib/fitCheck/details";
import { countStep, forgetCounted } from "@/lib/fitCheck/count";
import type { CountStepId } from "@/lib/fitCheck/countSteps";
import { sendFitCheckLead } from "@/lib/fitCheck/lead";
import { clearProgress, loadProgress, saveProgress, sourceFromSearch, tabRunId } from "@/lib/fitCheck/progress";

// What the done screen offers. It travels with the person who finished, so Back can't change it.
interface DoneOffers {
  wantsCall: boolean;
  offerCall: boolean;
  inTouch: ContactReason | null;
}

type Step =
  | { name: "start" }
  | { name: "question"; index: number }
  | { name: "result" }
  | { name: "details" }
  | ({ name: "done" } & DoneOffers);

const typesIn = (draft: Draft) => draft.businessTypes as string[] | undefined;

// Only the answers to screens this visitor actually sees, so changing the
// business types later can't leave stale Bookings or Stock answers behind.
// The optional system name is left out when it isn't usable text.
const answersFor = (draft: Draft) => {
  const keys: string[] = screensFor(typesIn(draft)).flatMap((s) => s.fields.map((f) => f.key));
  if ((draft.mainTools as string[] | undefined)?.includes("other-system") && otherSystemName.safeParse(draft.otherSystem).success) {
    keys.push("otherSystem");
  }
  keys.push("timing");
  return Object.fromEntries(keys.filter((k) => draft[k] !== undefined).map((k) => [k, draft[k]]));
};

const isComplete = (screen: Screen, draft: Draft) =>
  screen.fields.every((f) => {
    const v = draft[f.key];
    return Array.isArray(v) ? v.length > 0 : v !== undefined;
  });

// kitsonexus.com/fit: the "Is Odoo right for your business?" check (Paper page I).
// Start, the questions, the free result, the details form and the done screen.
//
// Each screen is its own browser history entry, so a phone's back swipe goes
// to the previous question instead of leaving the check. Answers are saved in the
// browser, so a reload stays on the same screen and a return visit can continue.
// Details stay in memory only, so names and numbers are never left on the device.
const FitCheckPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [restored] = useState(() => loadProgress());
  const [draft, setDraft] = useState<Draft>(restored?.draft ?? {});
  // Where they came from: the address if it says, otherwise what was saved on an earlier visit.
  const [source] = useState(() => sourceFromSearch(location.search) ?? restored?.source ?? null);
  const [details, setDetails] = useState<DetailsInput>(EMPTY_DETAILS);
  // Who just finished. Memory only, and gone on a reload, so it can't reach the next person on a shared tablet.
  const [finished, setFinished] = useState<({ firstName: string; email: string } & DoneOffers) | null>(null);

  // History entries from an earlier visit count as the start.
  const [run] = useState(tabRunId);
  const saved = location.state as { step?: Step; run?: string } | null;
  const step: Step = saved?.run === run && saved.step ? saved.step : { name: "start" };
  const atDone = step.name === "done";

  // Opening the page isn't activity, so it doesn't restart the 14-day clock.
  const unchangedOnOpen = useRef(restored?.source === source);
  useEffect(() => {
    if (unchangedOnOpen.current) {
      unchangedOnOpen.current = false;
      return;
    }
    if (!finished && !atDone) saveProgress({ draft, source });
  }, [draft, source, finished, atDone]);

  const go = (next: Step) => navigate({ pathname: location.pathname, search: location.search }, { state: { step: next, run } });
  const back = () => navigate(-1);
  const start = () => go({ name: "question", index: 0 });

  const screens = screensFor(typesIn(draft));
  // Where to send someone whose answers have a gap.
  const firstGap = screens.findIndex((s) => !isComplete(s, draft));

  // One history entry per screen, so Back still walks through the earlier questions.
  const continueCheck = () => {
    const answered = firstGap === -1 ? screens.length : firstGap;
    for (let index = 0; index < answered; index++) go({ name: "question", index });
    go(firstGap === -1 ? { name: "result" } : { name: "question", index: firstGap });
  };
  const startAgain = () => {
    forgetCounted();
    countStep("opened", source);
    setDraft({});
    start();
  };

  const parsedAnswers = useMemo(() => {
    const parsed = fitCheckAnswers.safeParse(answersFor(draft));
    return parsed.success ? parsed.data : null;
  }, [draft]);
  const result = useMemo(() => (parsedAnswers ? calculateFitCheck(parsedAnswers) : null), [parsedAnswers]);

  // The screen actually drawn, for the drop-off counter.
  let reached: CountStepId | null = null;
  const question = (wanted: number) => {
    const index = Math.min(wanted, screens.length - 1);
    reached = screens[index].id as CountStepId;
    return (
      <QuestionScreen
        key={screens[index].id}
        screen={screens[index]}
        position={index + 1}
        total={screens.length}
        draft={draft}
        onAnswer={(key, value) => setDraft((d) => ({ ...d, [key]: value }))}
        onBack={back}
        onNext={() => go(index + 1 < screens.length ? { name: "question", index: index + 1 } : { name: "result" })}
      />
    );
  };
  let screen: JSX.Element;
  // Once finished, Back stays here: the answers and details are gone, so nothing can be sent twice.
  const doneOffers = finished ?? (step.name === "done" ? step : null);
  if (doneOffers) {
    screen = (
      <DoneScreen
        firstName={finished?.firstName}
        email={finished?.email}
        wantsCall={doneOffers.wantsCall}
        offerCall={doneOffers.offerCall}
        inTouch={doneOffers.inTouch}
      />
    );
  } else if (step.name === "question" && (step.index === 0 || typesIn(draft) !== undefined)) {
    screen = question(step.index);
  } else if ((step.name === "result" || step.name === "details") && !result && typesIn(draft) !== undefined) {
    screen = question(Math.max(firstGap, 0));
  } else if (step.name === "result" && result && parsedAnswers) {
    reached = "result";
    screen = (
      <ResultScreen
        result={result}
        answers={parsedAnswers}
        timing={draft.timing as string | undefined}
        onTiming={(id) => setDraft((d) => ({ ...d, timing: id }))}
        onGetReport={() => go({ name: "details" })}
      />
    );
  } else if (step.name === "details" && result && parsedAnswers) {
    reached = "details";
    screen = (
      <DetailsScreen
        areaCount={areasWithCost(result).length}
        followUp={result.temperature !== "cold"}
        value={details}
        onChange={setDetails}
        onBack={back}
        onSubmit={async (d, website) => {
          // Answers are only cleared once the server has them, so a failed send loses nothing.
          const outcome = await sendFitCheckLead({ answers: answersFor(draft), details: d, source, website });
          if (outcome !== "confirmed") return outcome;
          const offers: DoneOffers = {
            wantsCall: result.offersCall && isReadySoon(parsedAnswers.timing),
            offerCall: result.offersCall,
            inTouch: result.contactReason,
          };
          clearProgress();
          countStep("sent", source);
          forgetCounted();
          setFinished({ firstName: d.firstName, email: d.email, ...offers });
          setDetails(EMPTY_DETAILS);
          setDraft({});
          go({ name: "done", ...offers });
          return outcome;
        }}
      />
    );
  } else {
    // The start, or a later step whose answers are gone. Saved answers can be picked up again.
    const hasAnswers = Object.keys(draft).length > 0;
    reached = "opened";
    screen = <StartScreen onStart={hasAnswers ? startAgain : start} onContinue={hasAnswers ? continueCheck : undefined} />;
  }

  useEffect(() => {
    if (reached) countStep(reached, source);
  }, [reached, source]);

  return (
    <>
      <SEO path="/fit" />
      {screen}
    </>
  );
};

export default FitCheckPage;
