import { whatsappWith } from "@/lib/contact";

// "01 · ERP": the four rows of ERP service cards (Paper page H, "Features";
// phone version on page K, where every card puts its picture on top).
const picture = (name: string) => `/images/clay/${name}.webp`;

interface Wide {
  chip: string;
  title: string;
  body: string;
  checks: string[];
  image: string;
  pictureRight?: boolean;
}

const WIDE: Wide[] = [
  {
    chip: "01 · Implementation",
    title: "ERP Implementation",
    body: "The full lifecycle, from needs assessment and module selection through configuration and user setup to go-live and stabilisation, tailored to your workflows.",
    checks: ["Needs assessment", "Module selection", "Configuration", "Go-live support"],
    image: picture("erp-implementation"),
  },
  {
    chip: "02 · Customisation",
    title: "Customisation & Studio Work",
    body: "Custom fields, reports, automated actions, computed fields, PDF templates and dashboards that match how your business actually operates.",
    checks: ["Custom reports", "Automated actions", "PDF templates", "Dashboards"],
    image: picture("customisation-studio"),
    pictureRight: true,
  },
];

const SMALL = [
  { title: "Training & User Support", body: "Role-based training, manuals, Q&A sessions and video walkthroughs.", image: picture("training-support") },
  { title: "Process Consulting", body: "Process maps, gap analysis, workflow design and requirements.", image: picture("process-consulting") },
  { title: "Data Migration", body: "Audit, clean, map, import, validate, with rollback planning.", image: picture("data-migration") },
];

const Chip = ({ children, lime = false }: { children: string; lime?: boolean }) => (
  <p className={`self-start rounded-full px-2.5 py-1 text-xs font-medium leading-4 text-kn-night ${lime ? "bg-kn-lime" : "bg-white"}`}>
    {children}
  </p>
);

const CardPicture = ({ src, wide = false }: { src: string; wide?: boolean }) => (
  <img
    src={src}
    alt=""
    width={1040}
    height={580}
    loading="lazy"
    decoding="async"
    className={
      wide
        ? "h-[200px] w-full object-cover lg:h-[340px] lg:w-[44%] lg:shrink-0 lg:rounded-2xl xl:w-[520px]"
        : "h-[200px] w-full object-cover lg:h-[220px]"
    }
  />
);

const ErpServices = () => (
  <section id="erp" className="page-line scroll-mt-4 pb-14 pt-12 lg:pb-24 lg:pt-24">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 lg:gap-4">
      <div className="flex flex-col gap-3 pb-3 lg:flex-row lg:items-baseline lg:gap-4 lg:pb-3">
        <p className="shrink-0 whitespace-nowrap text-[13px] font-semibold leading-4 text-kn-olive">01 · ERP</p>
        <h2 className="text-[32px] leading-9 tracking-[-0.045em] lg:text-5xl lg:leading-[52px]">Installation, management &amp; customisation</h2>
      </div>

      {WIDE.map((s) => (
        <article
          key={s.title}
          className={`flex flex-col overflow-hidden rounded-3xl bg-kn-stone lg:items-center lg:gap-12 lg:p-6 ${s.pictureRight ? "lg:flex-row-reverse" : "lg:flex-row"}`}
        >
          <CardPicture src={s.image} wide />
          <div className={`flex flex-1 flex-col gap-3 p-5 lg:gap-3.5 lg:p-0 ${s.pictureRight ? "lg:pl-4" : ""}`}>
            <Chip>{s.chip}</Chip>
            <h3 className="text-[26px] leading-[30px] tracking-[-0.04em] lg:text-4xl lg:leading-10">{s.title}</h3>
            <p className="text-[15px] leading-6 text-kn-body lg:text-base lg:leading-[26px]">{s.body}</p>
            <ul className="flex flex-wrap gap-x-1.5 text-sm leading-[22px] text-kn-night">
              {s.checks.map((c) => (
                <li key={c}>
                  <span aria-hidden="true">✓ </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}

      <div className="flex flex-col gap-3 lg:flex-row lg:gap-6">
        {SMALL.map((s) => (
          <article key={s.title} className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-kn-stone">
            <CardPicture src={s.image} />
            <div className="flex flex-col gap-2 p-5 lg:gap-2.5 lg:p-6">
              <h3 className="text-[22px] leading-7 lg:text-2xl lg:leading-[30px]">{s.title}</h3>
              <p className="text-[15px] leading-[23px] text-kn-body">{s.body}</p>
            </div>
          </article>
        ))}
      </div>

      <article className="flex flex-col overflow-hidden rounded-3xl bg-kn-teal lg:flex-row lg:items-center lg:gap-12 lg:p-6">
        <CardPicture src={picture("support-retainers")} wide />
        <div className="flex flex-1 flex-col gap-3 p-5 lg:gap-3.5 lg:p-0">
          <Chip lime>06 · After go-live</Chip>
          <h3 className="text-[26px] leading-[30px] tracking-[-0.04em] text-white lg:text-4xl lg:leading-10">Ongoing Support Retainers</h3>
          <p className="text-[15px] leading-6 text-white/[0.78] lg:text-base lg:leading-[26px]">
            Monthly retainers give you priority access to our team for troubleshooting, health checks, minor customisations and continuous improvement.
          </p>
          <a
            href={whatsappWith("Hi Kitso, I'd like to know about your support retainers.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-kn-lime px-[22px] py-3.5 text-center text-[15px] font-semibold leading-[18px] text-kn-night transition-colors hover:bg-kn-lime/90 lg:self-start"
          >
            Ask about retainers
          </a>
        </div>
      </article>
    </div>
  </section>
);

export default ErpServices;
