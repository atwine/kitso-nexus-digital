const STEPS = [
  { title: "We reply", detail: "A real person from our team answers you, during office hours in Gaborone." },
  { title: "We talk", detail: "A free conversation about how your business runs and what's slowing it down." },
  { title: "You get a plan", detail: "Clear steps and dates, with no obligation. If Odoo isn't right for you, we'll tell you." },
];

// "What happens after you reach out" (Paper page M). It promises no reply time.
const NextSteps = () => (
  <section aria-labelledby="next-title" className="page-line bg-kn-teal py-12 lg:py-[72px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-8">
      <h2 id="next-title" className="text-[30px] font-bold leading-[34px] tracking-[-0.04em] text-white lg:text-[40px] lg:leading-[44px]">
        What happens after you reach out
      </h2>
      <ol className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-1 flex-col gap-1.5 lg:gap-2">
            <p className="text-sm font-semibold leading-[18px] text-kn-lime lg:text-[15px] lg:leading-5">Step {index + 1}</p>
            <h3 className="text-xl font-semibold leading-[26px] tracking-normal text-white">{step.title}</h3>
            <p className="text-[15px] leading-[23px] text-white/85">{step.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default NextSteps;
