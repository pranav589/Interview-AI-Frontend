"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Plus, FileText, ArrowRight, Briefcase, Archive, Check } from "lucide-react";
import Link from "next/link";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { useAuth } from "@/lib/auth-context";
import {
  useRecruitmentJobs,
  useCreateJob,
  useArchiveJob,
  RecruitmentJob,
} from "@/hooks/use-recruitment";

export default function JobsManagement() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
  const [duration, setDuration] = useState("30");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [customTopics, setCustomTopics] = useState("");
  const [companyStyle, setCompanyStyle] = useState("");
  const [questionBankFile, setQuestionBankFile] = useState<File | null>(null);

  const { data: jobs = [], isLoading: loading } = useRecruitmentJobs();
  const createJobMutation = useCreateJob();
  const archiveJobMutation = useArchiveJob();

  useEffect(() => {
    if (user?.companyName) {
      setCompany(user.companyName);
    }
  }, [user]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) {
      toast.error("Title and Company are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("company", company);
      formData.append("description", description);
      formData.append("interviewType", interviewType);
      formData.append("difficultyLevel", difficultyLevel);
      formData.append("duration", duration);
      formData.append("numberOfQuestions", numberOfQuestions);
      formData.append("customTopics", customTopics);
      formData.append("companyStyle", companyStyle);
      if (questionBankFile) {
        formData.append("questionBankFile", questionBankFile);
      }

      const res = await createJobMutation.mutateAsync(formData);

      if (res.success) {
        toast.success("Job posting created successfully!");
        setIsDialogOpen(false);
        // Clear form
        setTitle("");
        setCompany(user?.companyName || "");
        setDescription("");
        setInterviewType("technical");
        setDifficultyLevel("intermediate");
        setDuration("30");
        setNumberOfQuestions("5");
        setCustomTopics("");
        setCompanyStyle("");
        setQuestionBankFile(null);
        const fileInput = document.getElementById("qBank") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(res.message || "Failed to create job.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const handleArchiveJob = async (id: string) => {
    if (!confirm("Are you sure you want to archive this job opening?")) return;

    try {
      const res = await archiveJobMutation.mutateAsync(id);
      if (res.success) {
        toast.success("Job opening archived.");
      } else {
        toast.error(res.message || "Failed to archive job.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen">
        <main id="main-content" className="max-w-[1024px] mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#7a7a7a] font-semibold">B2B Recruitment</span>
              <h1 className="text-[#1d1d1f] text-[40px] font-semibold tracking-[-0.01em] leading-none">
                Job Openings
              </h1>
              <p className="text-[#7a7a7a] text-[17px] tracking-tight">
                Manage your active job postings and pre-configured AI interview templates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard/recruitment">
                <Button variant="outline" className="rounded-full border-[#e0e0e0] px-6 h-11 transition-all active:scale-[0.95] text-[#1d1d1f] hover:bg-white bg-transparent">
                  Back to Candidates
                </Button>
              </Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-6 h-11 transition-all active:scale-[0.95] flex items-center gap-2">
                    <Plus size={16} /> Post New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[540px] p-8 rounded-[18px] bg-white border border-[#e0e0e0] shadow-apple-card overflow-y-auto max-h-[85vh]">
                  <DialogHeader className="border-b border-[#f0f0f0] pb-4 mb-6">
                    <DialogTitle className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight">
                      Create Job Posting & AI Rules
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateJob} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jTitle" className="text-[14px] font-semibold text-[#1d1d1f]">Job Title *</Label>
                        <Input
                          id="jTitle"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jCompany" className="text-[14px] font-semibold text-[#1d1d1f]">Company Name *</Label>
                        <Input
                          id="jCompany"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jDesc" className="text-[14px] font-semibold text-[#1d1d1f]">Job Description / Requirements</Label>
                      <Textarea
                        id="jDesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste details of the role..."
                        className="rounded-lg border-[#e0e0e0] min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1d1d1f]">Format</Label>
                        <Select value={interviewType} onValueChange={setInterviewType}>
                          <SelectTrigger className="rounded-lg border-[#e0e0e0]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1d1d1f]">Difficulty</Label>
                        <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                          <SelectTrigger className="rounded-lg border-[#e0e0e0]">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#1d1d1f]">Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="rounded-lg border-[#e0e0e0]">
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="15">15 mins</SelectItem>
                            <SelectItem value="20">20 mins</SelectItem>
                            <SelectItem value="25">25 mins</SelectItem>
                            <SelectItem value="30">30 mins</SelectItem>
                            <SelectItem value="45">45 mins</SelectItem>
                            <SelectItem value="60">60 mins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numQ" className="text-[14px] font-semibold text-[#1d1d1f]">Number of Questions</Label>
                        <Input
                          id="numQ"
                          type="number"
                          min="1"
                          max="50"
                          value={numberOfQuestions}
                          onChange={(e) => setNumberOfQuestions(e.target.value)}
                          className="rounded-lg border-[#e0e0e0]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topics" className="text-[14px] font-semibold text-[#1d1d1f]">Custom Topics</Label>
                        <Input
                          id="topics"
                          value={customTopics}
                          onChange={(e) => setCustomTopics(e.target.value)}
                          placeholder="React, Docker, System design"
                          className="rounded-lg border-[#e0e0e0]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-[14px] font-semibold text-[#1d1d1f]">Interviewer Style</Label>
                      <Input
                        id="style"
                        value={companyStyle}
                        onChange={(e) => setCompanyStyle(e.target.value)}
                        placeholder="Andrej Karpathy style..."
                        className="rounded-lg border-[#e0e0e0]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qBank" className="text-[14px] font-semibold text-[#1d1d1f]">Question Bank File (.pdf, .docx, .txt)</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="qBank"
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setQuestionBankFile(e.target.files[0]);
                            }
                          }}
                          className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc] cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0066cc]/10 file:text-[#0066cc] hover:file:bg-[#0066cc]/20 h-10 py-1"
                        />
                        {questionBankFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setQuestionBankFile(null);
                              const fileInput = document.getElementById("qBank") as HTMLInputElement;
                              if (fileInput) fileInput.value = "";
                            }}
                            className="text-[#d9383a] hover:bg-red-50 rounded-full h-8 px-3 text-xs font-semibold shrink-0"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={createJobMutation.isPending}
                      className="w-full rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] py-6 h-12 text-[17px] font-medium transition-all active:scale-[0.95] disabled:opacity-50"
                    >
                      {createJobMutation.isPending ? "Creating job posting..." : "Create Job Posting"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* List of Jobs */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <Card key={n} className="bg-white border border-[#e0e0e0] rounded-[18px] h-48 animate-pulse shadow-none" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-12 text-center shadow-none">
              <div className="w-16 h-16 bg-[#0066cc]/10 text-[#0066cc] rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} />
              </div>
              <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mb-2">
                No Job Openings Yet
              </h2>
              <p className="text-[#7a7a7a] text-[17px] max-w-md mx-auto mb-6 leading-[1.47]">
                Create a job opening to group scheduled AI interviews and apply pre-configured parameters.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-6 h-11"
              >
                Create First Job
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Card key={job._id} className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none flex flex-col justify-between hover:border-[#b0b0b0] transition-colors">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[#1d1d1f] text-[18px] font-semibold tracking-tight">
                          {job.title}
                        </h3>
                        <span className="text-[#7a7a7a] text-[13px]">{job.company}</span>
                      </div>
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        <Check size={12} /> Active
                      </span>
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-3 space-y-1.5 text-[14px]">
                      <div className="flex justify-between">
                        <span className="text-[#7a7a7a]">AI Interviewer:</span>
                        <span className="text-[#1d1d1f] font-medium">{user?.aiInterviewerName || "AI Assistant"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7a7a7a]">Interview Type:</span>
                        <span className="text-[#1d1d1f] font-medium capitalize">{job.interviewType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7a7a7a]">Difficulty Level:</span>
                        <span className="text-[#1d1d1f] font-medium capitalize">{job.difficultyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7a7a7a]">Duration:</span>
                        <span className="text-[#1d1d1f] font-medium">{job.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7a7a7a]">Questions:</span>
                        <span className="text-[#1d1d1f] font-medium">{job.numberOfQuestions} questions</span>
                      </div>
                      {job.customTopics && (
                        <div className="flex justify-between">
                          <span className="text-[#7a7a7a]">Topics:</span>
                          <span className="text-[#1d1d1f] font-medium truncate max-w-[200px]">{job.customTopics}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f0] pt-4 mt-4 flex items-center justify-between gap-3">
                    <Button
                      onClick={() => handleArchiveJob(job._id)}
                      className="w-full rounded-full bg-[#fafafc] text-[#d9383a] border border-[#e0e0e0] hover:bg-[#fff0f0] h-10 text-xs font-semibold active:scale-[0.95] flex items-center justify-center gap-1.5"
                    >
                      <Archive size={12} /> Archive Job
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
