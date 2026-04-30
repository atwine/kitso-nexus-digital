import { Settings, Wrench, Users, ClipboardList, Database, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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

const processSteps = [
  {
    num: "01", title: "Discovery & Assessment",
    desc: "We learn your business before touching any technology.",
    objective: "Build a complete picture of your business before any solution is proposed.",
    questions: ["What are your biggest operational bottlenecks?", "What systems are you currently using and why are they failing?", "Who are the key users and decision-makers?", "What does success look like in 12 months?"],
    outcome: "A shared understanding document covering your goals, pain points, current systems, and team structure — the foundation for everything that follows."
  },
  {
    num: "02", title: "Process Mapping",
    desc: "We document and optimize your workflows before going digital.",
    objective: "Understand and improve your current processes before any system is configured.",
    questions: ["How does work actually flow through your business today?", "Where are the manual steps, delays, or errors happening?", "Which processes are unique to your business vs. standard?", "What must not change, and what must improve?"],
    outcome: "A full process map with identified inefficiencies, redesigned workflows, and a requirements document that drives all future decisions."
  },
  {
    num: "03", title: "Solution Design",
    desc: "We design the right solution for your specific context.",
    objective: "Define exactly what will be built, configured, and integrated — before a single setting is touched.",
    questions: ["Which modules are needed and in what order?", "What customizations are required vs. standard features?", "How will data flow between departments?", "What does the go-live timeline look like?"],
    outcome: "A detailed solution blueprint: module list, configuration plan, integration map, and a phased implementation roadmap."
  },
  {
    num: "04", title: "Configuration & Customization",
    desc: "We build and configure your system to match your workflows.",
    objective: "Deliver a fully configured system that reflects your actual business operations.",
    questions: ["Does every workflow match the approved process map?", "Are all custom fields, reports, and automations working correctly?", "Are user roles and permissions correctly set up?", "Have all edge cases been accounted for?"],
    outcome: "A fully configured and customized system, tested internally, ready for data migration and user acceptance testing."
  },
  {
    num: "05", title: "Data Migration",
    desc: "We move your data safely with zero loss and full validation.",
    objective: "Ensure all historical and current data is accurately transferred to the new system.",
    questions: ["What data needs to move and from where?", "How clean and structured is the existing data?", "What is the cutover date and rollback plan?", "Who validates the migrated data?"],
    outcome: "All data audited, cleaned, mapped, and imported — with a full validation report and a tested rollback plan in place."
  },
  {
    num: "06", title: "Training & Go-Live",
    desc: "We prepare your team and launch with confidence.",
    objective: "Ensure every user is confident and the system goes live without disruption.",
    questions: ["Who needs training and at what level?", "Are all user accounts and permissions ready?", "Is the go-live checklist complete?", "What is the support plan for the first week?"],
    outcome: "Trained users, completed go-live checklist, live system, and a dedicated hypercare support period immediately after launch."
  },
  {
    num: "07", title: "Ongoing Support",
    desc: "We stay with you — optimizing as your business grows.",
    objective: "Keep the system performing and evolving alongside your business.",
    questions: ["What issues have emerged since go-live?", "Are there new requirements or process changes?", "Is the system being used as intended?", "What optimizations would add the most value now?"],
    outcome: "Monthly check-ins, priority issue resolution, minor customizations, and a system that keeps pace with your growth."
  },
];

const STEP_CYCLE_MS = 5000;

const HomePage = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepPaused, setStepPaused] = useState(false);

  useEffect(() => {
    if (stepPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, STEP_CYCLE_MS);
    return () => clearInterval(timer);
  }, [stepPaused]);

  return (
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
          <a href="https://cal.com/kitso-nexus-advisory-w4fk1j/30min" target="_blank" rel="noopener noreferrer">
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

    {/* WHY ODOO */}
    <section className="bg-surface py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Primary ERP Platform</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why we build on Odoo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { stat: "12M+", label: "Users Globally", desc: "One of the world's most adopted open-source ERP platforms." },
            { stat: "82+", label: "Modules Available", desc: "Accounting, inventory, CRM, HR, projects and more — one platform." },
            { stat: "0", label: "Vendor Lock-in", desc: "Open-source and fully customizable to fit how your business works." },
            { stat: "SME", label: "Friendly Pricing", desc: "Enterprise-grade capability at a fraction of legacy system costs." },
          ].map((item, i) => (
            <div key={i} className="border border-custom rounded-lg p-6 text-center hover:shadow-md hover:border-teal transition-all fade-in">
              <div className="text-3xl md:text-4xl font-bold text-[#714B67] mb-1">{item.stat}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-3">{item.label}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* TRUST INDICATORS */}
    <section className="bg-navy py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center text-center">
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
          <div className="fade-in fade-in-delay-2 flex flex-col items-center gap-3 md:border-l md:border-primary-foreground/30 md:pl-8">
            <div className="bg-white rounded-xl px-8 py-5 shadow-lg">
              <img
                src="/partners/odoo_learning_partner_rgb.svg"
                alt="Odoo Learning Partner"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-primary-foreground/60 text-xs uppercase tracking-widest">Official Partner</p>
          </div>
        </div>
      </div>
    </section>

    {/* HOW WE WORK */}
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Process</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How We Work</h2>

        {/* ── Stepper layout ── */}
        <div className="flex flex-col md:flex-row gap-0 border border-custom rounded-2xl overflow-hidden">

          {/* Left sidebar — step list */}
          <div className="md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-custom bg-card">
            {processSteps.map((step, i) => (
              <button
                key={i}
                onClick={() => { setActiveStep(i); setStepPaused(true); }}
                className={`relative w-full flex items-center gap-4 px-6 py-5 text-left transition-all border-b border-custom last:border-b-0 group overflow-hidden ${
                  activeStep === i
                    ? "bg-navy text-primary-foreground"
                    : "hover:bg-teal/5"
                }`}
              >
                {/* Progress sweep on active item */}
                {activeStep === i && !stepPaused && (
                  <span
                    className="absolute inset-0 bg-white/5 origin-left pointer-events-none"
                    style={{ animation: `progressSweep ${STEP_CYCLE_MS}ms linear forwards` }}
                  />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 transition-all ${
                  activeStep === i
                    ? "bg-teal border-teal text-navy"
                    : "border-border text-muted-foreground group-hover:border-teal group-hover:text-teal"
                }`}>
                  {step.num}
                </div>
                <span className={`relative z-10 text-sm font-semibold leading-tight ${
                  activeStep === i ? "text-primary-foreground" : "text-foreground group-hover:text-teal"
                } transition-colors`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>

          {/* Right content panel */}
          <div className="relative flex-1 p-10 md:p-14 min-h-[520px] flex flex-col justify-center">
            {/* Resume link */}
            {stepPaused && (
              <div className="absolute top-3 right-4">
                <button
                  onClick={() => setStepPaused(false)}
                  className="text-xs text-muted-foreground hover:text-teal transition-colors underline underline-offset-2"
                >
                  Resume auto-cycle
                </button>
              </div>
            )}
            {(() => {
              const step = processSteps[activeStep];
              return (
                <div className="fade-in">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Step {step.num}</p>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">{step.desc}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Objective</h4>
                      <p className="text-sm text-foreground/90 leading-relaxed">{step.objective}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Key Questions</h4>
                      <ul className="space-y-2">
                        {step.questions.map((q, qi) => (
                          <li key={qi} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-teal text-[9px] font-bold">{qi + 1}</span>
                            </div>
                            <span className="text-sm text-foreground/80 leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 bg-teal/5 border border-teal/20 rounded-lg p-5">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">Outcome</h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">{step.outcome}</p>
                  </div>
                </div>
              );
            })()}
          </div>
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
          <a href="https://cal.com/kitso-nexus-advisory-w4fk1j/30min" target="_blank" rel="noopener noreferrer">
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
};

export default HomePage;
