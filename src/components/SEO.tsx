import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

const BASE_URL = "https://www.kitsonexus.com";
const OG_IMAGE = `${BASE_URL}/logo.jpeg`;

const SEO = ({ title, description, path }: SEOProps) => {
  const url = `${BASE_URL}${path}`;

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
