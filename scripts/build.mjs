import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import MarkdownIt from "markdown-it";

const root = process.cwd();
const now = new Date();
const mm = String(now.getMonth() + 1).padStart(2, "0");
const dd = String(now.getDate()).padStart(2, "0");
const yy = String(now.getFullYear()).slice(-2);

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

function parseFrontmatter(text){
  if (!text.startsWith("---")) return { fm: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trimStart();
  const fm = {};
  for (const line of raw.split("\n")){
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim().replace(/^"|"$/g, "");
    fm[k]=v;
  }
  return { fm, body };
}

function buildPage(srcPath, outPath, { pageTitle, headerExtra = "", backLink = "" } = {}) {
  const src = fs.readFileSync(srcPath, "utf-8");
  const { fm, body } = parseFrontmatter(src);
  const contentHtml = md.render(body);

  const name = fm.name || "Resume";
  const title = fm.title || "";
  const location = fm.location || "";
  const email = fm.email || "";
  const phone = fm.phone || "";
  const linkedin = fm.linkedin || "";
  const scholar = fm.scholar || "";

  const profileLinks = [
    linkedin ? `<a href="${linkedin}">LinkedIn</a>` : "",
    scholar ? `<a href="${scholar}">Google Scholar</a>` : "",
  ].filter(Boolean).join(`<span>•</span>`);

  const headerHtml = `
  <header class="header">
    <h1 class="name">${name}</h1>
    <div class="sub">${[title, location].filter(Boolean).join(" · ")}</div>
    <div class="links">
      ${email ? `<a href="mailto:${email}">${email}</a>` : ""}
      ${(email && phone) ? `<span>•</span>` : ""}
      ${phone ? `<a href="tel:${phone.replace(/[^\d+]/g,"")}">${phone}</a>` : ""}
    </div>
    ${profileLinks ? `<div class="links">${profileLinks}</div>` : ""}
    <div class="badgebar">
      ${headerExtra}
      ${backLink}
    </div>
  </header>
  `.trim();

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${name} — ${pageTitle || title}</title>
  <link rel="stylesheet" href="src/resume.css" />
</head>
<body>
  <main class="page">
    ${headerHtml}
    <article class="content">
      ${contentHtml}
    </article>
  </main>
</body>
</html>
`;
  fs.writeFileSync(outPath, html, "utf-8");
}

const outHtml = path.join(root, "index.html");
const outPdf = path.join(root, `resume - Bon Woong Ku - ${yy}${mm}${dd}.pdf`);
const outPubHtml = path.join(root, "publications.html");

buildPage(
  path.join(root, "src", "resume.md"),
  outHtml,
  {
    pageTitle: "Resume",
    headerExtra: `
      <a href="resume - Bon Woong Ku - ${yy}${mm}${dd}.pdf">Download PDF</a>
    `,
    backLink: `<a href="publications.html">Full Publication List</a>`,
  },
);
console.log("Wrote index.html");

buildPage(
  path.join(root, "src", "publications.md"),
  outPubHtml,
  {
    pageTitle: "Publications",
    backLink: `<a href="index.html">← Back to Resume</a>`,
  },
);
console.log("Wrote publications.html");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + outHtml, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });

await page.pdf({
  path: outPdf,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
});
await browser.close();
console.log("Wrote resume.pdf");
