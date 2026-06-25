"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, UserPlus, Copy, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import AuthWrapper from "@/components/auth/auth-wrapper";
import {
  useRecruitmentJobs,
  useRecruitmentInvites,
  useScheduleInvite,
  ScheduledInvite,
  InterviewRecord,
} from "@/hooks/use-recruitment";

export default function RecruitmentDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState("");

  const { data: jobs = [] } = useRecruitmentJobs();
  const { data: invites = [], isLoading: loading } = useRecruitmentInvites();
  const scheduleInviteMutation = useScheduleInvite();

  // Default to first job when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Helper to format Date to YYYY-MM-DDTHH:mm
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    
    // Auto-update end time based on job duration
    const job = jobs.find((j) => j._id === jobId);
    console.log("[JobSelect] jobId:", jobId, "job found:", job, "scheduledStart:", scheduledStart);
    if (job && scheduledStart) {
      try {
        const startDate = new Date(scheduledStart);
        if (!isNaN(startDate.getTime())) {
          const duration = job.duration || 30;
          const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
          const localString = formatLocalDate(endDate);
          console.log("[JobSelect] setting scheduledEnd:", localString);
          setScheduledEnd(localString);
        }
      } catch (err) {
        console.error("Failed to auto-update end time:", err);
      }
    }
  };

  const handleStartChange = (val: string) => {
    setScheduledStart(val);
    
    const job = jobs.find((j) => j._id === selectedJobId);
    console.log("[StartChange] val:", val, "selectedJobId:", selectedJobId, "job found:", job);
    if (val) {
      try {
        const startDate = new Date(val);
        if (!isNaN(startDate.getTime())) {
          const duration = job ? (job.duration || 30) : 30;
          const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
          const localString = formatLocalDate(endDate);
          console.log("[StartChange] setting scheduledEnd:", localString);
          setScheduledEnd(localString);
        }
      } catch (err) {
        console.error("Failed to auto-update end time:", err);
      }
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !candidateEmail || !scheduledStart || !scheduledEnd || !selectedJobId || !resumeFile) {
      toast.error("Please fill in all required fields and upload candidate's resume.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("candidateName", candidateName);
      formData.append("candidateEmail", candidateEmail);
      formData.append("scheduledStart", new Date(scheduledStart).toISOString());
      formData.append("scheduledEnd", new Date(scheduledEnd).toISOString());
      formData.append("jobId", selectedJobId);
      formData.append("resumeFile", resumeFile);

      const res = await scheduleInviteMutation.mutateAsync(formData);

      if (res.success) {
        toast.success("AI interview round scheduled successfully!");
        setIsDialogOpen(false);
        // Clear form
        setCandidateName("");
        setCandidateEmail("");
        setScheduledStart("");
        setScheduledEnd("");
        setSelectedJobId("");
        setResumeFile(null);
        const fileInput = document.getElementById("candidateResume") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(res.message || "Failed to schedule interview.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case "activated":
        return (
          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock size={12} /> Active / In Progress
          </span>
        );
      case "expired":
        return (
          <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">
            <AlertCircle size={12} /> Expired
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock size={12} /> Pending Start
          </span>
        );
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
                AI Recruitment
              </h1>
              <p className="text-[#7a7a7a] text-[17px] tracking-tight">
                Schedule and monitor automated interview rounds for your hiring pipeline.
              </p>
            </div>

            {/* Schedule Modal Trigger */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-6 h-11 transition-all active:scale-[0.95] flex items-center gap-2">
                  <UserPlus size={16} /> Schedule AI Round
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[540px] p-8 rounded-[18px] bg-white border border-[#e0e0e0] shadow-apple-card overflow-y-auto max-h-[85vh]">
                <DialogHeader className="border-b border-[#f0f0f0] pb-4 mb-6">
                  <DialogTitle className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight">
                    Schedule New Interview
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSchedule} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cName" className="text-[14px] font-semibold text-[#1d1d1f]">Candidate Name *</Label>
                      <Input
                        id="cName"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="John Doe"
                        className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cEmail" className="text-[14px] font-semibold text-[#1d1d1f]">Candidate Email *</Label>
                      <Input
                        id="cEmail"
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-[14px] font-semibold text-[#1d1d1f]">Scheduled Start *</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={scheduledStart}
                        onChange={(e) => handleStartChange(e.target.value)}
                        className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-[14px] font-semibold text-[#1d1d1f]">Scheduled End *</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={scheduledEnd}
                        onChange={(e) => setScheduledEnd(e.target.value)}
                        className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[14px] font-semibold text-[#1d1d1f]">Link to Job Opening *</Label>
                    <Select value={selectedJobId} onValueChange={handleJobSelect}>
                      <SelectTrigger className="rounded-lg border-[#e0e0e0]">
                        <SelectValue placeholder="Select a job opening..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {jobs.map((job) => (
                          <SelectItem key={job._id} value={job._id}>
                            {job.title} ({job.company})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidateResume" className="text-[14px] font-semibold text-[#1d1d1f]">Candidate Resume * (.pdf, .docx, .txt)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="candidateResume"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                        className="rounded-lg border-[#e0e0e0] focus:ring-[#0066cc] cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0066cc]/10 file:text-[#0066cc] hover:file:bg-[#0066cc]/20 h-10 py-1"
                        required
                      />
                      {resumeFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setResumeFile(null);
                            const fileInput = document.getElementById("candidateResume") as HTMLInputElement;
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
                    disabled={scheduleInviteMutation.isPending}
                    className="w-full rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] py-6 h-12 text-[17px] font-medium transition-all active:scale-[0.95] disabled:opacity-50"
                  >
                    {scheduleInviteMutation.isPending ? "Creating scheduled round..." : "Schedule & Generate Link"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* List of Invites */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="bg-white border border-[#e0e0e0] rounded-[18px] h-48 animate-pulse shadow-none" />
              ))}
            </div>
          ) : invites.length === 0 ? (
            <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-12 text-center shadow-none">
              <div className="w-16 h-16 bg-[#0066cc]/10 text-[#0066cc] rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} />
              </div>
              <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mb-2">
                No Scheduled Rounds Yet
              </h2>
              <p className="text-[#7a7a7a] text-[17px] max-w-md mx-auto mb-6 leading-[1.47]">
                You haven&apos;t scheduled any automated candidate rounds yet. Create a slot to get a secure invitation link.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-6 h-11"
              >
                Schedule First Candidate
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invites.map((invite) => {
                const start = new Date(invite.scheduledStart);
                const end = new Date(invite.scheduledEnd);
                const formattedDate = start.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
                const formattedTime = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                const interview = (invite.interviewId || {}) as any;
                const currentStatus = (invite.status === "completed" ? "completed" : (interview.status || invite.status)) as string;

                return (
                  <Card key={invite._id} className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none flex flex-col justify-between hover:border-[#b0b0b0] transition-colors">
                    <div className="space-y-4">
                      {/* Top Row: Candidate details & Status */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[#1d1d1f] text-[18px] font-semibold tracking-tight">
                            {invite.candidateName}
                          </h3>
                          <span className="text-[#7a7a7a] text-[12px]">{invite.candidateEmail}</span>
                        </div>
                        {getStatusBadge(currentStatus)}
                      </div>

                      {/* Middle Row: Job details */}
                      <div className="border-t border-[#f0f0f0] pt-3 space-y-1.5 text-[14px]">
                        <div className="flex justify-between">
                          <span className="text-[#7a7a7a]">Role:</span>
                          <span className="text-[#1d1d1f] font-medium">{interview.jobTitle || "AI Interview"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7a7a7a]">Date:</span>
                          <span className="text-[#1d1d1f] font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7a7a7a]">Time Slot:</span>
                          <span className="text-[#1d1d1f] font-medium">{formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="border-t border-[#f0f0f0] pt-4 mt-4 flex items-center justify-between gap-3">
                      {currentStatus === "completed" ? (
                        <Link href={`/dashboard/recruitment/${invite.interviewId?._id}`} className="w-full">
                          <Button className="w-full rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] h-10 text-xs font-semibold active:scale-[0.95] flex items-center justify-center gap-1.5">
                            View Report <ArrowRight size={14} />
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button
                            onClick={() => copyInviteLink(invite.token)}
                            className="w-full rounded-full bg-[#fafafc] text-[#1d1d1f] border border-[#e0e0e0] hover:bg-[#f0f0f0] h-10 text-xs font-semibold active:scale-[0.95] flex items-center justify-center gap-1.5"
                          >
                            <Copy size={12} /> Invite Link
                          </Button>
                          {currentStatus === "activated" && (
                            <span className="text-[12px] text-blue-600 font-semibold animate-pulse shrink-0">Live Now</span>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
