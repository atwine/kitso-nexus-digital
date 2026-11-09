import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const link = "self-start border-b-2 border-kn-lime pb-1 text-base font-semibold leading-5 text-white hover:border-white";

// "Rooted in Gaborone." with the Southern Africa map: the section the owner
// picked from the Gaborone Morning direction to end the Home page.
const WhereWeWork = () => (
  <section className="page-line bg-kn-teal pb-16 pt-2 lg:pb-[104px] lg:pt-6">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7 lg:flex-row lg:items-center lg:gap-10 xl:gap-16">
      <img
        src="/images/home/southern-africa-map.webp"
        alt="Map of Southern Africa with Botswana highlighted and Gaborone marked"
        width={1200}
        height={896}
        loading="lazy"
        decoding="async"
        className="h-[270px] w-full rounded-3xl object-cover lg:h-[480px] lg:w-1/2 lg:shrink-0 xl:w-[640px] lg:rounded-[32px]"
      />
      <div className="flex flex-col gap-[18px] lg:gap-6">
        <p className="-rotate-2 self-start rounded-full bg-kn-lime px-4 py-2 text-[15px] font-semibold leading-[18px] text-kn-night">
          Where we work
        </p>
        <h2 className="text-[34px] leading-[38px] tracking-[-0.045em] text-white lg:text-[52px] lg:leading-[56px]">
          Rooted in Gaborone. Working across Southern Africa.
        </h2>
        <p className="text-[17px] leading-[27px] text-white/[0.82] lg:text-lg lg:leading-[29px]">
          Close enough to sit in your office and walk your warehouse floor. That's how we learn how your business actually works.
        </p>
        <div className="flex flex-col gap-3.5 lg:flex-row lg:gap-7">
          <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>
          <a href={PHONE_TEL} className={link}>{PHONE_DISPLAY}</a>
        </div>
      </div>
    </div>
  </section>
);

export default WhereWeWork;
