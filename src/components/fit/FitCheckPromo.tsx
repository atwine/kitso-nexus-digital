import { Link } from "react-router";
import { Tick } from "./parts";

// The ways into the fit check from the rest of the site (Paper page L).

// The third hero button on Home and Contact (Paper page L): lime outline and a tick.
export const FitCheckButton = () => (
  <Link
    to="/fit"
    className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full border-[1.5px] border-kn-lime bg-kn-lime/[0.12] pl-[22px] pr-[26px] text-base font-bold leading-5 text-kn-lime transition-colors hover:bg-kn-lime/20"
  >
    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-kn-lime">
      <Tick />
    </span>
    Is Odoo right for you? →
  </Link>
);

// Services, after the ERP practice; About, before "Ready when you are".
export const FitCheckBanner = () => (
  <section className="page-line bg-kn-stone pb-10 lg:pb-14" aria-labelledby="fit-banner">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3.5 rounded-3xl bg-kn-teal px-6 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:rounded-[28px] lg:px-14 lg:py-11">
      <div className="flex flex-col gap-3.5 lg:max-w-[720px]">
        <p className="self-start rounded-full bg-kn-lime px-3 py-1.5 text-xs font-bold leading-4 text-kn-night lg:px-3.5 lg:py-[7px] lg:text-[13px]">
          Free · 4 minutes
        </p>
        <h2 id="fit-banner" className="text-[28px] font-bold leading-8 tracking-[-0.04em] text-white lg:text-[40px] lg:leading-[44px] lg:tracking-[-0.045em]">
          Not sure Odoo is right for you?
        </h2>
        <p className="text-base leading-6 text-white/85 lg:text-lg lg:leading-7">
          Answer up to 11 quick questions. Get an honest verdict, and see what your current way of working costs you each year, in Pula.
        </p>
      </div>
      <Link
        to="/fit"
        className="mt-1.5 flex h-[52px] shrink-0 items-center justify-center rounded-full bg-kn-lime px-8 text-base font-bold leading-5 text-kn-night transition-colors hover:bg-kn-lime/90 lg:mt-0 lg:h-14 lg:text-[17px]"
      >
        Take the fit check →
      </Link>
    </div>
  </section>
);
