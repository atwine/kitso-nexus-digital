import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";
import { PAGE_META, PagePath, pageUrl } from "./pageMeta";
import { renderPageHtml } from "./renderPageHtml";

const root = resolve(__dirname, "../..");
const template = readFileSync(resolve(root, "index.html"), "utf8");
const routes = Object.keys(PAGE_META) as PagePath[];

const headOf = (html: string) => new DOMParser().parseFromString(html, "text/html").head;
const attr = (head: HTMLHeadElement, selector: string, name: string) =>
  head.querySelector(selector)?.getAttribute(name);

describe("renderPageHtml", () => {
  it.each(routes)("writes %s's own tags into the page HTML", (route) => {
    const { title, description } = PAGE_META[route];
    const head = headOf(renderPageHtml(template, route));

    expect(head.querySelector("title")?.textContent).toBe(title);
    expect(attr(head, 'meta[name="description"]', "content")).toBe(description);
    expect(attr(head, 'link[rel="canonical"]', "href")).toBe(pageUrl(route));
    expect(attr(head, 'meta[property="og:title"]', "content")).toBe(title);
    expect(attr(head, 'meta[property="og:description"]', "content")).toBe(description);
    expect(attr(head, 'meta[property="og:url"]', "content")).toBe(pageUrl(route));
    expect(attr(head, 'meta[name="twitter:title"]', "content")).toBe(title);
    expect(attr(head, 'meta[name="twitter:description"]', "content")).toBe(description);
  });

  it("fails loudly when index.html is missing a tag it should rewrite", () => {
    const broken = template.replace(/<link rel="canonical"[^>]*>/, "");
    expect(() => renderPageHtml(broken, "/about")).toThrow(/canonical/);
  });

  it("covers exactly the pages listed in the sitemap", () => {
    const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(routes.map(pageUrl).sort());
  });
});
