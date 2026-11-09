import { KeyboardEvent, useRef, useState } from "react";
import { INDUSTRIES } from "@/data/industries";

// "Built for your industry": one tab per industry, each showing a headline, the typical
// Odoo apps and what is often added (Paper page H; phone version on page K,
// where the tabs scroll sideways). Arrow keys, Home and End move between tabs.
const IndustryExplorer = () => {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const industry = INDUSTRIES[active];

  const onKeyDown = (e: KeyboardEvent) => {
    const last = INDUSTRIES.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="bg-kn-teal pb-6 pt-14 lg:page-line lg:pt-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:gap-8">
        <h2 className="px-4 text-sm font-semibold leading-[18px] tracking-normal text-kn-lime sm:px-6 lg:px-0">
          Built for your industry
        </h2>
        <div
          role="tablist"
          aria-label="Industries"
          onKeyDown={onKeyDown}
          className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:flex-wrap lg:px-0"
        >
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`industry-tab-${ind.id}`}
              aria-selected={active === i}
              aria-controls="industry-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-[18px] py-[11px] text-[15px] font-medium leading-[18px] transition-colors ${
                active === i ? "bg-white text-kn-night" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>
        <div
          id="industry-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`industry-tab-${industry.id}`}
          className="flex flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:gap-4 lg:px-0"
        >
          <div className="flex flex-col gap-2.5 rounded-3xl bg-white/[0.07] p-6 lg:flex-[1.3] lg:gap-3 lg:p-8">
            <h3 className="text-[26px] leading-8 text-white lg:text-[32px] lg:leading-10">{industry.headline}</h3>
            <p className="text-base leading-[25px] text-white/[0.72]">{industry.line}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-3xl bg-white/[0.07] p-6 lg:flex-1 lg:gap-2.5 lg:p-8">
            <h4 className="text-[13px] font-normal leading-4 tracking-normal text-white/[0.68]">Typical Odoo modules</h4>
            <p className="text-[17px] leading-7 text-white lg:leading-[30px]">{industry.modules.join(" · ")}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-3xl bg-white/[0.07] p-6 lg:flex-1 lg:gap-2.5 lg:p-8">
            <h4 className="text-[13px] font-normal leading-4 tracking-normal text-white/[0.68]">Often added</h4>
            <p className="text-[17px] leading-7 text-white lg:leading-[30px]">{industry.oftenAdded.join(" · ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryExplorer;
