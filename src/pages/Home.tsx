import { Settings, Wrench, Users, ClipboardList, Database, HeadphonesIcon, Search, PenTool, Rocket, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Reviews from "@/components/Reviews";

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
  { num: "1", icon: Search, title: "Discovery", desc: "We learn your business, systems, and pain points.", color: "text-teal", bg: "bg-teal/10" },
  { num: "2", icon: PenTool, title: "Design", desc: "We map the solution to your workflows and goals.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { num: "3", icon: Rocket, title: "Deliver", desc: "We configure, customize, migrate, and launch.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { num: "4", icon: LifeBuoy, title: "Support", desc: "We stay with you — training, fixes, and optimization.", color: "text-violet-400", bg: "bg-violet-400/10" },
];

const HomePage = () => (
  <main>
    <SEO
      title="Kitso Nexus Advisory | ERP Consulting & Implementation in Botswana"
      description="Kitso Nexus Advisory helps businesses in Southern Africa streamline operations with expert ERP consulting and implementation. Based in Gaborone, Botswana."
      path="/"
    />
    {/* HERO */}
    <section
      className="bg-navy hero-section pt-[80px] min-h-[420px] md:min-h-[500px] lg:min-h-[560px] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-[4.5rem] lg:py-20">
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
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How We Work</h2>

        {/* Timeline circles – desktop */}
        <div className="hidden md:flex items-center justify-between mb-10 relative px-8">
          <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-border -translate-y-1/2 z-0" />
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg border-4 border-teal">
                {step.num}
              </div>
            </div>
          ))}
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="border border-custom rounded-lg p-6 text-center hover:shadow-md transition-shadow fade-in">
              <div className={`w-12 h-12 ${step.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <step.icon size={22} className={step.color} />
              </div>
              <div className="md:hidden w-8 h-8 bg-navy rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs mx-auto mb-3">
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Reviews />

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
          <a href="https://wa.me/26773989514" target="_blank" rel="noopener noreferrer">
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
