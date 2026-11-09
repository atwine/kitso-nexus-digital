import * as Accordion from "@radix-ui/react-accordion";

// The first answer is from the design; the other four were drafted from what
// the site already says and approved by the owner on 4 Nov 2026.
const QUESTIONS = [
  { id: "free", question: "Is the consultation really free?", answer: "Yes. It's a conversation about your business, with no obligation." },
  {
    id: "odoo-only",
    question: "Do you only work with Odoo?",
    answer:
      "For ERP, yes: Odoo is the system we set up and support. We also build custom software and run AI training. If Odoo isn't the right fit for you, we'll tell you.",
  },
  {
    id: "existing-odoo",
    question: "We already use Odoo. Can you help?",
    answer:
      "Yes. We can customise it, bring your data across, train your team, fix how work flows through it, or look after it on a support retainer.",
  },
  {
    id: "how-long",
    question: "How long does an implementation take?",
    answer:
      "It depends on how many apps you need and how much data comes across. After our first conversation we give you a plan with clear steps and dates.",
  },
  {
    id: "outside-botswana",
    question: "Do you work outside Botswana?",
    answer:
      "Yes. We're based in Gaborone and work with businesses across Southern Africa, in person where we can and online when that suits you better.",
  },
];

// "Before you get in touch" (Paper page H; stacked on phones, page K). One
// answer open at a time, the first to start with.
const Faq = () => (
  <section className="page-line py-14 lg:py-24">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:flex-row lg:gap-16">
      <h2 className="text-[34px] leading-[38px] tracking-[-0.045em] lg:w-[380px] lg:shrink-0 lg:text-5xl lg:leading-[54px]">
        Before you get in touch
      </h2>
      <Accordion.Root type="single" collapsible defaultValue={QUESTIONS[0].id} className="flex-1 border-t border-kn-line">
        {QUESTIONS.map(({ id, question, answer }) => (
          <Accordion.Item key={id} value={id} className="group border-b border-kn-line">
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-start justify-between gap-4 py-[18px] text-left text-base font-medium leading-[22px] text-[#1F1F1F] group-data-[state=open]:pb-2 lg:py-[22px] lg:text-lg lg:group-data-[state=open]:pb-2.5">
                {question}
                <span aria-hidden="true" className="w-4 shrink-0 text-center text-xl leading-[22px] group-data-[state=open]:font-semibold group-data-[state=open]:text-kn-teal">
                  <span className="group-data-[state=open]:hidden">+</span>
                  <span className="hidden group-data-[state=open]:inline">–</span>
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-[18px] text-[15px] leading-6 text-[#616161] lg:pb-[22px]">{answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  </section>
);

export default Faq;
