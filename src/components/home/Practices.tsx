// "One partner, three practices" (Paper page H; phone version on page K).
const PRACTICES = [
  {
    label: "01 · ERP",
    title: "Installation, management & customisation",
    body: "Odoo set up around your workflows, then looked after every month.",
    card: "bg-kn-teal",
    labelColour: "text-kn-lime",
    titleColour: "text-white",
    bodyColour: "text-white/[0.72]",
  },
  {
    label: "02 · Custom software",
    title: "Funnels, automations, apps & AI",
    body: "Sales funnels, automations, software development and AI integration.",
    card: "bg-white",
    labelColour: "text-kn-muted",
    titleColour: "text-kn-night",
    bodyColour: "text-kn-body",
  },
  {
    label: "03 · Training & academy",
    title: "ERP, AI and the AI Bootcamp",
    body: "ERP training, AI training and automation, AI development, and a cohort bootcamp.",
    card: "bg-kn-lime",
    labelColour: "text-kn-night",
    titleColour: "text-kn-night",
    bodyColour: "text-kn-night",
  },
];

const Practices = () => (
  <section className="page-line bg-kn-stone pb-16 pt-14 lg:py-[120px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 lg:gap-10">
      <div className="flex flex-col items-center gap-3 text-center lg:gap-3.5">
        <p className="text-sm font-semibold leading-[18px] text-kn-olive">One partner, three practices</p>
        <h2 className="max-w-[820px] text-[36px] leading-[38px] tracking-[-0.045em] lg:text-[60px] lg:leading-[62px]">
          Systems, software and the skills to run them.
        </h2>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
        {PRACTICES.map((p) => (
          <article key={p.label} className={`flex flex-1 flex-col gap-3.5 rounded-3xl p-7 lg:gap-[18px] lg:p-9 ${p.card}`}>
            <p className={`text-[13px] font-semibold leading-4 ${p.labelColour}`}>{p.label}</p>
            <h3 className={`text-[26px] leading-[30px] lg:text-[30px] lg:leading-[34px] ${p.titleColour}`}>{p.title}</h3>
            <p className={`text-[15px] leading-6 ${p.bodyColour}`}>{p.body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Practices;
