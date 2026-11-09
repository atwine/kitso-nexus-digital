import { useEffect, useState } from "react";
import ContactForm from "./ContactForm";
import { BOOKING_URL, CONSULTATION_MINUTES, EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/contact";
import { officeStatus } from "@/lib/officeHours";

const WAYS = [
  { title: "Book a free consultation", detail: `${CONSULTATION_MINUTES} minutes`, href: BOOKING_URL, external: true },
  { title: "WhatsApp", detail: PHONE_DISPLAY, href: WHATSAPP_URL, external: true },
  { title: "Call us", detail: PHONE_DISPLAY, href: PHONE_TEL, external: false },
  { title: "Email", detail: EMAIL, href: `mailto:${EMAIL}`, external: false },
];

const ONE_MINUTE_MS = 60_000;

// "The front desk is yours": every way to reach Kitso beside the form, with a
// live open or closed signal (Paper page M). The "I need a quote" door jumps here.
const FrontDesk = () => {
  const [status, setStatus] = useState(() => officeStatus(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setStatus(officeStatus(new Date())), ONE_MINUTE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-labelledby="desk-title" className="page-line bg-kn-stone py-10 lg:py-[72px]">
      <div className="mx-auto flex max-w-[1200px] flex-col overflow-hidden rounded-3xl bg-kn-teal lg:flex-row lg:rounded-[32px]">
        <div className="flex flex-col gap-5 px-[22px] pb-6 pt-7 lg:w-[45%] lg:shrink-0 lg:gap-7 lg:px-10 lg:py-[52px] xl:px-12">
          <p className={`flex items-start gap-2.5 text-sm font-semibold leading-5 lg:text-[15px] ${status.open ? "text-kn-lime" : "text-white/85"}`}>
            <span aria-hidden="true" className={`mt-[5px] size-2.5 shrink-0 rounded-full ${status.open ? "bg-kn-lime" : "bg-white/50"}`} />
            {status.text}
          </p>
          <h2 id="desk-title" className="text-[34px] font-bold leading-[38px] tracking-[-0.045em] text-white lg:text-[52px] lg:leading-[56px]">
            The front desk is yours.
          </h2>
          <ul className="flex flex-col border-b border-white/20">
            {WAYS.map(({ title, detail, href, external }) => (
              <li key={title} className="border-t border-white/20">
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex flex-col gap-0.5 rounded-lg py-3.5 outline-offset-2 outline-white focus-visible:outline-2 xl:flex-row xl:items-baseline xl:justify-between xl:gap-4 xl:py-5"
                >
                  <span className="text-[19px] font-semibold leading-6 tracking-[-0.02em] text-white underline-offset-4 group-hover:underline lg:text-[22px] lg:leading-7">{title}</span>
                  <span className="text-sm leading-5 text-white/85 lg:text-[15px]">{detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div id="message" className="min-w-0 flex-1 scroll-mt-6 px-2 pb-2 lg:py-4 lg:pl-0 lg:pr-4">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default FrontDesk;
