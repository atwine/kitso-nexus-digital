import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import NetworkCanvas from "./NetworkCanvas";

const layer = "absolute inset-0 -z-10 size-full object-cover object-right";

// The shared hero (Paper page J, "Network of points"; phone version on page K).
// Every page's hero is the same height, so pages don't jump: 560px on a laptop
// and 600px on a phone, both including the header that sits on top of it.
// The words go in as children, centred top to bottom below the header.
const Hero = ({ children }: { children: ReactNode }) => (
  <section className="relative isolate flex min-h-[600px] flex-col overflow-hidden bg-kn-teal lg:min-h-[560px]">
    {/* Layers, back to front: teal with its glow, the dots and lines (a still
        picture, swapped for the moving canvas once it starts), the shading
        that keeps the words readable. All pinned right, so phones show the
        lit side of the network. */}
    <img src="/hero/network-base.svg" alt="" className={layer} />
    <NetworkCanvas layerClassName={layer} />
    <img src="/hero/network-shade.svg" alt="" className={layer} />
    {/* Phones see only the right side of the network, so they get their own shade for the words. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-linear-to-r from-kn-teal/95 via-kn-teal/70 via-55% to-kn-teal/35 lg:hidden"
    />
    <div className="page-line flex flex-1 flex-col justify-center gap-4 pb-7 pt-[68px] lg:gap-5 lg:pb-14 lg:pt-[92px]">
      {children}
    </div>
  </section>
);

// Text pieces for the hero, sized as drawn: phone values first, laptop from lg.
export const HeroBadge = ({ children }: { children: ReactNode }) => (
  <p className="self-start rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold leading-4 text-white lg:px-3.5 lg:py-[7px] lg:text-[13px]">
    {children}
  </p>
);

// `className` lets one page widen the box when its title fits on one line in
// the drawing but the real font runs a few pixels wider (Contact).
export const HeroTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h1 className={cn("max-w-[760px] text-[42px] font-bold leading-[44px] tracking-[-0.05em] text-white lg:text-[68px] lg:leading-[70px]", className)}>
    {children}
  </h1>
);

export const HeroLead = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[560px] text-base leading-6 text-white/85 lg:text-lg lg:leading-7">{children}</p>
);

export const HeroActions = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2.5 pt-1.5 sm:flex-row sm:flex-wrap lg:gap-3 lg:pt-2">{children}</div>
);

export default Hero;
