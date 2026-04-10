import { Target, Handshake, Lightbulb, ShieldCheck, RefreshCcw, Users, Factory, Truck, Heart, Briefcase, ShoppingCart, HardHat } from "lucide-react";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

const team = [
  {
    initials: "AT",
    name: "Mr. Mugume T Atwine",
    role: "Technical Lead",
    bio: "Specializes in ERP implementation, system customization, and technical architecture. Ensures every solution is built right.",
  },
  {
    initials: "MF",
    name: "Mr. Fredrick Maripe",
    role: "Business Development",
    bio: "Leads client relationships, requirements gathering, and strategic advisory. Your first point of contact.",
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
            <div
              key={i}
              className="bg-card border border-custom rounded-lg p-6 transition-all duration-300 hover:shadow-md fade-in"
            >
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                {member.initials}
              </div>
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className="text-teal text-sm font-medium mb-2">{member.role}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
            </div>
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
