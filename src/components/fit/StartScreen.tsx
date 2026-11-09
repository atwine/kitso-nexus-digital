import { Link } from "react-router";
import KNLogo from "@/components/KNLogo";
import { FitShell, ScreenTitle, Tick } from "./parts";
import { primaryButton } from "./shared";

const PROMISES = [
  "An honest verdict: is Odoo right for you yet?",
  "The hours and Pula you lose, area by area",
  "A clear next step, even if Odoo isn't for you",
];

interface Props {
  onStart: () => void;
  // Given when this device has saved answers: the button picks up where they stopped.
  onContinue?: () => void;
}

// Screen 1 on Paper page I.
const StartScreen = ({ onStart, onContinue }: Props) => (
  <FitShell tone="teal">
    <header className="flex items-center justify-between px-6 pt-4">
      <Link to="/" className="flex items-center gap-2.5 text-[17px] font-semibold leading-[22px] text-white">
        <KNLogo className="size-[30px] rounded-[7px]" />
        Kitso Nexus
      </Link>
      <span className="text-sm font-semibold text-white/75">Fit check</span>
    </header>

    <div className="flex flex-col gap-[18px] px-6 pt-[72px] lg:pt-24">
      <p className="-rotate-2 self-start rounded-full bg-kn-lime px-3 py-1.5 text-[13px] font-bold leading-4 text-kn-night">
        Free · 4 minutes
      </p>
      <ScreenTitle className="flex flex-col gap-0.5 text-[44px] font-bold leading-[46px] tracking-[-0.045em]">
        <span className="text-white">Odoo isn't for everyone.</span>
        <span className="text-kn-lime">Is it right for you?</span>
      </ScreenTitle>
      <p className="text-[17px] leading-[26px] text-white/85">
        Answer up to 11 quick questions. Get an honest answer, and see what your current way of working costs you each
        year, in Pula.
      </p>
    </div>

    <ul className="flex flex-col gap-3.5 px-6 pt-8">
      {PROMISES.map((p) => (
        <li key={p} className="flex items-start gap-3 text-[15px] font-medium leading-[22px] text-white">
          <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-white/[0.12]">
            <Tick stroke="#A5C337" />
          </span>
          {p}
        </li>
      ))}
    </ul>

    <div className="min-h-10 grow" />

    <div className="flex flex-col gap-3.5 px-6 pb-10">
      <button type="button" onClick={onContinue ?? onStart} className={`${primaryButton} bg-kn-lime text-kn-night hover:bg-kn-lime/90`}>
        {onContinue ? "Continue where you left off →" : "Start the check →"}
      </button>
      {onContinue && (
        <button type="button" onClick={onStart} className="self-center text-[15px] font-semibold leading-5 text-white underline underline-offset-4">
          Start again
        </button>
      )}
      <p className="text-center text-[13px] leading-[18px] text-white/75">No sign-up to start · Official Odoo Learning Partner</p>
    </div>
  </FitShell>
);

export default StartScreen;
