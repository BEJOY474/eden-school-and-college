import { readFileSync } from "node:fs";
import path from "node:path";
import AcademicCalendarMount from "./AcademicCalendarMount";
import LegacyInteractions from "./LegacyInteractions";
import SiteFooter from "./SiteFooter";

const sourceFiles = {
  home: "index.html",
  about: "About.html",
  academics: "Academics.html",
  admission: "Admission.html",
  contact: "Contacts.html",
  faculty: "Faculty.html",
  gallery: "Gallery.html",
  results: "Result.html",
  staff: "employ.html",
} as const;

export type LegacyPageName = keyof typeof sourceFiles;

const routeByLegacyFile: Record<string, string> = {
  "index.html": "/",
  "About.html": "/about",
  "Faculty.html": "/faculty",
  "Admission.html": "/admission",
  "Academics.html": "/academics",
  "Result.html": "/results",
  "Gallery.html": "/gallery",
  "Contacts.html": "/contact",
  "employ.html": "/staff",
  "gallery.html": "/gallery",
  "faculty.html": "/faculty",
};

const routeByPage: Record<LegacyPageName, string> = {
  home: "/",
  about: "/about",
  academics: "/academics",
  admission: "/admission",
  contact: "/contact",
  faculty: "/faculty",
  gallery: "/gallery",
  results: "/results",
  staff: "/staff",
};

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Faculty", href: "/faculty" },
  { label: "Admission", href: "/admission" },
  { label: "Academics", href: "/academics" },
  { label: "Result", href: "/results" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contacts", href: "/contact" },
  { label: "Staff", href: "/staff" },
];

const siteControlsMarkup = `<div class="site-controls">
  <button class="theme-toggle" type="button" aria-pressed="false" aria-label="Switch to dark mode">☾</button>
</div>`;

function getPageMarkup(page: LegacyPageName) {
  const filePath = path.join(process.cwd(), "legacy-pages", sourceFiles[page]);
  const source = readFileSync(filePath, "utf8");
  const body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];

  if (!body) {
    throw new Error(`The source page "${sourceFiles[page]}" has no body element.`);
  }

  const cleanedBody = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(
      /\b(href|src)\s*=\s*(["'])(.*?)\2/gi,
      (attribute, name: string, quote: string, value: string) => {
        const normalized = value.trim();
        const legacyRoute = routeByLegacyFile[normalized];

        if (legacyRoute) {
          return `${name}=${quote}${legacyRoute}${quote}`;
        }

        if (/^file:\/\/\/.*Admission(?:%20| )Form\.pdf$/i.test(normalized)) {
          return `${name}=${quote}/assets/Admission%20Form.pdf${quote}`;
        }

        if (
          /^(?:https?:|mailto:|tel:|data:|#|\/)/i.test(normalized) ||
          name.toLowerCase() !== "src" && !/\.(?:pdf)$/i.test(normalized)
        ) {
          return attribute;
        }

        return `${name}=${quote}/assets/${encodeURI(normalized)}${quote}`;
      },
    );
  const menuMarkup = `<ul id="nav-menu">${navigationItems
    .map(
      ({ label, href }) =>
        `<li><a href="${href}"${href === routeByPage[page] ? ' aria-current="page"' : ""}>${label}</a></li>`,
    )
    .join("")}</ul>`;
  const bodyWithSchoolHeader =
    page === "home"
      ? cleanedBody
      : cleanedBody.replace(
          /<div class="Address">[\s\S]*?<\/div>/i,
          `<div class="header-main">
    <img src="/assets/school.jpg" alt="Eden International School logo" class="school-logo">
    <div class="school-info">
      <h1>Eden International School &amp; College, Khilgaon, Dhaka</h1>
      <p>ইডেন ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ, খিলগাঁও, ঢাকা</p>
    </div>
  </div>`,
        );
  const bodyWithNavigation = bodyWithSchoolHeader.replace(
    /(<nav\b[^>]*>[\s\S]*?)<ul\b[^>]*>[\s\S]*?<\/ul>([\s\S]*?<\/nav>)/i,
    `$1${menuMarkup}$2`,
  );
  const navigationEnd = bodyWithNavigation.toLowerCase().lastIndexOf("</nav>");

  if (navigationEnd === -1) {
    throw new Error(`The source page "${sourceFiles[page]}" has no navigation element.`);
  }

  const contentStart = navigationEnd + "</nav>".length;
  const pageMarkup = `${bodyWithNavigation.slice(0, contentStart)}<div class="page-content">${bodyWithNavigation.slice(contentStart)}</div>`;
  return pageMarkup.replace(/<\/nav>/i, `${siteControlsMarkup}</nav>`);
}

export default function LegacyPage({
  page,
}: {
  page: LegacyPageName;
}) {
  const markup = getPageMarkup(page);

  return (
    <LegacyInteractions key={page} contactForm={page === "contact" || page === "home"}>
      <main
        className={`legacy-page legacy-page--${page}`}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {page === "home" && <AcademicCalendarMount />}
      <SiteFooter />
    </LegacyInteractions>
  );
}
