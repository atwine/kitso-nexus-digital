// The figures row with the Odoo Learning Partner badge (Paper page H, "Proof").
const FIGURES = [
  { value: "50+", label: "Modules configured" },
  { value: "100%", label: "Client satisfaction" },
  { value: "5+", label: "Industries served" },
];

const Proof = () => (
  <section className="page-line bg-kn-stone py-10 lg:py-[72px]">
    <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 gap-y-6 lg:flex lg:items-center lg:justify-between">
      {FIGURES.map((f) => (
        <div key={f.label} className="flex flex-col gap-0.5 lg:gap-1">
          <p className="text-[44px] font-semibold leading-[52px] tracking-[-0.05em] text-kn-night lg:text-[56px] lg:leading-[68px]">
            {f.value}
          </p>
          <p className="text-sm leading-[18px] text-kn-muted lg:text-[15px]">{f.label}</p>
        </div>
      ))}
      <div className="flex items-center justify-center rounded-2xl bg-white p-3.5 lg:px-6 lg:py-[18px]">
        <img
          src="/partners/odoo_learning_partner_rgb.svg"
          alt="Official Odoo Learning Partner"
          width={180}
          height={56}
          loading="lazy"
          className="h-11 w-[130px] object-contain lg:h-14 lg:w-[180px]"
        />
      </div>
    </div>
  </section>
);

export default Proof;
