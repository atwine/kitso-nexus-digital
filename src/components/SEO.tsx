import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

const DEFAULT_SITE_URL =
  typeof window !== "undefined" && window.location && window.location.origin
    ? window.location.origin
    : "https://www.kitsonexus.com";
const SITE_URL = (import.meta as any).env?.VITE_SITE_URL || DEFAULT_SITE_URL;
const OG_IMAGE = `${SITE_URL}/logo.jpeg`;

const SEO = ({ title, description, path }: SEOProps) => {
  const url = `${SITE_URL}${path}`;

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:image", OG_IMAGE);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = "Kitso Nexus Advisory";
    };
  }, [title, description, url]);

  return null;
};

export default SEO;
