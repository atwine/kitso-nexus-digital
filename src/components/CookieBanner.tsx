import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { useConsent } from "@/hooks/use-consent";
import { consent, isAsking } from "@/lib/consent";

// Both buttons share the width on phones; on laptops they size to their text.
const choiceButton = "flex-1 px-4 text-[15px] font-semibold leading-[18px] lg:flex-none lg:px-[22px]";

// "Your choice" (Paper page K, sprint 6): full width at the bottom of a phone,
// a 440px card at the bottom left of a laptop. It shows only while something
// on the site waits for an OK and this browser hasn't answered (see
// lib/consent.ts). It sits in the bottom dock in App, under the WhatsApp button.
const CookieBanner = () => {
  const state = useConsent();
  if (!isAsking(state)) return null;

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="pointer-events-auto flex flex-col gap-3.5 self-stretch rounded-[20px] bg-white p-5 shadow-[0_12px_32px_rgb(20_20_19/0.25)] lg:w-[440px] lg:self-auto lg:px-6 lg:py-[22px]"
    >
      <h2 id="cookie-banner-title" className="text-[17px] leading-[22px] tracking-[-0.02em]">
        Your choice
      </h2>
      <p className="text-sm leading-[21px] text-kn-body">
        The site works without tracking cookies. With your OK, we'd also use some to see what helps people.{" "}
        <Link to="/privacy#cookies" className="text-kn-teal underline decoration-1">
          Privacy notice
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => consent.choose("accepted")}
          className={buttonVariants({ variant: "teal", className: `${choiceButton} h-auto py-[13px] lg:py-3` })}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => consent.choose("declined")}
          className={buttonVariants({ variant: "outlineDark", className: `${choiceButton} h-auto py-3 lg:py-[11px]` })}
        >
          No thanks
        </button>
      </div>
    </section>
  );
};

export default CookieBanner;
