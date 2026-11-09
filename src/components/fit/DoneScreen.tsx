import type { ContactReason } from "@/lib/fitCheck/calculate";
import { BOOKING_URL, CONSULTATION_MINUTES, WHATSAPP_COMMUNITY_URL } from "@/lib/contact";
import { countStep } from "@/lib/fitCheck/count";
import { shareFitCheck } from "@/lib/fitCheck/share";
import { BackToSite, FitShell, ScreenTitle, Tick } from "./parts";
import { primaryButton } from "./shared";

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"
    />
  </svg>
);

// Screen 6 on Paper page I.
// Someone who wants it sorted soon picked "Email my report and book a call",
// so the booking card says the call is their next step.
// After a reload the name and email are gone on purpose, so the words stay general.
// Someone Odoo isn't right for yet isn't offered a call, and neither is someone who can't
// decide. If the sales representative will contact them instead, it says why.
const IN_TOUCH: Record<ContactReason, string> = {
  "custom-software": "We'll also be in touch about custom software.",
  "reach-decider": "We'll also be in touch to help you reach whoever decides.",
};

const DoneScreen = ({
  firstName,
  email,
  wantsCall = false,
  offerCall = true,
  inTouch = null,
}: {
  firstName?: string;
  email?: string;
  wantsCall?: boolean;
  offerCall?: boolean;
  inTouch?: ContactReason | null;
}) => (
  <FitShell tone="teal">
    <div className="flex flex-col gap-4 px-6 pt-[72px] lg:pt-12">
      <span className="flex size-16 items-center justify-center rounded-full bg-kn-lime">
        <Tick className="size-6" />
      </span>
      <ScreenTitle className="pt-4 text-[34px] font-bold leading-[38px] tracking-[-0.045em] text-white">
        Your report is on its way{firstName ? `, ${firstName}` : ""}.
      </ScreenTitle>
      <p className="text-base leading-6 text-white/85">
        Check <span className="break-all">{email ?? "your email"}</span> in a minute. Nothing there? Look in your spam folder.
      </p>
      {inTouch && <p className="text-base leading-6 text-white/85">{IN_TOUCH[inTouch]}</p>}
    </div>

    <div className="flex flex-col gap-3 px-6 pb-10 pt-7">
      {offerCall && (
        <section className="flex flex-col gap-2 rounded-3xl bg-white p-[22px]">
          <p className="text-xs font-bold uppercase leading-4 tracking-[0.06em] text-kn-olive">{wantsCall ? "Your next step · " : ""}Free · {CONSULTATION_MINUTES} minutes · Online</p>
          <h2 className="text-xl font-bold leading-[26px] tracking-[-0.02em] text-kn-night">{wantsCall ? "Now book your call" : "Book your report review"}</h2>
          <p className="text-[15px] leading-[22px] text-kn-body">
            We walk through your report with you and show what fixing your two weakest areas would look like.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => countStep("book", null)}
            className={`${primaryButton} mt-2 h-[52px] bg-kn-teal text-base text-white hover:bg-kn-teal/90`}
          >
            Pick a time
          </a>
        </section>
      )}
      <a
        href={WHATSAPP_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${primaryButton} h-14 gap-2.5 border-[1.5px] border-white/35 text-base font-semibold text-white hover:bg-white/10`}
      >
        <WhatsAppIcon />
        Join the WhatsApp community
      </a>
      <button
        type="button"
        onClick={shareFitCheck}
        className={`${primaryButton} h-14 border-[1.5px] border-white/35 text-base font-semibold text-white hover:bg-white/10`}
      >
        Send this check to a friend
      </button>
      <BackToSite tone="teal" className="pt-3" />
    </div>
  </FitShell>
);

export default DoneScreen;
