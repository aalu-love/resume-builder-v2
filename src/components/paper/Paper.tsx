// function ClassicPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
//     return (
//         <>
//             <ResumeHeader data={data} centered />
//             <div className="classic-rule" />
//             {data.summary && <section className="paper-section"><SectionHeading>About Me</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{renderRich(fitCopy(data.summary, fit, 470))}</p></section>}
//             {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
//             {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Work Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
//             {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
//             {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
//             {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
//             {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Languages</SectionHeading><Languages data={data} fit={fit} /></section>}
//         </>
//     );
// }

// function CleanPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
//     return (
//         <>
//             <ResumeHeader data={data} centered />
//             <div className="clean-rule" />
//             {data.summary && <section className="paper-section"><SectionHeading>About Me</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{renderRich(fitCopy(data.summary, fit, 430))}</p></section>}
//             {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
//             {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Professional Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
//             {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Technical Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
//             {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
//             {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
//             {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Additional Information</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{renderRich([...data.languages, ...data.additional].join(' · '))}</p></section>}
//         </>
//     );
// }

// function BandedPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
//     return (
//         <>
//             <ResumeHeader data={data} />
//             {data.summary && <section className="paper-section"><SectionHeading>Summary</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{renderRich(fitCopy(data.summary, fit, 430))}</p></section>}
//             {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Technical Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
//             {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Professional Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
//             {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
//             {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
//             {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
//             {(data.languages.length > 0 || data.additional.length > 0) && <section className="paper-section"><SectionHeading>Additional Information</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{[...data.languages, ...data.additional].join(' · ')}</p></section>}
//         </>
//     );
// }

// function SidebarPaper({ data, fit }: { data: ResumeData; fit: boolean; }) {
//     return (
//         <>
//             <ResumeHeader data={data} />
//             <div className="sidebar-layout">
//                 <aside className="sidebar-column">
//                     {data.contact.length > 0 && <section className="paper-section"><SectionHeading>Contact</SectionHeading><ContactLine items={data.contact} className="sidebar-contact" /></section>}
//                     {data.education.length > 0 && <section className="paper-section"><SectionHeading>Education</SectionHeading><EntryList entries={data.education} fit={fit} /></section>}
//                     {data.skills.length > 0 && <section className="paper-section"><SectionHeading>Skills</SectionHeading><Skills data={data} fit={fit} /></section>}
//                     {data.languages.length > 0 && <section className="paper-section"><SectionHeading>Languages</SectionHeading><Languages data={data} fit={fit} /></section>}
//                 </aside>
//                 <div className="main-column">
//                     {data.summary && <section className="paper-section"><SectionHeading>Profile</SectionHeading><p className="paper-summary" data-testid="text-resume-summary">{renderRich(fitCopy(data.summary, fit, 430))}</p></section>}
//                     {data.experience.length > 0 && <section className="paper-section"><SectionHeading>Work Experience</SectionHeading><EntryList entries={data.experience} fit={fit} /></section>}
//                     {data.projects.length > 0 && <section className="paper-section"><SectionHeading>Projects</SectionHeading><TextList items={data.projects} fit={fit} /></section>}
//                     {data.certifications.length > 0 && <section className="paper-section"><SectionHeading>Certifications</SectionHeading><TextList items={data.certifications} fit={fit} /></section>}
//                     {data.additional.length > 0 && <section className="paper-section"><SectionHeading>Reference</SectionHeading><p className="paper-summary" data-testid="text-resume-additional">{renderRich(fitCopy(data.additional.join(' '), fit, 240))}</p></section>}
//                 </div>
//             </div>
//         </>
//     );
// }