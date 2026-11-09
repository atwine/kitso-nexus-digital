import SEO from "@/components/SEO";
import Hero, { HeroActions, HeroBadge, HeroLead, HeroTitle } from "@/components/hero/Hero";
import { heroPrimary, heroSecondary } from "@/components/hero/heroStyles";
import Doors from "@/components/contact/Doors";
import MeetFredrick from "@/components/contact/MeetFredrick";
import FrontDesk from "@/components/contact/FrontDesk";
import WhatWeCover from "@/components/contact/WhatWeCover";
import NextSteps from "@/components/contact/NextSteps";
import Faq from "@/components/contact/Faq";
import FindUs from "@/components/contact/FindUs";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/contact";
import { FitCheckButton } from "@/components/fit/FitCheckPromo";

// Contact: the hero from Paper page J; below it, the owner's combination on page M.
// The FAQ and map are from pages H and K.
const ContactPage = () => (
  <main>
    <SEO path="/contact" />
    <Hero>
      <HeroBadge>Contact</HeroBadge>
      <HeroTitle className="lg:max-w-[820px]">How would you like to talk?</HeroTitle>
      <HeroLead>Have a question, need a quote, or ready to get started? Pick whatever's easiest.</HeroLead>
      <HeroActions>
        <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={heroPrimary}>
          Book a free consultation
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={heroSecondary}>
          WhatsApp us
        </a>
        <FitCheckButton />
      </HeroActions>
    </Hero>
    <Doors />
    <MeetFredrick />
    <FrontDesk />
    <WhatWeCover />
    <NextSteps />
    <Faq />
    <FindUs />
  </main>
);

export default ContactPage;
