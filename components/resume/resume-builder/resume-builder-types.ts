export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
export type PendingQuestion = { id: string; category: string; question: string; resolved?: boolean };
export type SaveStatus = "saved" | "unsaved" | "saving" | "error";
export type BuilderCommand = "bullet" | "shorten" | "expand" | "quantify" | "tone" | "keywords";

export type CommandPayload = {
  command: BuilderCommand;
  fieldPath: string;
  selectedText?: string;
  fieldText: string;
  targetContext?: string;
};

export type BuilderSession = {
  _id: string;
  name: string;
  templateId?: string;
  status?: "in-progress" | "completed";
  resumeData: ResumeData;
  chatHistory: ChatMessage[];
  completionMap?: Record<string, boolean>;
  currentStep: string;
  intakeMetadata?: {
    detectedExperienceYears?: number;
    timelineGaps?: string[];
    missingFields?: string[];
    weakBullets?: string[];
    pendingQuestions?: PendingQuestion[];
  };
};

export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

export type EducationItem = {
  degree: string;
  school: string;
  location?: string;
  gradDate?: string;
  details?: string[];
};

export type ProjectItem = {
  name: string;
  description?: string;
  bullets?: string[];
};

export type CertificationItem = {
  name: string;
  issuer?: string;
  date?: string;
};

export type ResumeData = {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: string[];
  awards: string[];
  sectionOrder?: string[];
};

export const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const emptyResumeData = (): ResumeData => ({
  personalInfo: { links: [] },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  sectionOrder: ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"],
});

export const normalizeDraft = (raw?: Partial<ResumeData> | null): ResumeData => ({
  ...emptyResumeData(),
  ...raw,
  personalInfo: { links: [], ...(raw?.personalInfo || {}) },
  experience: Array.isArray(raw?.experience) ? raw.experience : [],
  education: Array.isArray(raw?.education) ? raw.education : [],
  skills: Array.isArray(raw?.skills) ? raw.skills : [],
  projects: Array.isArray(raw?.projects) ? raw.projects : [],
  certifications: Array.isArray(raw?.certifications) ? raw.certifications : [],
  languages: Array.isArray(raw?.languages) ? raw.languages : [],
  awards: Array.isArray(raw?.awards) ? raw.awards : [],
  sectionOrder: Array.isArray(raw?.sectionOrder) 
    ? raw.sectionOrder 
    : ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"],
});

export const formatValue = (value: any): string[] => {
  if (!value) return [];
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.role || item?.company) {
          return `${item.role || "Role"}${item.company ? ` at ${item.company}` : ""}${item.startDate || item.endDate ? ` (${[item.startDate, item.endDate].filter(Boolean).join(" - ")})` : ""}`;
        }
        if (item?.degree || item?.school) return `${item.degree || "Degree"}${item.school ? `, ${item.school}` : ""}`;
        if (item?.name) return item.name;
        return JSON.stringify(item);
      })
      .filter(Boolean);
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, entry]) => Boolean(entry))
      .map(([key, entry]) => `${key}: ${Array.isArray(entry) ? entry.join(", ") : String(entry)}`);
  }
  return [String(value)];
};

export const ghostSuggestion = (text: string, kind: "summary" | "bullet" | "project") => {
  const value = text.trim();
  if (!value) return null;
  if (kind !== "summary" && value.split(/\s+/).length < 8) {
    return { label: "Clarify impact", insert: " - clarify the outcome and business impact." };
  }
  if (!/\d/.test(value)) {
    return { label: "Add metric", insert: " [add metric: increased/decreased X by Y%]" };
  }
  if (/^(worked|helped|made|did|responsible)/i.test(value)) {
    return { label: "Start with action verb", insert: " Rephrase with: Built, Improved, Led, Optimized, Delivered." };
  }
  if (kind === "summary" && value.length < 120) {
    return { label: "Add positioning", insert: " Add target role, core stack, and strongest outcome." };
  }
  return null;
};
