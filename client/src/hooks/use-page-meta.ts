import { useEffect } from "react";

const SITE_NAME = "Find & Hire Me";
const DEFAULT_DESC = "Find and hire top talent or discover your next career opportunity across US, UK, Nigeria, and remote global positions.";

function setMetaTag(selector: string, attr: string, content: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const parts = selector.match(/\[(\w+)="([^"]+)"\]/g);
    if (parts) {
      parts.forEach(p => {
        const m = p.match(/\[(\w+)="([^"]+)"\]/);
        if (m) el!.setAttribute(m[1], m[2]);
      });
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
}

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESC;

    document.title = fullTitle;
    setMetaTag('meta[name="description"]', "content", desc);
    setMetaTag('meta[property="og:title"]', "content", fullTitle);
    setMetaTag('meta[property="og:description"]', "content", desc);
    setMetaTag('meta[name="twitter:title"]', "content", fullTitle);
    setMetaTag('meta[name="twitter:description"]', "content", desc);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description]);
}
