import { PAGE_META, PagePath, pageUrl } from "./pageMeta";

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rewrites the page-specific head tags in the built index.html for one route.
// Throws if a tag is missing, so a change to index.html fails the build
// instead of silently shipping pages with the home page's tags.
export const renderPageHtml = (template: string, path: PagePath): string => {
  const { title, description } = PAGE_META[path];
  const url = pageUrl(path);

  const replacements: [RegExp, string][] = [
    [/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
    [/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(title)}$2`],
    [/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`],
    [/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeAttr(title)}$2`],
    [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`],
  ];

  return replacements.reduce((html, [pattern, replacement]) => {
    if (!pattern.test(html)) throw new Error(`renderPageHtml: index.html has no tag matching ${pattern}`);
    return html.replace(pattern, replacement);
  }, template);
};
