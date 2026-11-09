import { BOOKING_URL, WHATSAPP_URL } from "@/lib/contact";

// "Let's have a proper conversation." The owner dropped "Tea optional." on 4 Nov.
const HomeCta = () => (
  <section className="page-line bg-kn-teal pb-16 pt-[72px] text-center lg:pb-[104px] lg:pt-[120px]">
    <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-5 lg:gap-7">
      <h2 className="text-[40px] leading-[42px] tracking-[-0.045em] text-white lg:text-[72px] lg:leading-[76px]">
        Let's have a proper conversation.
      </h2>
      <p className="text-[17px] leading-[26px] text-white/80 lg:text-xl lg:leading-[30px]">Free consultation, no obligation.</p>
      <div className="flex w-full flex-col gap-2.5 pt-1 sm:w-auto sm:flex-row lg:gap-3 lg:pt-0">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-kn-lime px-[30px] py-[17px] text-[17px] font-semibold leading-[22px] text-kn-night transition-colors hover:bg-kn-lime/90"
        >
          Book a free consultation
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border-2 border-white px-7 py-[15px] text-[17px] font-semibold leading-[22px] text-white transition-colors hover:bg-white/10"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  </section>
);

export default HomeCta;
