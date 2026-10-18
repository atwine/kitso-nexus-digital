// Single source of page titles/descriptions. Read by the <SEO> component at
// runtime and by the build (vite.config.ts) to write one HTML file per page,
// so crawlers and link previews see the right tags without running JS.
// Keep imports relative: vite.config.ts can't resolve the "@/" alias.

export const SITE_URL = "https://www.kitsonexus.com";
export const OG_IMAGE = `${SITE_URL}/logo.jpeg`;

export interface PageMeta {
  title: string;
  description: string;
}

export const PAGE_META = {
  "/": {
    title: "Kitso Nexus Advisory | ERP Consulting & Implementation in Botswana",
    description:
      "Kitso Nexus Advisory helps businesses in Southern Africa streamline operations with expert ERP consulting and implementation. Based in Gaborone, Botswana.",
  },
  "/services": {
    title: "Our Services | ERP Implementation, Training & Support | Kitso Nexus",
    description:
      "Explore our ERP services: implementation, customization, training, data migration, and ongoing support retainers across Southern Africa.",
  },
  "/about": {
    title: "About Us | Kitso Nexus Advisory — Gaborone, Botswana",
    description:
      "Learn about Kitso Nexus Advisory — a Botswana-based ERP consultancy helping businesses work smarter through intelligent operations.",
  },
  "/contact": {
    title: "Contact Us | Kitso Nexus Advisory",
    description:
      "Get in touch with Kitso Nexus Advisory. Book a free consultation or send us a message. Based in Gaborone, Botswana.",
  },
} as const satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof PAGE_META;

export const PAGE_PATHS = Object.keys(PAGE_META) as PagePath[];

export const pageUrl = (path: PagePath) => `${SITE_URL}${path}`;
