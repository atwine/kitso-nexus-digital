import { CalendarDays, Mail, MessageCircle } from "lucide-react";
import { BOOKING_URL, CONSULTATION_MINUTES, EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/lib/contact";
import { OFFICE_HOURS } from "@/lib/officeHours";

const WAYS = [
  {
    title: "Book a free consultation",
    detail: `${CONSULTATION_MINUTES} minutes, at a time that suits you`,
    href: BOOKING_URL,
    external: true,
    Icon: CalendarDays,
    iconColours: "bg-kn-teal text-kn-lime",
  },
  { title: "Chat on WhatsApp", detail: PHONE_DISPLAY, href: WHATSAPP_URL, external: true, Icon: MessageCircle, iconColours: "bg-kn-whatsapp text-kn-whatsapp-ink" },
  { title: "Send an email", detail: EMAIL, href: `mailto:${EMAIL}`, external: false, Icon: Mail, iconColours: "bg-kn-card text-kn-teal" },
];

// "You'll start with Fredrick": the first contact, by name and photo (Paper page M).
// The photo's right edge has a thin strip of wall, so it zooms 5% from the left, as on About.
const MeetFredrick = () => (
  <section aria-labelledby="fredrick-title" className="page-line pb-12 lg:pb-[88px] lg:pt-4">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:flex-row lg:items-center lg:gap-12 xl:gap-[72px]">
      <div className="h-[380px] overflow-hidden rounded-[20px] lg:h-[560px] lg:w-[420px] lg:shrink-0 lg:rounded-[28px] xl:w-[500px]">
        <img
          src="/images/team/fredric maripe.jpeg"
          alt="Fredrick Maripe"
          loading="lazy"
          decoding="async"
          className="size-full origin-left scale-[1.05] object-cover object-[50%_18%]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-7">
        <div className="flex flex-col gap-3.5">
          <h2 id="fredrick-title" className="text-[34px] font-bold leading-[38px] tracking-[-0.045em] lg:text-[52px] lg:leading-[56px]">
            You'll start with Fredrick.
          </h2>
          <p className="text-base leading-[26px] text-kn-body lg:text-lg lg:leading-[29px]">
            Fredrick Maripe looks after our client relationships and is your first point of contact. Say what's slowing your business down, in whichever way is easiest for you.
          </p>
        </div>
        <ul className="flex flex-col border-b border-kn-line">
          {WAYS.map(({ title, detail, href, external, Icon, iconColours }) => (
            <li key={title} className="border-t border-kn-line">
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-3.5 rounded-lg py-4 outline-offset-2 outline-kn-teal focus-visible:outline-2 lg:gap-[18px] lg:py-[18px]"
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconColours}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-lg font-semibold leading-[23px] tracking-[-0.02em] text-kn-night underline-offset-4 group-hover:underline lg:text-[19px] lg:leading-6">{title}</span>
                  <span className="text-sm leading-5 text-kn-body lg:text-[15px] lg:leading-[21px]">{detail}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-5 text-kn-body lg:text-[15px] lg:leading-[21px]">{OFFICE_HOURS}</p>
      </div>
    </div>
  </section>
);

export default MeetFredrick;
