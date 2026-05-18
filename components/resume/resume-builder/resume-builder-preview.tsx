import React from "react";
import { ResumeData } from "./resume-builder-types";

export function AtsPreview({ resume }: { resume: ResumeData }) {
  const contact = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    ...(resume.personalInfo.links || []),
  ].filter(Boolean);

  const order = resume.sectionOrder || [
    "summary",
    "experience",
    "projects",
    "education",
    "skills",
    "certifications",
    "languages",
    "awards",
  ];

  const sections: Record<string, React.ReactNode> = {
    summary: (
      <PreviewSection
        key="summary"
        title="Professional Summary"
        show={Boolean(resume.summary)}
      >
        <p className="text-sm leading-relaxed">{resume.summary}</p>
      </PreviewSection>
    ),
    experience: (
      <PreviewSection
        key="experience"
        title="Experience"
        show={resume.experience.length > 0}
      >
        {resume.experience.map((item, index) => (
          <PreviewEntry
            key={index}
            title={item.role}
            meta={[item.startDate, item.endDate || "Present"]
              .filter(Boolean)
              .join(" - ")}
            subtitle={item.company}
          >
            {item.bullets?.map(
              (bullet, bulletIndex) =>
                bullet && <li key={bulletIndex}>{bullet}</li>,
            )}
          </PreviewEntry>
        ))}
      </PreviewSection>
    ),
    projects: (
      <PreviewSection
        key="projects"
        title="Projects"
        show={resume.projects.length > 0}
      >
        {resume.projects.map((item, index) => (
          <PreviewEntry
            key={index}
            title={item.name}
            subtitle={item.description}
          >
            {item.bullets?.map(
              (bullet, bulletIndex) =>
                bullet && <li key={bulletIndex}>{bullet}</li>,
            )}
          </PreviewEntry>
        ))}
      </PreviewSection>
    ),
    education: (
      <PreviewSection
        key="education"
        title="Education"
        show={resume.education.length > 0}
      >
        {resume.education.map((item, index) => (
          <PreviewEntry
            key={index}
            title={item.degree}
            meta={item.gradDate}
            subtitle={[item.school, item.location].filter(Boolean).join(", ")}
          />
        ))}
      </PreviewSection>
    ),
    skills: (
      <PreviewSection
        key="skills"
        title="Skills"
        show={resume.skills.length > 0}
      >
        <p className="text-sm leading-relaxed">
          {resume.skills.filter(Boolean).join(", ")}
        </p>
      </PreviewSection>
    ),
    certifications: (
      <PreviewSection
        key="certifications"
        title="Certifications"
        show={resume.certifications.length > 0}
      >
        {resume.certifications.map((item, index) => (
          <p key={index} className="mb-1 text-sm">
            <strong>{item.name}</strong>
            {item.issuer ? ` - ${item.issuer}` : ""}
            {item.date ? ` (${item.date})` : ""}
          </p>
        ))}
      </PreviewSection>
    ),
    languages: (
      <PreviewSection
        key="languages"
        title="Languages"
        show={resume.languages.length > 0}
      >
        <p className="text-sm leading-relaxed">
          {resume.languages.filter(Boolean).join(", ")}
        </p>
      </PreviewSection>
    ),
    awards: (
      <PreviewSection
        key="awards"
        title="Awards"
        show={resume.awards.length > 0}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {resume.awards.filter(Boolean).map((award, index) => (
            <li key={index}>{award}</li>
          ))}
        </ul>
      </PreviewSection>
    ),
  };

  return (
    <div className="mx-auto max-w-[820px] px-2 md:py-6 py-8 ">
      <div className="min-h-[1050px] bg-white px-12 py-12 text-[#111827] shadow-sm">
        <header className="border-b border-[#d1d5db] pb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {resume.personalInfo.name || "Your Name"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
            {contact.join(" | ")}
          </p>
        </header>
        {order.map((sectionId) => sections[sectionId])}
      </div>
    </div>
  );
}

function PreviewSection({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-[#e5e7eb] pb-1 text-xs font-bold uppercase tracking-widest text-[#111827]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PreviewEntry({
  title,
  meta,
  subtitle,
  children,
}: {
  title?: string;
  meta?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {meta && (
          <span className="shrink-0 text-xs text-[#6b7280]">{meta}</span>
        )}
      </div>
      {subtitle && (
        <p className="mb-1 text-xs italic text-[#4b5563]">{subtitle}</p>
      )}
      {children && (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          {children}
        </ul>
      )}
    </div>
  );
}
