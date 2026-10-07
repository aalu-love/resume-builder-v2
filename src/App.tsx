import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, FileText, Info, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type ResumeEntry = {
  organization: string;
  role: string;
  dates: string;
  bullets: string[];
};

type ResumeData = {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: ResumeEntry[];
  education: ResumeEntry[];
  skills: string[];
  languages: string[];
  projects: string[];
  certifications: string[];
  additional: string[];
};

type ResumeStyle = 'classic' | 'clean' | 'banded' | 'sidebar';
type ColorTheme = 'terracotta' | 'ink' | 'ocean' | 'forest' | 'plum';
type TextSize = 'small' | 'medium' | 'large';

const STYLE_OPTIONS: Array<{ value: ResumeStyle; label: string; hint: string; }> = [
  { value: 'classic', label: 'Template 01', hint: 'Centered classic' },
  { value: 'clean', label: 'Template 02', hint: 'Structured clean' },
  { value: 'banded', label: 'Template 03', hint: 'Soft section bands' },
  { value: 'sidebar', label: 'Template 04', hint: 'Two-column sidebar' },
];
const COLOR_OPTIONS: Array<{ value: ColorTheme; label: string; swatch: string; }> = [
  { value: 'terracotta', label: 'Terracotta', swatch: '#b65237' },
  { value: 'ink', label: 'Ink', swatch: '#26363a' },
  { value: 'ocean', label: 'Ocean', swatch: '#2f7183' },
  { value: 'forest', label: 'Forest', swatch: '#4d745d' },
  { value: 'plum', label: 'Plum', swatch: '#79526e' },
];
const TEXT_SIZE_OPTIONS: Array<{ value: TextSize; label: string; shortLabel: string; scale: number; }> = [
  { value: 'small', label: 'Small', shortLabel: 'S', scale: 0.9 },
  { value: 'medium', label: 'Standard', shortLabel: 'M', scale: 1.05 },
  { value: 'large', label: 'Large', shortLabel: 'L', scale: 1.1 },
];

const queryClient = new QueryClient();

const SAMPLE_RESUME = `Maya Chen
Product Designer | Product strategy, Research, Design systems
Contact
Address: San Francisco, CA
Phone: +1 415 555 0188
Email: maya.chen@email.com
LinkedIn: linkedin.com/in/mayachen
Portfolio: mayachen.design

Summary
Product designer with 7 years of experience turning complex workflows into clear, useful tools. I work across research, systems thinking, and visual craft to help teams ship products people return to.

Skills
Programming: HTML & CSS
Databases: Data-informed product decisions
Frameworks/Libraries: Design systems
Tools/Technologies: Figma, Prototyping, Facilitation
Data Analysis: User research

Education
California College of the Arts | BFA, Interaction Design | 2015 — 2019
- Graduated with distinction. Thesis focused on accessible public services.

Experiences
Employee: Senior Product Designer Employer: Northstar Health Duration: 2022 — Present
- Led the redesign of a clinician workflow used by 18,000 monthly practitioners, reducing time-to-complete by 31%.
- Built a modular design system with engineering partners, bringing new feature delivery from weeks to days.
- Mentored two designers through quarterly critique and portfolio reviews.

Employee: Product Designer Employer: Good Form Studio Duration: 2019 — 2022
- Shaped early product direction for four venture-backed teams across health, finance, and education.
- Ran 40+ interviews and usability studies, translating patterns into product strategy and prototypes.

Projects
- Design system for a healthcare platform
- Discovery toolkit for early-stage product teams

Certifications
- Nielsen Norman Group UX Certification | 2023

Languages
English: Native | Mandarin: Conversational`;

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function parseEntry(line: string, fallbackRole = ''): ResumeEntry {
  const parts = line.split('|').map(cleanText);
  return {
    organization: parts[0] || 'Organization',
    role: parts[1] || fallbackRole,
    dates: parts[2] || '',
    bullets: [],
  };
}

function parseResume(source: string): ResumeData {
  const lines = source.split(/\r?\n/);
  const data: ResumeData = {
    name: 'Your Name',
    title: 'Your title',
    contact: [],
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    additional: [],
  };
  let section = '';
  let activeEntry: ResumeEntry | null = null;
  let summaryLines: string[] = [];

  const sectionMap: Record<string, string> = {
    CONTACT: 'contact',
    SUMMARY: 'summary',
    'ABOUT ME': 'summary',
    EXPERIENCE: 'experience',
    EXPERIENCES: 'experience',
    'WORK EXPERIENCE': 'experience',
    'PROFESSIONAL EXPERIENCE': 'experience',
    EDUCATION: 'education',
    SKILLS: 'skills',
    'TECHNICAL SKILLS': 'skills',
    LANGUAGES: 'languages',
    'ADDITIONAL INFORMATION': 'additional',
    PROJECTS: 'projects',
    CERTIFICATIONS: 'certifications',
  };

  const commitEntry = () => {
    if (activeEntry && (section === 'experience' || section === 'education')) {
      const entries = section === 'experience' ? data.experience : data.education;
      entries.push(activeEntry);
    }
    activeEntry = null;
  };

  let identityLine = 0;
  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    // Support the exact plain-text template supplied with the brief:
    // name on line one, then title and expertise before the Contact heading.
    if (!section && identityLine === 0 && !line.includes(':')) {
      data.name = line;
      identityLine = 1;
      return;
    }
    if (!section && identityLine === 1 && !line.includes(':')) {
      const titleParts = line.split('|').map(cleanText).filter(Boolean);
      data.title = titleParts[0] || data.title;
      if (titleParts[1]) data.skills.push(titleParts[1]);
      identityLine = 2;
      return;
    }

    const headerMatch = line.match(/^(NAME|TITLE|ROLE|CONTACT)\s*:\s*(.*)$/i);
    if (headerMatch) {
      const key = headerMatch[1].toUpperCase();
      const value = cleanText(headerMatch[2]);
      if (key === 'NAME') data.name = value || data.name;
      if (key === 'TITLE' || key === 'ROLE') data.title = value || data.title;
      if (key === 'CONTACT') data.contact = value.split('|').map(cleanText).filter(Boolean);
      return;
    }

    const normalized = line.replace(/:$/, '').toUpperCase();
    if (sectionMap[normalized]) {
      if (section === 'summary') {
        data.summary = summaryLines.join(' ');
      }
      commitEntry();
      section = sectionMap[normalized];
      summaryLines = [];
      return;
    }

    if (section === 'contact') {
      const contactMatch = line.match(/^(Address|Phone|Email|LinkedIn|Portfolio|Github)\s*:\s*(.*)$/i);
      if (contactMatch) {
        data.contact.push(`${contactMatch[1]}: ${cleanText(contactMatch[2])}`);
      } else if (line) {
        data.contact.push(cleanText(line));
      }
      return;
    }

    if (line.startsWith('-') || line.startsWith('•')) {
      const bullet = cleanText(line.replace(/^[-•]\s*/, ''));
      if (activeEntry && (section === 'experience' || section === 'education')) activeEntry.bullets.push(bullet);
      else if (section === 'additional') data.additional.push(bullet);
      else if (section === 'skills') data.skills.push(bullet);
      else if (section === 'projects') data.projects.push(bullet);
      else if (section === 'certifications') data.certifications.push(bullet);
      return;
    }

    if (section === 'experience' || section === 'education') {
      const employeeMatch = line.match(/^Employee:\s*(.*?)\s+Employer:\s*(.*?)\s+Duration:\s*(.*)$/i);
      if (employeeMatch) {
        commitEntry();
        activeEntry = {
          role: cleanText(employeeMatch[1]),
          organization: cleanText(employeeMatch[2]),
          dates: cleanText(employeeMatch[3]),
          bullets: [],
        };
      } else if (line.includes('|')) {
        commitEntry();
        activeEntry = parseEntry(line);
      } else if (activeEntry) {
        activeEntry.bullets.push(cleanText(line));
      }
    } else if (section === 'summary') {
      summaryLines.push(cleanText(line));
    } else if (section === 'skills' || section === 'languages' || section === 'projects' || section === 'certifications') {
      const values = line.split('|').map(cleanText).filter(Boolean);
      const list = section === 'skills'
        ? data.skills
        : section === 'languages'
          ? data.languages
          : section === 'projects'
            ? data.projects
            : data.certifications;
      list.push(...values);
    } else if (section === 'additional') {
      data.additional.push(cleanText(line));
    }
  });

  commitEntry();
  if (section === 'summary') {
    data.summary = summaryLines.join(' ');
  }
  return data;
}

function fitCopy(text: string, fit: boolean, limit: number) {
  if (!fit || text.length <= limit) return text;
  return `${text.slice(0, limit).replace(/\s+\S*$/, '')}…`;
}

function SectionHeading({ children }: { children: string; }) {
  return <h3 className="paper-section-heading" data-testid={`heading-${children.toLowerCase().replace(/\s+/g, '-')}`}>{children}</h3>;
}

function ContactLine({ items, className = '' }: { items: string[]; className?: string; }) {
  return (
    <div className={`paper-contact ${className}`} data-testid="text-resume-contact">
      {items.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
    </div>
  );
}

function Skills({ data, fit }: { data: ResumeData; fit: boolean; }) {
  if (!data.skills.length) return null;
  return (
    <div className="skill-grid" data-testid="list-resume-skills">
      {data.skills.map((skill, index) => <span className="skill-item" key={`${skill}-${index}`}>{fitCopy(skill, fit, 54)}</span>)}
    </div>
  );
}

function Languages({ data, fit }: { data: ResumeData; fit: boolean; }) {
  if (!data.languages.length) return null;
  return (
    <div className="skill-grid" data-testid="list-resume-languages">
      {data.languages.map((language, index) => <span className="skill-item" key={`${language}-${index}`}>{fitCopy(language, fit, 54)}</span>)}
    </div>
  );
}

function TextList({ items, fit, className = '' }: { items: string[]; fit: boolean; className?: string; }) {
  if (!items.length) return null;
  return (
    <ul className={`text-list ${className}`}>
      {items.map((item, index) => <li key={`${item}-${index}`}>{fitCopy(item, fit, 160)}</li>)}
    </ul>
  );
}

function EntryList({ entries, fit, className = '' }: { entries: ResumeEntry[]; fit: boolean; className?: string; }) {
  return (
    <div className={className} data-testid="list-resume-entries">
      {entries.map((entry, index) => (
        <article className="paper-entry" key={`${entry.organization}-${index}`} data-testid={`entry-resume-${index}`}>
          <div className="entry-top">
            <span className="entry-org">{entry.organization}</span>
            {entry.dates && <span className="entry-dates">{entry.dates}</span>}
          </div>
          {entry.role && <div className="entry-role">{entry.role}</div>}
          {entry.bullets.length > 0 && (
            <ul className="entry-bullets">
              {entry.bullets.map((bullet, bulletIndex) => (
                <li key={`${bullet}-${bulletIndex}`}>{fitCopy(bullet, fit, 132)}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

function ResumeHeader({ data, centered = false }: { data: ResumeData; centered?: boolean; }) {
  return (
    <header className={`paper-header ${centered ? 'is-centered' : ''}`}>
      <h1 className="paper-name" data-testid="text-resume-name">{data.name}</h1>
      <p className="paper-title" data-testid="text-resume-title">{data.title}</p>
      {data.contact.length > 0 && <ContactLine items={data.contact} />}
    </header>
  );
}

function ClassicPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
  return (
    <>
      <ResumeHeader data={data} centered />
      <div className="classic-rule" />
      {data.summary && <section className="paper-section"><SectionHeading>About Me</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{fitCopy(data.summary, fit, 470)}</p></section>}
      {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
      {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Work Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
      {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
      {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
      {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
      {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Languages</SectionHeading><Languages data={data} fit={fit} /></section>}
    </>
  );
}

function CleanPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
  return (
    <>
      <ResumeHeader data={data} centered />
      <div className="clean-rule" />
      {data.summary && <section className="paper-section"><SectionHeading>About Me</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{fitCopy(data.summary, fit, 430)}</p></section>}
      {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
      {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Professional Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
      {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Technical Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
      {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
      {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
      {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Additional Information</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{[...data.languages, ...data.additional].join(' · ')}</p></section>}
    </>
  );
}

function BandedPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
  return (
    <>
      <ResumeHeader data={data} />
      {data.summary && <section className="paper-section"><SectionHeading>Summary</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{fitCopy(data.summary, fit, 430)}</p></section>}
      {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Technical Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
      {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Professional Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
      {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
      {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
      {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
      {(data.languages.length > 0 || data.additional.length > 0) && <section className="paper-section"><SectionHeading>Additional Information</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{[...data.languages, ...data.additional].join(' · ')}</p></section>}
    </>
  );
}

function SidebarPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
  return (
    <>
      <ResumeHeader data={data} />
      <div className="sidebar-layout">
        <aside className="sidebar-column">
          {data.contact.length > 0 && <section className="paper-section"><SectionHeading>Contact</SectionHeading><ContactLine items={data.contact} className="sidebar-contact" /></section>}
          {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
          {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
          {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Languages</SectionHeading><Languages data={data} fit={fit} /></section>}
        </aside>
        <div className="main-column">
          {data.summary && <section className="paper-section"><SectionHeading>Profile</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{fitCopy(data.summary, fit, 430)}</p></section>}
          {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Work Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
          {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
          {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
          {data.additional.length > 0 && <section className="paper-section"><SectionHeading>Reference</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{fitCopy(data.additional.join(' '), fit, 240)}</p></section>}
        </div>
      </div>
    </>
  );
}

function ResumePaper({ data, style, fit, colorTheme, textSize }: { data: ResumeData; style: ResumeStyle; fit: boolean; colorTheme: ColorTheme; textSize: TextSize; }) {
  const hasContent = Boolean(data.name || data.summary || data.experience.length || data.education.length || data.projects.length || data.certifications.length);
  if (!hasContent) return <div className="empty-preview" data-testid="empty-preview">Start writing on the left and your resume will appear here.</div>;
  const textScale = TEXT_SIZE_OPTIONS.find((option) => option.value === textSize)?.scale ?? 1;

  return (
    <div className={`paper ${style} ${fit ? 'fit' : ''}`} data-color-theme={colorTheme} data-text-size={textSize} data-testid="resume-paper">
      <div
        className="paper-copy"
        style={{
          '--paper-copy-scale': textScale,
          '--paper-copy-width': `${100 / textScale}%`,
        } as CSSProperties}
      >
        {style === 'classic' && <ClassicPaper data={data} fit={fit} />}
        {style === 'clean' && <CleanPaper data={data} fit={fit} />}
        {style === 'banded' && <BandedPaper data={data} fit={fit} />}
        {style === 'sidebar' && <SidebarPaper data={data} fit={fit} />}
      </div>
    </div>
  );
}

function Home() {
  const [source, setSource] = useState(SAMPLE_RESUME);
  const [style, setStyle] = useState<ResumeStyle>('classic');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('terracotta');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [fit, setFit] = useState(false);
  const data = useMemo(() => parseResume(source), [source]);
  const lineCount = source.split(/\r?\n/).filter(Boolean).length;
  const entryCount = data.experience.length + data.education.length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const resetResume = () => setSource(SAMPLE_RESUME);
  const printResume = () => window.print();

  console.log('Resume data:', data);

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand-lockup" data-testid="brand-lockup">
          <span className="brand-mark">rs</span>
          <span className="brand-name">resume studio</span>
          <span className="brand-meta">plain text → polished page</span>
        </div>
        <div className="top-actions">
          <span className="save-note" data-testid="status-local-save">saved locally</span>
          <button className="quiet-button" onClick={resetResume} data-testid="button-reset-top">
            <RotateCcw size={13} strokeWidth={1.8} /> Reset sample
          </button>
          <button className="primary-button" onClick={printResume} data-testid="button-print-top">
            <Printer size={14} strokeWidth={1.9} /> Print / save PDF
          </button>
        </div>
      </header>

      <div className="studio-grid">
        <section className="editor-column" aria-label="Resume editor">
          <div className="eyebrow">A quieter way to apply</div>
          <h2 className="editor-heading">Make the words look like you.</h2>
          <p className="editor-intro">
            Write in a simple template. We’ll take care of the hierarchy, rhythm, and the small details that make a resume feel finished.
          </p>

          <div className="editor-tools">
            <span className="tool-label">Your source</span>
            <button className="template-button" onClick={resetResume} data-testid="button-reset-editor">
              <FileText size={13} strokeWidth={1.8} /> Load sample <ChevronDown size={13} />
            </button>
          </div>
          <div className="editor-panel">
            <div className="editor-panel-bar">
              <span className="format-hint">template format · plain text</span>
              <Info size={14} color="hsl(190 10% 43%)" aria-label="Use the headings shown in the sample" />
            </div>
            <textarea
              className="resume-input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-label="Plain text resume template"
              data-testid="input-resume-source"
            />
            <div className="editor-footer">
              <span data-testid="text-source-stats">{lineCount} lines · {source.length.toLocaleString()} characters</span>
              <span className="keyboard-hint"><kbd>⌘</kbd> <kbd>P</kbd> to print</span>
            </div>
          </div>
        </section>

        <section className="preview-column" aria-label="Resume preview">
          <div className="preview-toolbar">
            <div className="preview-label"><span className="live-dot" /> Live preview <span data-testid="status-entry-count">· {entryCount} entries</span></div>
            <div className="preview-controls">
              <div className="style-switcher" role="group" aria-label="Resume style">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="style-choice"
                    aria-pressed={style === option.value}
                    onClick={() => setStyle(option.value)}
                    data-testid={`button-style-${option.value}`}
                    title={option.hint}
                  >
                    <span className="style-index">{option.label.split(' ')[1]}</span>
                    <span className="style-name">{option.hint}</span>
                  </button>
                ))}
              </div>
              <div className="color-switcher" role="group" aria-label="Resume color theme">
                <span className="color-label">Color</span>
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="color-choice"
                    aria-label={option.label}
                    aria-pressed={colorTheme === option.value}
                    onClick={() => setColorTheme(option.value)}
                    data-testid={`button-color-${option.value}`}
                    title={option.label}
                  >
                    <span style={{ backgroundColor: option.swatch }} />
                  </button>
                ))}
              </div>
              <div className="text-size-switcher" role="group" aria-label="Resume text size">
                <span className="color-label">Text</span>
                {TEXT_SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="text-size-choice"
                    aria-label={option.label}
                    aria-pressed={textSize === option.value}
                    onClick={() => setTextSize(option.value)}
                    data-testid={`button-text-size-${option.value}`}
                    title={option.label}
                  >
                    {option.shortLabel}
                  </button>
                ))}
              </div>
              <label className="fit-control" data-testid="label-fit-mode">
                <input type="checkbox" checked={fit} onChange={(event) => setFit(event.target.checked)} data-testid="input-fit-mode" />
                <span>One-page fit</span>
                {fit && <Check size={12} />}
              </label>
            </div>
          </div>
          <div className="paper-stage">
            <ResumePaper data={data} style={style} fit={fit} colorTheme={colorTheme} textSize={textSize} />
          </div>
          <section className="template-gallery" aria-label="Resume template previews">
            <div className="gallery-heading">
              <div>
                <span className="gallery-eyebrow">Compare layouts</span>
                <h3>Choose a template</h3>
              </div>
              <span className="gallery-note">Click any preview to use it</span>
            </div>
            <div className="style-preview-grid">
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`style-preview-card ${style === option.value ? 'is-selected' : ''}`}
                  onClick={() => setStyle(option.value)}
                  aria-pressed={style === option.value}
                  data-testid={`preview-style-${option.value}`}
                >
                  <div className="style-preview-card-head">
                    <span>{option.label}</span>
                    <span>{style === option.value ? 'Selected' : 'Preview'}</span>
                  </div>
                  <div className="style-preview-viewport">
                    <ResumePaper data={data} style={option.value} fit={true} colorTheme={colorTheme} textSize={textSize} />
                  </div>
                  <div className="style-preview-card-foot">
                    <strong>{option.hint}</strong>
                    <span>{style === option.value ? 'Active template' : 'Use this style'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <div className="editor-footer" style={{ marginTop: 10, paddingInline: 3, borderTop: 0 }}>
            <span data-testid="status-preview-mode">{fit ? 'Copy condensed for one page' : 'Full copy shown'} · {STYLE_OPTIONS.find((option) => option.value === style)?.hint} · {COLOR_OPTIONS.find((option) => option.value === colorTheme)?.label} · {TEXT_SIZE_OPTIONS.find((option) => option.value === textSize)?.label} text</span>
            <button className="template-button" onClick={printResume} data-testid="button-print-preview">
              <Printer size={13} strokeWidth={1.8} /> Print / save PDF <Sparkles size={12} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode; }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
