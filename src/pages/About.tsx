import SEO from "@/components/SEO";
import Hero, { HeroBadge, HeroLead, HeroTitle } from "@/components/hero/Hero";
import Story from "@/components/about/Story";
import Team from "@/components/about/Team";
import Values from "@/components/about/Values";
import Sectors from "@/components/about/Sectors";
import ReadyBanner from "@/components/ReadyBanner";
import { FitCheckBanner } from "@/components/fit/FitCheckPromo";

// About, as drawn on Paper page H (laptop) and K (hero and phone).
const AboutPage = () => (
  <main>
    <SEO path="/about" />
    <Hero>
      <HeroBadge>About us</HeroBadge>
      <HeroTitle>“Kitso” means knowledge.</HeroTitle>
      <HeroLead>In Setswana. We bring that knowledge to every engagement, bridging the gap between technology and the people who use it every day.</HeroLead>
    </Hero>
    <Story />
    <Team />
    <Values />
    <Sectors />
    <FitCheckBanner />
    <ReadyBanner />
  </main>
);

export default AboutPage;
