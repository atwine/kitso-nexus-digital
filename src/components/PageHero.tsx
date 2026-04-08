import { ReactNode } from "react";

interface PageHeroProps {
  label?: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

const PageHero = ({ label, title, subtitle, children }: PageHeroProps) => (
  <section className="bg-navy pt-[68px]">
    <div className="container mx-auto px-4 lg:px-8 py-16 md:py-20">
      {label && <p className="section-label mb-3 fade-in">{label}</p>}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 fade-in fade-in-delay-1">
        {title}
      </h1>
      <p className="text-primary-foreground/70 max-w-2xl text-lg leading-relaxed fade-in fade-in-delay-2">
        {subtitle}
      </p>
      {children}
    </div>
  </section>
);

export default PageHero;
