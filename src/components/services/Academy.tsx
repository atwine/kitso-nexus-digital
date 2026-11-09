import { whatsappWith } from "@/lib/contact";

// "03 · Training & academy" with the AI Bootcamp card (Paper page H; phone on
// page K). The owner confirmed the six modules on 4 Nov 2026.
const TRAINING = [
  { title: "ERP training", who: "Users · managers · admins" },
  { title: "AI training & automation", who: "Everyday AI at work" },
  { title: "AI development", who: "For technical teams" },
];

const MODULES = [
  "AI foundations for business",
  "Prompting and everyday AI tools",
  "Automating workflows without code",
  "Building with AI APIs",
  "AI inside your ERP",
  "Capstone project",
];

const Academy = () => (
  <section id="academy" className="page-line scroll-mt-4 bg-white pb-16 pt-14 lg:py-28">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 lg:flex-row lg:gap-5">
      <div className="flex flex-1 flex-col gap-4 lg:gap-5">
        <p className="text-sm font-semibold leading-[18px] text-kn-olive">03 · Training &amp; academy</p>
        <h2 className="text-[36px] leading-[38px] tracking-[-0.045em] lg:text-[56px] lg:leading-[58px]">Skills that stay after we leave.</h2>
        <ul className="flex flex-col gap-2.5">
          {TRAINING.map((t) => (
            <li key={t.title} className="flex flex-col gap-1 rounded-2xl bg-kn-card px-5 py-4 lg:px-6 lg:py-5 xl:flex-row xl:items-center xl:justify-between">
              <h3 className="text-[17px] leading-[22px] tracking-normal lg:text-lg">{t.title}</h3>
              <p className="text-sm leading-[18px] text-kn-muted lg:text-[15px]">{t.who}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] bg-kn-teal px-6 py-7 lg:w-[46%] lg:shrink-0 lg:gap-[18px] lg:p-10 xl:w-[560px]">
        <p className="self-start rounded-full bg-kn-lime px-3 py-1.5 text-[13px] font-semibold leading-4 text-kn-night">AI Bootcamp</p>
        <h3 className="text-[28px] leading-8 tracking-[-0.035em] text-white lg:text-4xl lg:leading-[38px]">Six modules. One tool you actually ship.</h3>
        <ol className="text-[15px] leading-7 text-white/[0.82] lg:leading-[30px]">
          {MODULES.map((m, i) => (
            <li key={m}>
              {String(i + 1).padStart(2, "0")} {m}
            </li>
          ))}
        </ol>
        <a
          href={whatsappWith("Hi Kitso, I'd like to join the next AI Bootcamp cohort.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-6 py-3.5 text-center text-[15px] font-semibold leading-[18px] text-kn-night transition-colors hover:bg-kn-stone lg:self-start"
        >
          Join the next cohort
        </a>
      </div>
    </div>
  </section>
);

export default Academy;
