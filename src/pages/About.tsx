import { Target, Handshake, Lightbulb, ShieldCheck, RefreshCcw, Users, Factory, Truck, Heart, Briefcase, ShoppingCart, HardHat, CheckCircle2, Linkedin } from "lucide-react";
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

const AboutPage = () => (
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
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="section-label mb-2 text-center">Our Values</p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          What Guides Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="border border-custom rounded-lg p-6 border-t-4 border-t-teal fade-in hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center mb-4">
                <v.icon size={20} className="text-teal" />
              </div>
              <h3 className="font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-justify">{v.desc}</p>
            </div>
          ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {industries.map((ind, i) => (
            <div key={i} className={`border border-custom rounded-lg p-6 border-t-4 ${ind.border} fade-in hover:shadow-md transition-shadow`}>
              <div className={`w-10 h-10 ${ind.bg} rounded-lg flex items-center justify-center mb-4`}>
                <ind.icon size={20} className={ind.color} />
              </div>
              <h3 className="font-bold text-lg mb-2">{ind.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-justify">{ind.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default AboutPage;

