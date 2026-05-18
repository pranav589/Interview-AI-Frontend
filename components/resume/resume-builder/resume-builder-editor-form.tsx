import React from "react";
import { ResumeData, CommandPayload } from "./resume-builder-types";
import { GhostTextarea } from "./resume-builder-ghost-textarea";
import { EditorSection, Field, StringListEditor } from "./resume-builder-editor-components";
import { ArrayEditor } from "./resume-builder-editor-array";

export function ResumeForm({
  draft,
  activeGhostField,
  isRunningCommand,
  onDraftChange,
  onGhostFocus,
  onRunCommand,
}: {
  draft: ResumeData;
  activeGhostField: string | null;
  isRunningCommand: boolean;
  onDraftChange: (updater: (current: ResumeData) => ResumeData) => void;
  onGhostFocus: (field: string | null) => void;
  onRunCommand: (payload: CommandPayload) => Promise<{ replacementText: string; explanation?: string }>;
}) {
  const updatePersonal = (key: keyof ResumeData["personalInfo"], value: string) => {
    onDraftChange((current) => ({ ...current, personalInfo: { ...current.personalInfo, [key]: value } }));
  };

  const sectionOrder = draft.sectionOrder || ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"];

  const moveSection = (index: number, direction: -1 | 1) => {
    onDraftChange((current) => {
      const order = [...(current.sectionOrder || ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"])];
      const target = index + direction;
      if (target < 0 || target >= order.length) return current;
      [order[index], order[target]] = [order[target], order[index]];
      return { ...current, sectionOrder: order };
    });
  };

  const renderSection = (sectionId: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;
    const onMoveUp = () => moveSection(index, -1);
    const onMoveDown = () => moveSection(index, 1);

    switch (sectionId) {
      case "summary":
        return (
          <EditorSection
            key="summary"
            title="Summary"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <GhostTextarea
              id="summary"
              kind="summary"
              value={draft.summary || ""}
              fieldPath="summary"
              activeGhostField={activeGhostField}
              isRunningCommand={isRunningCommand}
              onFocus={onGhostFocus}
              onChange={(value) => onDraftChange((current) => ({ ...current, summary: value }))}
              onRunCommand={onRunCommand}
            />
          </EditorSection>
        );
      case "experience":
        return (
          <ArrayEditor
            key="experience"
            title="Experience"
            items={draft.experience}
            emptyItem={() => ({ role: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] })}
            onChange={(experience) => onDraftChange((current) => ({ ...current, experience }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, idx, update) => (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Role" value={item.role || ""} placeholder="Software Engineer" onChange={(value) => update({ ...item, role: value })} />
                  <Field label="Company" value={item.company || ""} placeholder="Google" onChange={(value) => update({ ...item, company: value })} />
                  <Field label="Location" value={item.location || ""} placeholder="Mountain View, CA" onChange={(value) => update({ ...item, location: value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start" value={item.startDate || ""} placeholder="Jan 2022" onChange={(value) => update({ ...item, startDate: value })} />
                    <Field label="End" value={item.endDate || ""} placeholder="Present" onChange={(value) => update({ ...item, endDate: value })} />
                  </div>
                </div>
                <StringListEditor
                  title="Bullets"
                  items={item.bullets || []}
                  placeholder="Improved page speed from 60 to 90+..."
                  multiline
                  ghostKind="bullet"
                  activeGhostField={activeGhostField}
                  ghostPrefix={`experience-${idx}-bullet`}
                  fieldPathPrefix={`experience.${idx}.bullets`}
                  isRunningCommand={isRunningCommand}
                  onGhostFocus={onGhostFocus}
                  onRunCommand={onRunCommand}
                  onChange={(bullets) => update({ ...item, bullets })}
                />
              </div>
            )}
          />
        );
      case "education":
        return (
          <ArrayEditor
            key="education"
            title="Education"
            items={draft.education}
            emptyItem={() => ({ degree: "", school: "", location: "", gradDate: "", details: [] })}
            onChange={(education) => onDraftChange((current) => ({ ...current, education }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, _idx, update) => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Degree" value={item.degree || ""} placeholder="B.S. Computer Science" onChange={(value) => update({ ...item, degree: value })} />
                <Field label="School" value={item.school || ""} placeholder="MIT" onChange={(value) => update({ ...item, school: value })} />
                <Field label="Location" value={item.location || ""} placeholder="Cambridge, MA" onChange={(value) => update({ ...item, location: value })} />
                <Field label="Graduation" value={item.gradDate || ""} placeholder="May 2020" onChange={(value) => update({ ...item, gradDate: value })} />
              </div>
            )}
          />
        );
      case "skills":
        return (
          <EditorSection
            key="skills"
            title="Skills"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.skills}
              placeholder="React"
              onChange={(skills) => onDraftChange((current) => ({ ...current, skills }))}
              wrapped
            />
          </EditorSection>
        );
      case "projects":
        return (
          <ArrayEditor
            key="projects"
            title="Projects"
            items={draft.projects}
            emptyItem={() => ({ name: "", description: "", bullets: [""] })}
            onChange={(projects) => onDraftChange((current) => ({ ...current, projects }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, idx, update) => (
              <div className="space-y-4">
                <Field label="Project Name" value={item.name || ""} onChange={(value) => update({ ...item, name: value })} />
                <GhostTextarea
                  id={`project-${idx}-description`}
                  kind="project"
                  value={item.description || ""}
                  fieldPath={`projects.${idx}.description`}
                  activeGhostField={activeGhostField}
                  isRunningCommand={isRunningCommand}
                  onFocus={onGhostFocus}
                  onChange={(value) => update({ ...item, description: value })}
                  onRunCommand={onRunCommand}
                />
                <StringListEditor
                  title="Project Bullets"
                  items={item.bullets || []}
                  placeholder="Built a low-latency voice interviewer..."
                  multiline
                  ghostKind="bullet"
                  activeGhostField={activeGhostField}
                  ghostPrefix={`project-${idx}-bullet`}
                  fieldPathPrefix={`projects.${idx}.bullets`}
                  isRunningCommand={isRunningCommand}
                  onGhostFocus={onGhostFocus}
                  onRunCommand={onRunCommand}
                  onChange={(bullets) => update({ ...item, bullets })}
                />
              </div>
            )}
          />
        );
      case "certifications":
        return (
          <ArrayEditor
            key="certifications"
            title="Certifications"
            items={draft.certifications}
            emptyItem={() => ({ name: "", issuer: "", date: "" })}
            onChange={(certifications) => onDraftChange((current) => ({ ...current, certifications }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, _idx, update) => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Name" value={item.name || ""} placeholder="AWS Solutions Architect" onChange={(value) => update({ ...item, name: value })} />
                <Field label="Issuer" value={item.issuer || ""} placeholder="Amazon" onChange={(value) => update({ ...item, issuer: value })} />
                <Field label="Date" value={item.date || ""} placeholder="Mar 2023" onChange={(value) => update({ ...item, date: value })} />
              </div>
            )}
          />
        );
      case "languages":
        return (
          <EditorSection
            key="languages"
            title="Languages"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.languages}
              placeholder="English"
              onChange={(languages) => onDraftChange((current) => ({ ...current, languages }))}
              wrapped
            />
          </EditorSection>
        );
      case "awards":
        return (
          <EditorSection
            key="awards"
            title="Awards"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.awards}
              placeholder="Hackathon Winner"
              onChange={(awards) => onDraftChange((current) => ({ ...current, awards }))}
            />
          </EditorSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <EditorSection title="Personal Info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" value={draft.personalInfo.name || ""} placeholder="Jane Smith" onChange={(value) => updatePersonal("name", value)} />
          <Field label="Email" value={draft.personalInfo.email || ""} placeholder="jane@example.com" onChange={(value) => updatePersonal("email", value)} />
          <Field label="Phone" value={draft.personalInfo.phone || ""} placeholder="+1 (555) 000-0000" onChange={(value) => updatePersonal("phone", value)} />
          <Field label="Location" value={draft.personalInfo.location || ""} placeholder="San Francisco, CA" onChange={(value) => updatePersonal("location", value)} />
        </div>
        <StringListEditor
          title="Links"
          items={draft.personalInfo.links || []}
          placeholder="https://github.com/username"
          onChange={(links) => onDraftChange((current) => ({ ...current, personalInfo: { ...current.personalInfo, links } }))}
        />
      </EditorSection>

      {sectionOrder.map((sectionId, idx) => renderSection(sectionId, idx))}
    </div>
  );
}
