import { Settings, Wrench, Users, ClipboardList, Database, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Settings,
    title: "ERP Implementation",
    desc: "End-to-end setup tailored to your business workflows.",
    includes: "Needs assessment · Module selection · Configuration · User setup · Go-live support",
  },
  {
    icon: Wrench,
    title: "Customization & Studio Work",
    desc: "Custom fields, reports, automations, and workflows built for your operations.",
    includes: "Custom reports · Automated actions · Computed fields · PDF templates · Dashboards",
  },
  {
    icon: Users,
    title: "Training & User Support",
    desc: "Hands-on training so your team is confident from day one.",
    includes: "Role-based training · User manuals · Q&A sessions · Video walkthroughs",
  },
  {
    icon: ClipboardList,
    title: "Business Process Consulting",
    desc: "Map and optimize your business processes before going digital.",
    includes: "Process mapping · Gap analysis · Workflow design · Requirements documentation",
  },
  {
    icon: Database,
    title: "Data Migration",
    desc: "Move your data safely from legacy systems or spreadsheets.",
    includes: "Data audit · Cleaning · Mapping · Import · Validation · Rollback planning",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support Retainers",
    desc: "Monthly retainers for priority troubleshooting and health checks.",
    includes: "Priority support · Monthly check-ins · Issue resolution · Minor customizations",
  },
];

const steps = [
  { num: "1", title: "Discovery", desc: "We learn your business, systems, and pain points." },
  { num: "2", title: "Design", desc: "We map the solution to your workflows and goals." },
  { num: "3", title: "Deliver", desc: "We configure, customize, migrate, and launch." },
  { num: "4", title: "Support", desc: "We stay with you — training, fixes, and optimization." },
];

const HomePage = () => (
  <main>
    {/* HERO */}
    <section
      className="bg-navy pt-[68px] relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 600px 400px at 80% 20%, hsl(157 76% 24% / 0.15), transparent),
          radial-gradient(ellipse 500px 400px at 20% 80%, hsl(213 74% 37% / 0.12), transparent),
          hsl(214 67% 15%)
        `,
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 py-20 md:py-28 lg:py-36">
        <p className="section-label mb-4 fade-in">ERP Consulting · Southern Africa</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-3 fade-in fade-in-delay-1">
          Kitso Nexus Advisory
        </h1>
        <p className="text-teal text-lg md:text-xl italic mb-6 fade-in fade-in-delay-2">
          Architects of Intelligent Operations
        </p>
        <p className="text-primary-foreground/70 max-w-2xl text-lg leading-relaxed mb-8 fade-in fade-in-delay-3">
          We help businesses across Southern Africa streamline operations, modernize processes, and grow smarter — with expert ERP consulting and implementation built around how your business actually works.
        </p>
        <div className="flex flex-wrap gap-4 fade-in fade-in-delay-4">
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="lg">Book a Free Consultation</Button>
          </a>
          <Link to="/services">
            <Button variant="heroOutline" size="lg">Explore Our Services</Button>
          </Link>
        </div>
      </div>
    </section>

    {/* SERVICES OVERVIEW */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">What We Do</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Comprehensive ERP Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className={`card-service fade-in fade-in-delay-${Math.min(i + 1, 5)}`}>
              <div className="w-11 h-11 bg-teal rounded-lg flex items-center justify-center mb-4">
                <s.icon size={22} className="text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{s.desc}</p>
              <p className="text-teal text-xs font-semibold uppercase tracking-wider mb-1">Includes</p>
              <p className="text-muted-foreground text-xs">{s.includes}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* TRUST INDICATORS */}
    <section className="bg-navy py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { num: "50", symbol: "+", label: "Modules Configured" },
            { num: "100", symbol: "%", label: "Client Satisfaction" },
            { num: "5", symbol: "+", label: "Industries Served" },
          ].map((stat, i) => (
            <div key={i} className="fade-in fade-in-delay-1">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground">
                {stat.num}<span className="text-teal">{stat.symbol}</span>
              </div>
              <p className="text-primary-foreground/60 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* HOW WE WORK */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Process</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How We Work</h2>
        <div className="border border-custom rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`text-center md:text-left ${
                  i < steps.length - 1 ? "md:border-r md:border-border-custom md:pr-8" : ""
                }`}
              >
                <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm mx-auto md:mx-0 mb-3">
                  {step.num}
                </div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* CTA BAND */}
    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <p className="section-label mb-2">Get Started</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to modernize your operations?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Whether you're implementing a new ERP, fixing a broken one, or just exploring your options — we're here to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
            <Button variant="hero" size="lg">Book a Free Consultation</Button>
          </a>
          <a href="https://wa.me/267XXXXXXXX" target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" size="lg">Chat on WhatsApp</Button>
          </a>
          <Link to="/contact">
            <Button variant="outline" size="lg">Send Us a Message</Button>
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default HomePage;
