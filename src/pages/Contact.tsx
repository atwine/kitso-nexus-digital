import { useState, FormEvent } from "react";
import { MapPin, Mail, Phone, Clock, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll be in touch soon.");
    setForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <main>
      <SEO path="/contact" />
      <PageHero
        label="Contact"
        title="Get in touch"
        subtitle="Have a question, need a quote, or ready to get started? We'd love to hear from you."
      >
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-primary-foreground/85 max-w-3xl">
          <div className="flex items-center gap-2 rounded-md px-3 py-2 border-2 border-primary-foreground">
            <Mail size={16} className="text-teal" />
            <a href="mailto:info@kitsonexus.com" className="hover:text-teal transition-colors">info@kitsonexus.com</a>
          </div>
          <div className="flex items-center gap-2 rounded-md px-3 py-2 border-2 border-primary-foreground">
            <Phone size={16} className="text-teal" />
            <span>+267 73 989 514</span>
          </div>
          <div className="flex items-center gap-2 rounded-md px-3 py-2 border-2 border-primary-foreground">
            <Clock size={16} className="text-teal" />
            <span>Mon–Fri, 8:00–17:00 (CAT)</span>
          </div>
        </div>
      </PageHero>

      {/* Form + Info */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 fade-in">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border border-custom bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border border-custom bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border border-custom bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-md border border-custom bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue resize-none"
                />
              </div>
              <Button variant="hero" size="lg" type="submit" className="w-full">
                Send Message
              </Button>
            </form>

            {/* Info */}
            <div className="fade-in fade-in-delay-2">
              <h3 className="font-bold text-lg mb-6">Contact Information</h3>
              <div className="space-y-4 mb-8">
                {[
                  { icon: MapPin, label: "Gaborone, Botswana" },
                  { icon: Mail, label: "info@kitsonexus.com", href: "mailto:info@kitsonexus.com" },
                  { icon: Phone, label: "+267 73 989 514" },
                  { icon: Clock, label: "Monday–Friday, 8:00 AM – 5:00 PM (CAT)" },
                ].map(({ icon: Icon, label, href }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center">
                      <Icon size={18} className="text-teal" />
                    </div>
                    {href ? <a href={href} className="hover:text-teal transition-colors">{label}</a> : label}
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-3 mb-8">
                <a
                  href="https://www.linkedin.com/company/kitso-nexus-advisory/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0A66C2] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61589163866211"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Facebook size={16} />
                  Facebook
                </a>
              </div>

              <iframe
                title="Map of Gaborone, Botswana"
                src="https://www.google.com/maps?q=Gaborone,Botswana&output=embed"
                className="w-full h-[210px] rounded-lg border-0 bg-surface"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
