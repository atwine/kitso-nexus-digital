import { Target, Handshake, Lightbulb, ShieldCheck, RefreshCcw, Users, Factory, Truck, Heart, Briefcase, ShoppingCart, HardHat, CheckCircle2, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const team = [
  {
    initials: "AT",
    image: "/about/atwine mugume.jpeg",
    name: "Mr. Mugume T Atwine",
    role: "Technical Lead",
    bio: "Specializes in ERP implementation, system customization, and technical architecture. Ensures every solution is built right.",
    details: "Mugume has an extensive background in software engineering and system design, having successfully delivered complex ERP solutions. He focuses on bridging the gap between business requirements and technical realities to deliver systems that scale effortlessly.",
    experience: [
      "Over 10 years in software development and architecture",
      "Lead architect on multiple large-scale enterprise resource planning projects",
      "Expertise in modern web frameworks, database optimization, and cloud infrastructures",
      "Passionate about creating scalable, secure, and maintainable systems"
    ],
    linkedin: "https://www.linkedin.com/in/mugume-twinamatsiko-atwine-msc-976ab12b/"
  },
  {
    initials: "MF",
    image: "/about/fredric maripe.jpeg",
    name: "Mr. Fredrick Maripe",
    role: "Business Development",
    bio: "Leads client relationships, requirements gathering, and strategic advisory. Your first point of contact.",
    details: "Fredrick is a seasoned business strategist with a deep understanding of the operational challenges faced by modern organizations. He ensures that every project aligns perfectly with the client's long-term overarching strategic objectives.",
    experience: [
      "Extensive experience in B2B consulting and enterprise advisory",
      "Proven track record of driving digital transformation across various sectors",
      "Expert in business process mapping, requirements gathering, and change management",
      "Dedicated to fostering and maintaining long-lasting partnerships with clients"
    ],
    linkedin: "#"
  },
];

const values = [
  {
    icon: Target,
    title: "Precision",
    desc: "We get the details right. No guesswork, no shortcuts.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    desc: "Your success is our success. We work alongside you, not above you.",
  },
  {
    icon: Lightbulb,
    title: "Practicality",
    desc: "Solutions that work in the real world, not just on paper.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    desc: "We're honest about what works, what doesn't, and what it takes.",
  },
  {
    icon: RefreshCcw,
    title: "Continuous Improvement",
    desc: "We don't just deliver and leave. We iterate, optimize, and grow with you.",
  },
  {
    icon: Users,
    title: "People First",
    desc: "Technology serves people — not the other way around. We design for your team.",
  },
];

const industries = [
  { icon: Factory, name: "Manufacturing", desc: "Production lines, inventory, and supply chain optimization.", color: "text-teal", bg: "bg-teal/10", border: "border-t-teal" },
  { icon: Truck, name: "Equipment & Machinery", desc: "Asset tracking, maintenance scheduling, and fleet management.", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-t-blue-400" },
  { icon: Heart, name: "Non-profits & Churches", desc: "Donor management, fund accounting, and program tracking.", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-t-rose-400" },
  { icon: Briefcase, name: "Professional Services", desc: "Project billing, time tracking, and resource planning.", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-t-amber-500" },
  { icon: ShoppingCart, name: "Retail & Distribution", desc: "Point of sale, warehousing, and order fulfillment.", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-t-violet-400" },
  { icon: HardHat, name: "Construction", desc: "Job costing, project management, and subcontractor tracking.", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-t-orange-400" },
];

const CYCLE_MS = 4000;

const AboutPage = () => {
  const [activeIndustry, setActiveIndustry] = useState<number>(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIndustry((prev) => (prev + 1) % industries.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
  <main>
    <SEO
      title="About Us | Kitso Nexus Advisory — Gaborone, Botswana"
      description="Learn about Kitso Nexus Advisory — a Botswana-based ERP consultancy helping businesses work smarter through intelligent operations."
      path="/about"
    />
    <PageHero
      label="Who We Are"
      title="About Kitso Nexus Advisory"
      subtitle="A dedicated ERP consulting firm helping businesses across Southern Africa operate smarter, faster, and more efficiently."
    >
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-primary-foreground/85">
        {["Botswana-based", "ERP-first", "Partnership-driven"].map((chip) => (
          <span key={chip} className="px-3 py-2 rounded-md border-2 border-primary-foreground">
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-primary-foreground/85">
        {industries.slice(0, 4).map((ind) => (
          <span key={ind.name} className="px-3 py-2 rounded-md border-2 border-primary-foreground">
            {ind.name}
          </span>
        ))}
      </div>
    </PageHero>

    {/* Our Story */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <p className="section-label mb-3">Our Story</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Built on Belief, Driven by Knowledge</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-justify">
          <p className="text-lg md:text-xl leading-relaxed text-foreground/80">
            Kitso Nexus Advisory was founded with a simple belief: that businesses in <strong className="text-teal">Southern Africa</strong> deserve the same caliber of operational technology and consulting that's available anywhere in the world. We saw too many organizations struggling with manual processes, disconnected systems, and ERP implementations that didn't fit their reality.
          </p>
          <p>
            So we built a consultancy that puts <strong>understanding first</strong>. We don't lead with software — we lead with listening. Every engagement starts with learning how your business actually works, then designing solutions that fit your people, your processes, and your goals.
          </p>

          <blockquote className="border-l-4 border-teal bg-teal/5 pl-6 pr-4 py-4 my-6 rounded-r-lg text-foreground text-lg italic">
            "Kitso" means <strong>knowledge</strong> in Setswana. We bring that knowledge to every engagement — bridging the gap between technology and the people who use it every day.
          </blockquote>

          <p className="text-lg md:text-xl leading-relaxed text-foreground/80">
            Based in <strong>Gaborone, Botswana</strong>, we serve clients across multiple industries and pride ourselves on building <strong className="text-teal">long-term partnerships</strong> — not one-off projects. When you work with Kitso Nexus, you get a team that stays with you well beyond go-live.
          </p>
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Team</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          The People Behind Kitso Nexus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {team.map((member, i) => (
            <Dialog key={i}>
              <DialogTrigger asChild>
                <div
                  className="bg-card border border-custom rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer fade-in text-left group"
                >
                  <div className="flex items-start justify-between">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-transparent group-hover:border-teal/50 transition-colors"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 group-hover:ring-2 ring-teal/50 transition-all">
                        {member.initials}
                      </div>
                    )}
                    <span className="text-xs font-medium px-2.5 py-1 bg-teal/10 text-teal rounded-full group-hover:bg-teal group-hover:text-white transition-colors">
                      View Profile
                    </span>
                  </div>
                  <h3 className="font-bold text-xl">{member.name}</h3>
                  <p className="text-teal text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{member.bio}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto w-[95vw]">
                <DialogHeader className="flex flex-col items-center text-center gap-4 pb-4 border-b">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg border-4 border-white dark:border-navy"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-navy rounded-full shadow-lg flex items-center justify-center text-primary-foreground font-bold text-5xl">
                      {member.initials}
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                    <DialogTitle className="text-2xl font-bold">{member.name}</DialogTitle>
                    <div className="flex items-center gap-3">
                      <DialogDescription className="text-teal font-semibold text-base m-0">
                        {member.role}
                      </DialogDescription>
                      {member.linkedin && (
                        <a 
                          href={member.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
                          title="LinkedIn Profile"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="py-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                  <p className="text-foreground/90 leading-relaxed text-sm">
                    {member.details}
                  </p>
                </div>
                
                <div className="py-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Experience</h4>
                  <ul className="space-y-3">
                    {member.experience.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-teal shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80 leading-relaxed">{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Values</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          What Guides Us
        </h2>
        <div className="relative flex flex-col gap-6">
          {/* Vertical timeline line */}
          <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-border z-0" />

          {values.map((v, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} className={`relative flex items-start gap-6 fade-in ${
                isEven ? "md:pr-0" : "md:pr-[18%]"
              }`}>
                {/* Timeline node */}
                <div className="relative z-10 shrink-0 flex flex-col items-center mt-5">
                  <div className="w-12 h-12 rounded-full bg-navy border-4 border-teal flex items-center justify-center">
                    <span className="text-teal text-xs font-black">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="relative flex-1 bg-card border border-custom rounded-2xl p-6 md:p-8 overflow-hidden">
                  {/* Giant faded number — bleeds from right */}
                  <span className="pointer-events-none select-none absolute -right-2 -bottom-4 font-black leading-none text-[120px] md:text-[150px] opacity-[0.05] text-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isEven ? "bg-teal/10" : "bg-navy/10"
                    }`}>
                      <v.icon size={20} className={isEven ? "text-teal" : "text-navy"} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl md:text-2xl mb-2">{v.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Industries */}
    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Industries We Serve</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Across Sectors
        </h2>
        {/* Pill selector row */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {industries.map((ind, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndustry(i); setPaused(true); }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all duration-200 overflow-hidden ${
                activeIndustry === i
                  ? `bg-navy text-white border-navy`
                  : `bg-card border-custom hover:border-teal text-foreground`
              }`}
            >
              {/* Progress sweep on active pill */}
              {activeIndustry === i && !paused && (
                <span
                  className="absolute inset-0 bg-white/10 origin-left"
                  style={{ animation: `progressSweep ${CYCLE_MS}ms linear forwards` }}
                />
              )}
              <ind.icon size={15} className={activeIndustry === i ? "text-white" : ind.color} />
              <span className="relative z-10">{ind.name}</span>
            </button>
          ))}
        </div>
        {/* Resume auto-cycle button when paused */}
        {paused && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setPaused(false)}
              className="text-xs text-muted-foreground hover:text-teal transition-colors underline underline-offset-2"
            >
              Resume auto-cycle
            </button>
          </div>
        )}

        {/* Expanded detail card */}
        {(() => {
          const ind = industries[activeIndustry];
          return (
            <div className={`relative overflow-hidden rounded-2xl border border-custom bg-card p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 fade-in`}>
              {/* Giant faded number */}
              <span className="pointer-events-none select-none absolute right-6 bottom-0 font-black leading-none text-[160px] opacity-[0.04] text-foreground">
                {String(activeIndustry + 1).padStart(2, "0")}
              </span>
              {/* Icon */}
              <div className={`w-24 h-24 ${ind.bg} rounded-3xl flex items-center justify-center shrink-0`}>
                <ind.icon size={44} className={ind.color} />
              </div>
              {/* Content */}
              <div className="relative z-10">
                <p className={`text-xs font-semibold uppercase tracking-widest ${ind.color} mb-2`}>Industry Focus</p>
                <h3 className="font-black text-2xl md:text-3xl mb-3">{ind.name}</h3>
                <p className="text-muted-foreground leading-relaxed text-base max-w-xl">{ind.desc}</p>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  </main>
  );
};

export default AboutPage;

