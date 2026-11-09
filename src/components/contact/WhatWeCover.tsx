import { buttonVariants } from "@/components/ui/button";
import { BOOKING_URL, CONSULTATION_MINUTES } from "@/lib/contact";

const TOPICS = [
  { title: "Your day to day", detail: "How your business runs and which systems you use." },
  { title: "What's in the way", detail: "Where time and money are slipping away." },
  { title: "An honest answer", detail: "Whether Odoo fits, and sensible first steps." },
];

// What the free consultation covers (Paper page M).
const WhatWeCover = () => (
  <section aria-labelledby="cover-title" className="page-line py-12 lg:py-[88px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:flex-row lg:items-center lg:gap-12 xl:gap-[72px]">
      <img
        src="/images/clay/training-support.webp"
        alt=""
        width={1040}
        height={580}
        loading="lazy"
        decoding="async"
        className="h-[220px] w-full rounded-[20px] object-cover lg:h-[360px] lg:w-[360px] lg:shrink-0 lg:rounded-[28px] xl:w-[440px]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-[26px]">
        <h2 id="cover-title" className="text-[30px] font-bold leading-[34px] tracking-[-0.04em] lg:text-[40px] lg:leading-[44px]">
          What we'll cover in {CONSULTATION_MINUTES} minutes
        </h2>
        <ul className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          {TOPICS.map((topic) => (
            <li key={topic.title} className="flex flex-1 flex-col gap-1.5">
              <h3 className="text-lg font-semibold leading-6 tracking-normal">{topic.title}</h3>
              <p className="text-[15px] leading-[23px] text-kn-body">{topic.detail}</p>
            </li>
          ))}
        </ul>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "teal", className: "h-[50px] px-7 text-[15px] font-semibold leading-[18px] lg:self-start" })}
        >
          Choose a time
        </a>
      </div>
    </div>
  </section>
);

export default WhatWeCover;
