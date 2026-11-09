import { BOOKING_URL, WHATSAPP_URL } from "@/lib/contact";

// "Ready when you are.": the closing banner on Services and About (Paper page H;
// phone version on page K).
const ReadyBanner = () => (
  <section className="page-line bg-kn-teal pb-16 pt-[72px] text-center lg:pb-28 lg:pt-32">
    <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 lg:gap-7">
      <h2 className="text-[40px] leading-[42px] tracking-[-0.055em] text-white lg:text-[76px] lg:leading-[76px]">Ready when you are.</h2>
      <p className="text-[17px] leading-[26px] text-white/[0.72] lg:text-xl lg:leading-[30px]">
        A free consultation, no obligation. Or just say hello on WhatsApp.
      </p>
      <div className="flex w-full flex-col gap-2.5 pt-1 sm:w-auto sm:flex-row lg:gap-3 lg:pt-0">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-kn-lime px-7 py-4 text-base font-semibold leading-5 text-kn-night transition-colors hover:bg-kn-lime/90"
        >
          Book a free consultation
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-kn-whatsapp px-7 py-4 text-base font-semibold leading-5 text-kn-whatsapp-ink transition-colors hover:bg-kn-whatsapp/90"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export default ReadyBanner;
