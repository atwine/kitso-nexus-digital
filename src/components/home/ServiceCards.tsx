import { Link } from "react-router";
import { SERVICES } from "@/data/services";

// "ERP, end to end. Pick what you need." with the six clay-picture cards.
const ServiceCards = () => (
  <section className="page-line bg-white pb-16 pt-14 lg:py-[120px]">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-10">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-[760px] text-[36px] leading-[38px] tracking-[-0.045em] lg:text-[60px] lg:leading-[62px]">
          ERP, end to end. Pick what you need.
        </h2>
        <Link to="/services" className="text-[15px] font-semibold leading-[18px] text-kn-teal underline-offset-4 hover:underline">
          All services →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {SERVICES.map((service) => (
          <li key={service.id} className="flex flex-col overflow-hidden rounded-3xl bg-kn-stone">
            <img
              src={service.image}
              alt=""
              width={1040}
              height={580}
              loading="lazy"
              decoding="async"
              className="h-[200px] w-full object-cover lg:h-[220px]"
            />
            <div className="flex flex-col gap-2 p-5 lg:gap-2.5 lg:p-6">
              <h3 className="text-[22px] leading-7 lg:text-2xl lg:leading-[30px]">{service.title}</h3>
              <p className="text-[15px] leading-[23px] text-kn-body">{service.short}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ServiceCards;
