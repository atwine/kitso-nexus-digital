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
      <SEO
        title="Contact Us | Kitso Nexus Advisory"
        description="Get in touch with Kitso Nexus Advisory. Book a free consultation or send us a message. Based in Gaborone, Botswana."
        path="/contact"
      />
      <PageHero
        label="Contact"
        title="Get in touch"
        subtitle="Have a question, need a quote, or ready to get started? We'd love to hear from you."
      >
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-primary-foreground/85 max-w-3xl">
          <div className="flex items-center gap-2 rounded-md px-3 py-2 border-2 border-primary-foreground">
            <Mail size={16} className="text-teal" />
            <span>info@kitsonexus.com</span>
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

      {/* Quick actions */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg">Book a Free Consultation</Button>
            </a>
            <a href="https://wa.me/26773989514" target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="lg">Chat on WhatsApp</Button>
            </a>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { icon: Linkedin, label: "LinkedIn", href: "#" },
              { icon: Facebook, label: "Facebook", href: "#" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-custom text-sm text-muted-foreground hover:border-teal hover:text-teal transition-colors"
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-custom text-sm text-muted-foreground hover:border-teal hover:text-teal transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter/X
            </a>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="pb-16">
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
                  { icon: Mail, label: "info@kitsonexus.com" },
                  { icon: Phone, label: "+267 73 989 514" },
                  { icon: Clock, label: "Monday–Friday, 8:00 AM – 5:00 PM (CAT)" },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center">
                      <Icon size={18} className="text-teal" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>

              <div className="bg-surface rounded-lg h-[210px] flex items-center justify-center text-muted-foreground text-sm">
                Google Maps embed — Gaborone
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
