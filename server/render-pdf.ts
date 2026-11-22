import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

export type ResumeStyle = 'classic' | 'clean' | 'banded' | 'sidebar';
export type ColorTheme = 'terracotta' | 'ink' | 'ocean' | 'forest' | 'plum';
export type TextSize = 'small' | 'medium' | 'large';

export type PdfPayload = {
  source: string;
  style: ResumeStyle;
  colorTheme: ColorTheme;
  textSize: TextSize;
  fit: boolean;
};

// Chrome or Edge is needed to print the preview. CHROME_PATH overrides the search.
const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

function findBrowser(): string {
  const found = [process.env.CHROME_PATH, ...BROWSER_CANDIDATES].find(
    (path): path is string => Boolean(path && existsSync(path)),
  );
  if (!found) throw new Error('No Chrome or Edge found. Set CHROME_PATH to a browser executable.');
  return found;
}

// Opens the app's /print route with the settings injected, then prints the
// rendered resume to A4. The page is the same ResumePaper used in the preview.
export async function renderResumePdf(baseUrl: string, payload: PdfPayload): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(`window.__RESUME_PAYLOAD__ = ${JSON.stringify(payload)};`);
    await page.goto(`${baseUrl}/print`, { waitUntil: 'networkidle0', timeout: 60_000 });
    await page.waitForSelector('[data-testid="resume-paper"]', { timeout: 30_000 });
    await page.evaluate('document.fonts.ready.then(() => true)');

    return await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}
