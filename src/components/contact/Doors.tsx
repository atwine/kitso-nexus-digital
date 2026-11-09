import { BOOKING_URL, CONSULTATION_MINUTES, WHATSAPP_URL } from "@/lib/contact";

const DOORS = [
  {
    title: "I have a question",
    detail: "Something quick about Odoo, or about what we do. WhatsApp is fastest.",
    action: "Chat on WhatsApp",
    href: WHATSAPP_URL,
    picture: "/images/clay/support-retainers.webp",
  },
  {
    title: "I need a quote",
    detail: "Tell us what you need in writing and we'll come back with the next step.",
    action: "Send a message",
    href: "#message",
    picture: "/images/clay/process-consulting.webp",
    highlighted: true,
  },
  {
    title: "I'm ready to start",
    detail: `Book a free ${CONSULTATION_MINUTES}-minute conversation about your business, at a time that suits you.`,
    action: "Book a free consultation",
    href: BOOKING_URL,
    picture: "/images/clay/erp-implementation.webp",
  },
];

// "What brings you here today?": visitors pick their situation and each door
// leads to the quickest way of getting an answer (Paper page M).
const Doors = () => (
  <section aria-labelledby="doors-title" className="page-line pb-12 pt-12 lg:pb-[72px] lg:pt-[88px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:gap-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <h2 id="doors-title" className="text-[34px] font-bold leading-[38px] tracking-[-0.045em] lg:text-[52px] lg:leading-[56px]">
          What brings you here today?
        </h2>
        <p className="text-base leading-[25px] text-kn-body lg:w-[400px] lg:shrink-0 lg:text-[17px] lg:leading-[27px]">
          Choose the one closest to where you are. We'll point you to the quickest way of getting an answer.
        </p>
      </div>
      <ul className="flex flex-col gap-3 lg:flex-row lg:gap-5">
        {DOORS.map((door) => (
          <li key={door.title} className="flex flex-1">
            <a
              href={door.href}
              {...(door.href.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className={`flex flex-1 flex-col overflow-hidden rounded-[20px] outline-offset-2 outline-kn-teal transition-shadow hover:shadow-[0_12px_32px_rgb(20_20_19/0.12)] focus-visible:outline-2 lg:rounded-3xl ${
                door.highlighted ? "bg-kn-teal" : "bg-kn-stone"
              }`}
            >
              <img src={door.picture} alt="" width={1040} height={580} loading="lazy" decoding="async" className="h-[170px] w-full object-cover lg:h-[190px]" />
              <span className="flex flex-1 flex-col gap-1.5 px-[22px] pb-[22px] pt-5 lg:gap-2 lg:px-7 lg:pb-7 lg:pt-6">
                <span className={`text-2xl font-semibold leading-[30px] tracking-[-0.03em] lg:text-[26px] lg:leading-8 ${door.highlighted ? "text-white" : "text-kn-night"}`}>
                  {door.title}
                </span>
                <span className={`flex-1 text-[15px] leading-[23px] ${door.highlighted ? "text-white/85" : "text-kn-body"}`}>{door.detail}</span>
                <span className={`pt-1.5 text-[15px] font-semibold leading-5 lg:pt-2 ${door.highlighted ? "text-kn-lime" : "text-kn-teal"}`}>{door.action}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Doors;
