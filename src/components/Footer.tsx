import { Link } from "react-router";
import { useConsent } from "@/hooks/use-consent";
import { consent } from "@/lib/consent";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import { FACEBOOK_URL, LINKEDIN_URL } from "@/lib/social";

const link = "underline-offset-4 hover:underline";
const dot = <span aria-hidden="true">&nbsp;·&nbsp;</span>;

// The Home & Contact footer from Paper page H; stacked on phones (page K).
// "Cookie settings" appears only once something on the site needs consent.
const Footer = () => {
  const { needed } = useConsent();

  return (
    <footer className="bg-kn-teal text-white">
      <div className="page-line flex flex-col gap-3.5 border-t border-[#FFFFEB33] pb-8 pt-7 text-[15px] leading-[22px] lg:text-sm xl:text-[15px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-7 lg:leading-[18px]">
        <p className="text-lg font-semibold leading-[22px]">Kitso Nexus Advisory</p>

        <p className="flex flex-col gap-1.5 lg:flex-row lg:gap-0">
          <span>Gaborone, Botswana</span>
          <span className="hidden lg:inline" aria-hidden="true">&nbsp;·&nbsp;</span>
          <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>
          <span className="hidden lg:inline" aria-hidden="true">&nbsp;·&nbsp;</span>
          <a href={PHONE_TEL} className={link}>{PHONE_DISPLAY}</a>
        </p>

        <p>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={link}>LinkedIn</a>
          {dot}
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a>
          {dot}
          <Link to="/fit" className={link}>Fit check</Link>
          {dot}
          <Link to="/privacy" className={link}>Privacy</Link>
          {needed && (
            <>
              {dot}
              <button type="button" onClick={consent.reopen} className={link}>Cookie settings</button>
            </>
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
