import { chromium } from "playwright";
import fs from "node:fs";

function arg(name, fallback=null){
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && process.argv[idx+1]) return process.argv[idx+1];
  return fallback;
}

const url = arg("--url");
const out = arg("--out", "resume.pdf");

if (!url){
  console.error("Usage: node scripts/export_pdf.mjs --url <URL> --out resume.pdf");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(url, { waitUntil: "networkidle" });

// Ensure consistent print
await page.emulateMedia({ media: "print" });

await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
});

await browser.close();
console.log(`Wrote ${out}`);
