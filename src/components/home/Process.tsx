import { useState } from "react";

// "How we work: Seven steps. No surprises." Laptop: a list of steps beside a
// teal panel (Paper page H). Phone: the same steps as an accordion (page K).
// Steps change only when clicked, never on a timer (owner's choice, 4 Nov).
const STEPS = [
  {
    title: "Discovery & Assessment",
    headline: "We learn your business before touching any technology.",
    questions: [
      "What are your biggest operational bottlenecks?",
      "What systems are you using today, and why are they failing?",
      "Who are the key users and decision-makers?",
      "What does success look like in 12 months?",
    ],
    outcome:
      "A shared understanding document: your goals, pain points, current systems and team structure. The foundation for everything that follows.",
  },
  {
    title: "Process Mapping",
    headline: "We document and improve your workflows before going digital.",
    questions: [
      "How does work actually flow through your business today?",
      "Where are the manual steps, delays or errors happening?",
      "Which processes are unique to your business, and which are standard?",
      "What must not change, and what must improve?",
    ],
    outcome:
      "A full process map with the inefficiencies marked, redesigned workflows, and a requirements document that drives every later decision.",
  },
  {
    title: "Solution Design",
    headline: "We design the right solution for your specific context.",
    questions: [
      "Which modules are needed, and in what order?",
      "What needs customising, and what works as standard?",
      "How will data flow between departments?",
      "What does the go-live timeline look like?",
    ],
    outcome: "A detailed blueprint: module list, configuration plan, integration map and a phased implementation roadmap.",
  },
  {
    title: "Configuration & Customisation",
    headline: "We build and configure your system to match your workflows.",
    questions: [
      "Does every workflow match the approved process map?",
      "Are all custom fields, reports and automations working correctly?",
      "Are user roles and permissions set up correctly?",
      "Have all edge cases been accounted for?",
    ],
    outcome: "A fully configured and customised system, tested internally, ready for data migration and user acceptance testing.",
  },
  {
    title: "Data Migration",
    headline: "We move your data safely, with nothing lost and everything checked.",
    questions: [
      "What data needs to move, and from where?",
      "How clean and structured is the existing data?",
      "What is the cutover date, and the rollback plan?",
      "Who checks the migrated data?",
    ],
    outcome: "All data audited, cleaned, mapped and imported, with a full validation report and a tested rollback plan in place.",
  },
  {
    title: "Training & Go-Live",
    headline: "We prepare your team and launch with confidence.",
    questions: [
      "Who needs training, and at what level?",
      "Are all user accounts and permissions ready?",
      "Is the go-live checklist complete?",
      "What is the support plan for the first week?",
    ],
    outcome: "Trained users, a completed go-live checklist, a live system, and dedicated support straight after launch.",
  },
  {
    title: "Ongoing Support",
    headline: "We stay with you, improving the system as your business grows.",
    questions: [
      "What issues have come up since go-live?",
      "Are there new requirements or process changes?",
      "Is the system being used as intended?",
      "Which improvements would add the most value now?",
    ],
    outcome: "Monthly check-ins, priority issue resolution, minor customisations, and a system that keeps pace with your growth.",
  },
];

// "01" for the first step.
const stepNo = (i: number) => String(i + 1).padStart(2, "0");

const StepDetail = ({ step }: { step: (typeof STEPS)[number] }) => (
  <>
    <div className="flex flex-col gap-2 rounded-xl bg-black/20 p-4 lg:gap-2.5 lg:rounded-2xl lg:p-6">
      <h4 className="text-[13px] font-semibold leading-4 tracking-normal text-kn-lime">Questions we ask</h4>
      <ul className="text-[15px] leading-6 text-white/85 lg:text-base lg:leading-[26px]">
        {step.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col gap-2 lg:gap-2.5">
      <h4 className="text-[13px] font-semibold leading-4 tracking-normal text-kn-lime">You walk away with</h4>
      <p className="text-[15px] leading-6 text-white/85 lg:text-base lg:leading-[26px]">{step.outcome}</p>
    </div>
  </>
);

const Process = () => {
  const [active, setActive] = useState(0); // the step shown on a laptop
  const [open, setOpen] = useState<number | null>(0); // the step open on a phone; tapping it again closes it
  const step = STEPS[active];

  return (
    <section className="page-line bg-kn-night pb-16 pt-14 lg:py-[120px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:flex-row lg:gap-10 xl:gap-16">
        <div className="flex flex-col gap-5 lg:w-[340px] lg:shrink-0 xl:w-[400px] lg:gap-7">
          <p className="text-sm font-semibold leading-[18px] text-kn-lime">How we work</p>
          <h2 className="text-[36px] leading-[38px] tracking-[-0.045em] text-white lg:text-[52px] lg:leading-[54px]">
            Seven steps. No surprises.
          </h2>

          {/* Laptop: the list picks which step the panel shows. */}
          <ul className="hidden flex-col gap-1 lg:flex">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  aria-pressed={active === i}
                  aria-controls="process-step"
                  onClick={() => setActive(i)}
                  className={`w-full rounded-xl px-[18px] py-[13px] text-left text-base leading-5 transition-colors ${
                    active === i ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {stepNo(i)} {s.title}
                </button>
              </li>
            ))}
          </ul>

          {/* Phone: each step opens in place. */}
          <ul className="flex flex-col gap-1 lg:hidden">
            {STEPS.map((s, i) => {
              const isOpen = open === i;
              return (
                <li key={s.title} className={isOpen ? "rounded-2xl bg-kn-teal" : ""}>
                  <h3 className="text-base tracking-normal">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? `process-step-${i}` : undefined}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className={`flex w-full items-center justify-between gap-3 px-[18px] text-left text-base leading-5 ${
                        isOpen ? "pb-0 pt-4 font-semibold text-white" : "py-3.5 font-normal text-white/60"
                      }`}
                    >
                      {stepNo(i)} {s.title}
                      <span aria-hidden="true" className={`text-xl leading-5 ${isOpen ? "text-kn-lime" : ""}`}>
                        {isOpen ? "–" : "+"}
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={`process-step-${i}`} className="flex flex-col gap-4 px-[18px] pb-5 pt-4">
                      <p className="text-2xl font-semibold leading-7 tracking-[-0.035em] text-white">{s.headline}</p>
                      <StepDetail step={s} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div id="process-step" className="hidden flex-1 flex-col gap-7 rounded-3xl bg-kn-teal p-10 lg:flex xl:p-12">
          <p className="text-[13px] uppercase leading-4 tracking-[0.08em] text-white/60">
            Step {stepNo(active)} of {String(STEPS.length).padStart(2, "0")}
          </p>
          <h3 className="text-[40px] leading-[44px] tracking-[-0.035em] text-white">{step.headline}</h3>
          <StepDetail step={step} />
        </div>
      </div>
    </section>
  );
};

export default Process;
