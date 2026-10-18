import { useEffect } from "react";
import { OG_IMAGE, PAGE_META, PagePath, pageUrl } from "@/seo/pageMeta";

interface SEOProps {
  path: PagePath;
}

// Keeps head tags in sync during client-side navigation. The first page load
// already has the right tags, written into per-page HTML at build time.
const SEO = ({ path }: SEOProps) => {
  const { title, description } = PAGE_META[path];
  const url = pageUrl(path);

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
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

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
