import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router";
import SEO from "@/components/SEO";
import Hero, { HeroBadge, HeroLead, HeroTitle } from "@/components/hero/Hero";
import { EMAIL } from "@/lib/contact";

// Change this date whenever the notice's wording changes.
const LAST_UPDATED = "9 November 2026";

const Email = () => (
  <a href={`mailto:${EMAIL}`} className="text-kn-teal underline underline-offset-2">
    {EMAIL}
  </a>
);

const NoticeSection = ({ id, title, children }: { id?: string; title: string; children: ReactNode }) => (
  <section id={id} className="flex scroll-mt-6 flex-col gap-2.5">
    <h2 className="text-2xl leading-[30px] lg:text-[28px] lg:leading-[34px]">{title}</h2>
    <div className="flex flex-col gap-3 text-base leading-[26px] text-[#3C3A37] lg:text-[17px] lg:leading-7">{children}</div>
  </section>
);

// The privacy notice in plain words (Paper page K, sprint 6). It must describe
// what the site really does: when a sprint changes what the site collects, this
// page changes in the same sprint.
const PrivacyPage = () => {
  const { hash } = useLocation();

  // The cookie banner links to /privacy#cookies; jump there once the page is drawn.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <main>
      <SEO path="/privacy" />
      <Hero>
        <HeroBadge>Privacy notice</HeroBadge>
        <HeroTitle>Your details, in plain words.</HeroTitle>
        <HeroLead>What we collect, why, who sees it, and how to make us stop. Last updated {LAST_UPDATED}.</HeroLead>
      </Hero>

      <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-4 pb-16 pt-12 sm:px-6 lg:gap-10 lg:px-0 lg:py-24">
        <NoticeSection title="Who we are">
          <p>
            Kitso Nexus Advisory is an Odoo partner in Gaborone, Botswana. This notice covers kitsonexus.com. Questions about it go
            to <Email />.
          </p>
        </NoticeSection>

        <NoticeSection title="What we collect">
          <p>
            When you take the fit check: your answers, your name, your business name, your email, your WhatsApp number and whether
            your business is registered, with CIPA or in another country. Also whether you tick the boxes to join our WhatsApp
            community or get tips by email.
          </p>
          <p>
            When you send us a message: your name, your email and your message, and your company, industry and phone or WhatsApp
            number if you give them.
          </p>
        </NoticeSection>

        <NoticeSection title="Why">
          <p>
            To send you your fit check report, to answer your message, and to follow up about how we could help your business. We
            don't sell your details, and we don't give them to other companies for their marketing.
          </p>
        </NoticeSection>

        <NoticeSection title="Who sees it, and where it's kept">
          <p>
            The Kitso team. Your details go into our Odoo CRM, where we keep track of the people we talk to. Emails between us go
            through Google Workspace. Odoo and Google keep their data on servers outside Botswana. If you came from a flyer or a shared link, that label goes with your details, so we know how you found us. If you book a call, we keep your name, email and the booking with your enquiry. The link in your report email holds your answers, but not your name, email or number, and stops working after 6 months. Anyone you forward that link to can see that report.
          </p>
          <p>
            The website runs on Netlify, also outside Botswana. Like any web host, it keeps technical records such as IP addresses to
            run the site.
          </p>
        </NoticeSection>

        <NoticeSection id="cookies" title="Cookies and counters">
          <p>
            The site sets no tracking cookies. To see where people stop in the fit check, we count how many reach each step. The
            count keeps no names and no cookies, so it can't be linked to you.
          </p>
          <p>
            Your browser keeps a few small notes for this site. Until you close the tab, it remembers that you've already seen our
            "Before you go" message, so it doesn't show twice, a marker for your place in the fit check, so a reload keeps you
            on the same screen, and which fit check steps have been counted, so nothing is counted twice.
          </p>
          <p>
            It also keeps your fit check answers and any flyer or link you came from, so you can pick up where you left off. These
            stay on your device, and they don't include your name, email or phone number. They're cleared when you finish the
            check, and removed if you come back after more than 14 days away. "Start again" replaces your answers.
          </p>
          <p>If we ever add something that needs cookies, we'll ask you first and add it to this page.</p>
        </NoticeSection>

        <NoticeSection title="Other services you might use">
          <p>
            Booking a call opens Cal.com, and the WhatsApp button opens WhatsApp. What you share there reaches us, and those
            companies handle it under their own privacy terms. The LinkedIn, Facebook and Google Maps links open those sites,
            under their terms.
          </p>
        </NoticeSection>

        <NoticeSection title="Your choices">
          <p>
            You can stop our messages at any time: reply to any message from us, or email <Email />. Email us too if you'd like to
            see the details we hold about you, correct them, or have them deleted.
          </p>
        </NoticeSection>

        <NoticeSection title="Changes">
          <p>When what the site collects changes, we update this page and the date at the top.</p>
        </NoticeSection>
      </div>
    </main>
  );
};

export default PrivacyPage;
