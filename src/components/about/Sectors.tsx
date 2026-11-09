import { KeyboardEvent, useRef, useState } from "react";
import { INDUSTRIES } from "@/data/industries";

// "Across sectors." One button per industry and one sentence for the chosen one
// (Paper page H; wrapping buttons on phones, page K). Arrow keys, Home and End
// move between them, as in Home's industry tabs.
const Sectors = () => {
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
    <section className="page-line bg-kn-stone pb-16 pt-14 lg:py-[120px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:gap-8">
        <div className="flex flex-col-reverse gap-1.5 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-[34px] leading-9 tracking-[-0.045em] lg:text-[52px] lg:leading-[54px]">Across sectors.</h2>
          <p className="text-sm leading-[18px] text-kn-muted lg:text-base lg:leading-5">Industries we serve</p>
        </div>
        <div role="tablist" aria-label="Industries" onKeyDown={onKeyDown} className="flex flex-wrap gap-2 lg:gap-3">
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`sector-tab-${ind.id}`}
              aria-selected={active === i}
              aria-controls="sector-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`rounded-full px-[18px] py-3 text-base font-medium leading-5 transition-colors lg:px-7 lg:py-[18px] lg:text-[22px] lg:leading-7 lg:tracking-[-0.02em] ${
                active === i ? "bg-kn-teal text-white" : "bg-white text-kn-night hover:bg-white/70"
              }`}
            >
              {ind.aboutName ?? ind.name}
            </button>
          ))}
        </div>
        <div
          id="sector-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`sector-tab-${industry.id}`}
          className="flex flex-col gap-2 rounded-[20px] bg-white p-[22px] lg:flex-row lg:items-center lg:gap-10 lg:p-8"
        >
          <p className="text-[13px] font-semibold leading-4 text-kn-olive lg:w-40 lg:shrink-0">Industry focus</p>
          <h3 className="text-[22px] leading-7 tracking-[-0.025em] lg:flex-1 lg:text-[26px] lg:leading-8">{industry.aboutName ?? industry.name}</h3>
          <p className="text-base leading-[25px] text-[#3C3A37] lg:flex-[1.4]">{industry.aboutLine}</p>
        </div>
      </div>
    </section>
  );
};

export default Sectors;
