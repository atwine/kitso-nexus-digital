import { useEffect } from "react";
import { useLocation } from "react-router";
import SEO from "@/components/SEO";
import Hero, { HeroBadge, HeroLead, HeroTitle } from "@/components/hero/Hero";
import ErpServices from "@/components/services/ErpServices";
import Coverage from "@/components/services/Coverage";
import CustomSoftware from "@/components/services/CustomSoftware";
import Academy from "@/components/services/Academy";
import ReadyBanner from "@/components/ReadyBanner";
import { FitCheckBanner } from "@/components/fit/FitCheckPromo";

// The hero's buttons jump to each practice; nothing is hidden (owner's choice, 4 Nov).
const JUMPS = [
  { label: "All", href: "#top" },
  { label: "ERP", href: "#erp" },
  { label: "Custom software", href: "#custom-software" },
  { label: "Training & academy", href: "#academy" },
];

// Services, as drawn on Paper page H (laptop) and K (hero and phone).
const ServicesPage = () => {
  const { hash } = useLocation();

  // A shared link such as /services#academy arrives before the sections are on
  // the page, so the browser can't jump to them itself; jump once they are.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
  <main id="top">
    <SEO path="/services" />
    <Hero>
      <HeroBadge>Services</HeroBadge>
      <HeroTitle>What we do</HeroTitle>
      <HeroLead>ERP, custom software and training for businesses across Southern Africa. From strategy to support, we've got you covered.</HeroLead>
      <nav aria-label="Jump to a practice" className="flex flex-wrap gap-2 pt-1.5 lg:pt-2">
        {JUMPS.map((jump, i) => (
          <a
            key={jump.href}
            href={jump.href}
            className={`rounded-full px-4 py-2.5 text-sm leading-[18px] transition-colors lg:py-[9px] ${
              i === 0 ? "bg-white font-semibold text-kn-night" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {jump.label}
          </a>
        ))}
      </nav>
    </Hero>
    <ErpServices />
    <Coverage />
    {/* After the ERP practice (its services and the stage table), before Custom software. */}
    <FitCheckBanner />
    <CustomSoftware />
    <Academy />
    <ReadyBanner />
  </main>
  );
};

export default ServicesPage;
