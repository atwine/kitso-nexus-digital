import { ReactNode } from "react";

interface PageHeroProps {
  label?: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

const PageHero = ({ label, title, subtitle, children }: PageHeroProps) => (
  <section className="bg-navy hero-section pt-[80px] min-h-[420px] md:min-h-[500px] lg:min-h-[560px]">
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-[4.5rem] lg:py-20">
      {label && <p className="section-label mb-3 fade-in">{label}</p>}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 fade-in fade-in-delay-1">
        {title}
      </h1>
      <p className="text-primary-foreground/70 max-w-2xl text-lg leading-relaxed fade-in fade-in-delay-2">
        {subtitle}
      </p>
      {children}
    </div>
    {/* Subtle gradient fade at hero bottom */}
    <div className="h-8 bg-gradient-to-b from-transparent to-black/10" />
  </section>
);

export default PageHero;
