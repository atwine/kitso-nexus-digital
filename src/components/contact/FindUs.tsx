// Gaborone in general, not an office address (owner's choice, 4 Nov 2026).
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Gaborone%2C+Botswana";

// "Find us" with the clay Botswana map (Paper page H; stacked on phones, page K).
// It replaces the embedded Google map, so Google no longer loads on the site.
const FindUs = () => (
  <section className="page-line pb-16 lg:pb-24">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-12">
      <img
        src="/images/contact/botswana-clay-map.webp"
        alt="Clay model of Botswana with a pin on Gaborone"
        width={1376}
        height={768}
        loading="lazy"
        decoding="async"
        className="h-[220px] w-full rounded-[20px] object-cover lg:h-[405px] lg:w-[min(720px,55%)] lg:shrink-0 lg:rounded-3xl"
      />
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold leading-[18px] text-kn-teal">Find us</p>
        <h2 className="text-[34px] leading-[38px] tracking-[-0.045em] lg:text-[44px] lg:leading-[50px]">Based in Gaborone, Botswana.</h2>
        <p className="text-base leading-[26px] text-[#616161]">Serving businesses across Southern Africa.</p>
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-full border border-[#1F1F1F] px-5 py-[13px] text-[15px] leading-[18px] text-[#1F1F1F] transition-colors hover:bg-kn-night/5"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  </section>
);

export default FindUs;
