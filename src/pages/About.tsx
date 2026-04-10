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
    title: "Precision",
    desc: "We get the details right. No guesswork, no shortcuts.",
  },
  {
    title: "Partnership",
    desc: "Your success is our success. We work alongside you, not above you.",
  },
  {
    title: "Practicality",
    desc: "Solutions that work in the real world, not just on paper.",
  },
];

const industries = [
  "Manufacturing",
  "Equipment & Machinery",
  "Non-profits & Churches",
  "Professional Services",
  "Retail & Distribution",
  "Construction",
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
          <span key={ind} className="px-3 py-2 rounded-md border-2 border-primary-foreground">
            {ind}
          </span>
        ))}
      </div>
    </PageHero>

    {/* Our Story */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <p className="section-label mb-3">Our Story</p>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Kitso Nexus Advisory was founded with a simple belief: that businesses in Southern Africa deserve the same caliber of operational technology and consulting that's available anywhere in the world. We saw too many organizations struggling with manual processes, disconnected systems, and ERP implementations that didn't fit their reality.
          </p>
          <p>
            So we built a consultancy that puts understanding first. We don't lead with software — we lead with listening. Every engagement starts with learning how your business actually works, then designing solutions that fit your people, your processes, and your goals.
          </p>

          <blockquote className="border-l-4 border-teal pl-6 py-2 my-6 italic text-foreground">
            "Kitso" means knowledge in Setswana. We bring that knowledge to every engagement — bridging the gap between technology and the people who use it every day.
          </blockquote>

          <p>
            Based in Gaborone, Botswana, we serve clients across multiple industries and pride ourselves on building long-term partnerships — not one-off projects. When you work with Kitso Nexus, you get a team that stays with you well beyond go-live.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="border border-custom rounded-lg p-6 border-t-4 border-t-teal fade-in">
              <h3 className="font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Industries */}
    <section className="bg-surface py-16">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <p className="section-label mb-2">Industries We Serve</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Across Sectors
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {industries.map((ind) => (
            <span
              key={ind}
              className="bg-teal/10 text-teal px-4 py-2 rounded-full text-sm font-medium"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default AboutPage;
