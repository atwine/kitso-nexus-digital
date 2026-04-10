import { Settings, Wrench, Users, ClipboardList, Database, HeadphonesIcon } from "lucide-react";
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

const ServicesPage = () => (
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
        {[
          { label: "Implementation", href: "#" + "erp-implementation" },
          { label: "Customization", href: "#" + "customization-and-studio-work" },
          { label: "Training", href: "#" + "training-and-user-support" },
          { label: "Consulting", href: "#" + "business-process-consulting" },
          { label: "Data Migration", href: "#" + "data-migration" },
          { label: "Support", href: "#" + "ongoing-support-retainers" },
        ].map((t) => (
          <a
            key={t.label}
            href={t.href}
            className="px-3 py-2 rounded-md border-2 border-primary-foreground text-sm text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          >
            {t.label}
          </a>
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
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        {services.map((s, i) => (
          <div
            key={i}
            id={s.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
            className="card-service overflow-hidden fade-in scroll-mt-[80px]"
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-48 md:h-56 object-cover rounded-t-lg"
              loading="lazy"
            />
            <div className="flex items-start gap-4 pt-5">
              <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center shrink-0">
                <s.icon size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                <p className="text-teal text-xs font-semibold uppercase tracking-wider mb-1">Includes</p>
                <p className="text-muted-foreground text-sm">{s.includes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Not sure which service you need?
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          Book a free consultation and we'll help you figure out the best path forward.
        </p>
        <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
          <Button variant="hero" size="lg">Book a Free Consultation</Button>
        </a>
      </div>
    </section>
  </main>
);

export default ServicesPage;
