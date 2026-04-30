import { Settings, Wrench, Users, ClipboardList, Database, HeadphonesIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

const services = [
  {
    icon: Settings,
    title: "ERP Implementation",
    image: "/services/erp-implementation.webp",
    desc: "We handle the full ERP implementation lifecycle — from initial needs assessment and module selection, through system configuration and user setup, all the way to go-live and post-launch stabilization. Every implementation is tailored to your specific workflows, industry requirements, and team structure.",
    includes: "Needs assessment · Module selection · Configuration · User setup · Go-live support",
  },
  {
    icon: Wrench,
    title: "Customization & Studio Work",
    image: "/services/customization-studio.webp",
    desc: "Out-of-the-box ERP rarely fits perfectly. We build custom fields, reports, automated actions, computed fields, PDF templates, and dashboards that match how your business actually operates. If the standard system can't do it, we'll make it happen.",
    includes: "Custom reports · Automated actions · Computed fields · PDF templates · Dashboards",
  },
  {
    icon: Users,
    title: "Training & User Support",
    image: "/services/training-support.webp",
    desc: "Technology is only as good as the people using it. We deliver role-based training sessions, create user manuals, run Q&A workshops, and produce video walkthroughs so your team feels confident and capable from day one.",
    includes: "Role-based training · User manuals · Q&A sessions · Video walkthroughs",
  },
  {
    icon: ClipboardList,
    title: "Business Process Consulting",
    image: "/services/business-consulting.webp",
    desc: "Before you digitize, you need to optimize. We map your current processes, identify gaps and inefficiencies, design improved workflows, and document requirements — giving you a clear blueprint before any technology decisions are made.",
    includes: "Process mapping · Gap analysis · Workflow design · Requirements documentation",
  },
  {
    icon: Database,
    title: "Data Migration",
    image: "/services/data-migration.webp",
    desc: "Moving from spreadsheets or legacy systems? We audit your existing data, clean and normalize it, map fields to your new system, run test imports, validate results, and maintain rollback plans to ensure nothing is lost in transition.",
    includes: "Data audit · Cleaning · Mapping · Import · Validation · Rollback planning",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support Retainers",
    image: "/services/ongoing-support.webp",
    desc: "After go-live, we stay with you. Our monthly retainers give you priority access to our team for troubleshooting, health checks, minor customizations, and continuous improvement — so your system keeps pace with your business.",
    includes: "Priority support · Monthly check-ins · Issue resolution · Minor customizations",
  },
];

const SVC_CYCLE_MS = 5000;

const ServicesPage = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % services.length), SVC_CYCLE_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
  <main>
    <SEO
      title="Our Services | ERP Implementation, Training & Support | Kitso Nexus"
      description="Explore our ERP services: implementation, customization, training, data migration, and ongoing support retainers across Southern Africa."
      path="/services"
    />
    <PageHero
      label="Our Services"
      title="What we do"
      subtitle="End-to-end ERP consulting services designed for businesses across Southern Africa. From strategy to support, we've got you covered."
    >
      <div className="mt-4 flex flex-wrap gap-2">
        {["Implementation", "Customization", "Training", "Consulting", "Data Migration", "Support"].map((label) => (
          <span
            key={label}
            className="px-3 py-2 rounded-md border-2 border-primary-foreground text-sm text-primary-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
        {[
          "Botswana-based",
          "End-to-end ERP",
          "From strategy to support",
        ].map((chip) => (
          <span
            key={chip}
            className="px-3 py-2 rounded-md border-2 border-primary-foreground text-sm text-primary-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </PageHero>

    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="group h-[340px] fade-in" style={{ perspective: "600px" }}>
              <div
                className="flip-inner relative w-full h-full transition-transform duration-700"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-custom bg-card flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img src={s.image} alt={s.title} className="w-full h-40 object-cover" loading="lazy" />
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center shrink-0">
                        <s.icon size={18} className="text-teal" />
                      </div>
                      <h3 className="font-black text-base leading-tight">{s.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-teal font-semibold uppercase tracking-widest">
                      Hover to learn more →
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl bg-navy p-7 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <s.icon size={18} className="text-teal" />
                      </div>
                      <h3 className="font-black text-white text-base leading-tight">{s.title}</h3>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-3 mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-teal mb-1">Includes</p>
                    <p className="text-xs text-white/70">{s.includes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure which service you need?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          Book a free consultation and we'll help you figure out the best path forward.
        </p>
        <a href="https://cal.com/kitso-nexus-advisory-w4fk1j/30min" target="_blank" rel="noopener noreferrer">
          <Button variant="hero" size="lg">Book a Free Consultation</Button>
        </a>
      </div>
    </section>
  </main>
  );
};

export default ServicesPage;
