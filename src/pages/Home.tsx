import { Link } from "react-router";
import SEO from "@/components/SEO";
import Hero, { HeroActions, HeroBadge, HeroLead, HeroTitle } from "@/components/hero/Hero";
import { heroPrimary, heroSecondary } from "@/components/hero/heroStyles";
import OdooPanel from "@/components/home/OdooPanel";
import Practices from "@/components/home/Practices";
import ServiceCards from "@/components/home/ServiceCards";
import Process from "@/components/home/Process";
import Proof from "@/components/home/Proof";
import IndustryExplorer from "@/components/home/IndustryExplorer";
import HomeCta from "@/components/home/HomeCta";
import WhereWeWork from "@/components/home/WhereWeWork";
import { BOOKING_URL } from "@/lib/contact";
import { FitCheckButton } from "@/components/fit/FitCheckPromo";

// Home, as drawn on Paper page H (laptop), J (hero) and K (phone).
const HomePage = () => (
  <main>
    <SEO path="/" />
    <Hero>
      <HeroBadge>Official Odoo Learning Partner · Gaborone</HeroBadge>
      <HeroTitle>Your business, running like it should.</HeroTitle>
      <HeroLead>ERP, custom software and AI training for Southern Africa. We learn how you work, then build around it.</HeroLead>
      <HeroActions>
        <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={heroPrimary}>
          Book a free consultation
        </a>
        <Link to="/services" className={heroSecondary}>
          Explore services
        </Link>
        <FitCheckButton />
      </HeroActions>
    </Hero>
    <OdooPanel />
    <Practices />
    <ServiceCards />
    <Process />
    <Proof />
    <IndustryExplorer />
    <HomeCta />
    <WhereWeWork />
  </main>
);

export default HomePage;
