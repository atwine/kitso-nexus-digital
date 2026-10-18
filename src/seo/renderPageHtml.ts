import { PAGE_META, PagePath, pageUrl } from "./pageMeta";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rewrites the page-specific head tags in the built index.html for one route.
// Throws if a tag is missing, so a change to index.html fails the build
// instead of silently shipping pages with the home page's tags.
export const renderPageHtml = (template: string, path: PagePath): string => {
  const { title, description } = PAGE_META[path];
  const url = pageUrl(path);

  // [opening of the tag up to the value, new value]; the value runs to the next quote.
  const attrs: [string, string][] = [
    ['<meta name="description" content="', description],
    ['<link rel="canonical" href="', url],
    ['<meta property="og:title" content="', title],
    ['<meta property="og:description" content="', description],
    ['<meta property="og:url" content="', url],
    ['<meta name="twitter:title" content="', title],
    ['<meta name="twitter:description" content="', description],
  ];

  const swap = (html: string, pattern: RegExp, value: string) => {
    if (!pattern.test(html)) throw new Error(`renderPageHtml: index.html has no tag matching ${pattern}`);
    // Function replacer, so "$" in copy is never read as a replacement pattern.
    return html.replace(pattern, (_, open: string, close: string) => open + value + close);
  };

  const withTitle = swap(template, /(<title>)[^<]*(<\/title>)/, escapeHtml(title));
  return attrs.reduce(
    (html, [open, value]) => swap(html, new RegExp(`(${open})[^"]*(")`), escapeHtml(value)),
    withTitle,
  );
};
