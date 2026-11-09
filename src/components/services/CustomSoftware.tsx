// "02 · Custom software": four photo cards on a dark section (Paper page H;
// stacked on phones, page K). Real photos of people, per the owner's rule.
const CARDS = [
  { title: "Sales funnels", body: "Lead capture and follow-ups that feed your CRM.", image: "sales-funnels" },
  { title: "Automations", body: "Repetitive work handled across your tools.", image: "automations" },
  { title: "Software development", body: "Web and mobile tools built around your process.", image: "software-development" },
  { title: "AI integration", body: "Assistants and smart reports on your own data.", image: "ai-integration" },
];

const CustomSoftware = () => (
  <section id="custom-software" className="page-line scroll-mt-4 bg-kn-night pb-16 pt-14 lg:py-28">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 lg:gap-8">
      <div className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-0">
        <div className="flex flex-col gap-4 lg:gap-3.5">
          <p className="text-sm font-semibold leading-[18px] text-kn-lime">02 · Custom software</p>
          <h2 className="text-[36px] leading-[38px] tracking-[-0.045em] text-white lg:text-[60px] lg:leading-[62px]">
            Built for the work no product covers.
          </h2>
        </div>
        <p className="text-base leading-[25px] text-white/70 lg:w-[320px] lg:shrink-0 xl:w-[420px] lg:text-[17px] lg:leading-[27px]">
          Connected to your ERP, or standing on its own.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {CARDS.map((card) => (
          <li key={card.title} className="flex flex-col overflow-hidden rounded-3xl bg-white/[0.06]">
            <img
              src={`/images/services-photos/${card.image}.webp`}
              alt=""
              width={760}
              height={567}
              loading="lazy"
              decoding="async"
              className="h-[200px] w-full object-cover lg:h-[240px]"
            />
            <div className="flex flex-col gap-2 p-5 lg:gap-2.5 lg:p-[26px]">
              <h3 className="text-[22px] leading-7 tracking-[-0.02em] text-white">{card.title}</h3>
              <p className="text-sm leading-[22px] text-white/[0.68]">{card.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default CustomSoftware;
