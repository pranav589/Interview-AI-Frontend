"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle, FileUp, Sparkles, BookOpen, Building2 } from "lucide-react";
import { FeatureFlag } from "@/components/common/feature-flag";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ResumeUploadModal from "@/components/profile/resume-upload-modal";
import { Lock, Zap } from "lucide-react";
import {
  SUBSCRIPTION_TIERS,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  COMPANY_STYLES,
} from "@/lib/constants";
import { CreditLimitModal } from "./credit-limit-modal";

import { LoadingButton } from "../common/loading-button";

interface InterviewSetupFormProps {
  onStartInterview: (config: InterviewConfig) => void;
  isLoading?: boolean;
}

export interface InterviewConfig {
  interviewType: "behavioral" | "technical" | "system-design";
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  numberOfQuestions: number;
  duration: number;
  jobTitle?: string;
  company?: string;
  customTopics?: string;
  jobDescription?: string;
  companyStyle?: string;
}

export default function InterviewSetupForm({
  onStartInterview,
  isLoading = false,
}: InterviewSetupFormProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const { isFeatureEnabled } = useFeatureFlags();

  const [formData, setFormData] = useState<InterviewConfig>({
    interviewType: "behavioral",
    difficultyLevel: "intermediate",
    numberOfQuestions: 5,
    duration: 30,
    jobTitle: "",
    company: "",
    customTopics: "",
    jobDescription: "",
    companyStyle: "standard",
  });

  useEffect(() => {
    const type = searchParams.get("type") as any;
    const difficulty = searchParams.get("difficulty") as any;

    if (type || difficulty) {
      setFormData((prev) => ({
        ...prev,
        interviewType:
          type && INTERVIEW_TYPES.includes(type) ? type : prev.interviewType,
        difficultyLevel:
          difficulty && DIFFICULTY_LEVELS.includes(difficulty)
            ? difficulty
            : prev.difficultyLevel,
      }));
    }
  }, [searchParams]);

  const showResumeWarning = !(user?.resume || user?.hasResume);

  const handleChange = (field: keyof InterviewConfig, value: any) => {
    // Prevent selecting locked types if free user (Don't remove this, it's for future use)
    /*
    if (field === 'interviewType' && user?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && value !== 'behavioral') {
      return;
    }
    */

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartInterview = () => {
    if (isFeatureEnabled('credits_system_enabled')) {
       if (user?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && (user?.credits || 0) <= 0) {
         setShowCreditModal(true);
         return;
       }
    }

    if (isFeatureEnabled('resume_upload_enabled') && showResumeWarning) {
      setShowResumeModal(true);
      return;
    }
    onStartInterview(formData);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Start a New Interview</CardTitle>
            <CardDescription>Configure your interview session</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Resume Warning */}
            <FeatureFlag name="resume_upload_enabled">
              {showResumeWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-amber-900 mb-1">
                      Resume Not Uploaded
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Upload your resume to personalize your interview questions
                      and get better feedback.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowResumeModal(true)}
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <FileUp className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                </motion.div>
              )}
            </FeatureFlag>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Interview Type
                </Label>
                {/* Don't remove this, it's for future use */}
                {/* {user?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/5 text-amber-600 border-amber-200"
                  >
                    Pro Unlocks Technical & System Design
                  </Badge>
                )} */}
              </div>
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map((type) => {
                    const isLocked =
                      user?.subscriptionTier === SUBSCRIPTION_TIERS.FREE &&
                      type.id !== "behavioral"
                    const isComingSoon = type?.isComingSoon;
                    const flagKey = type.id === 'technical' ? 'interview_technical_enabled' : 
                                    type.id === 'system-design' ? 'interview_system_design_enabled' : null;

                    const content = (
                      <Tooltip key={type.id}>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={isLocked || isComingSoon ? {} : { scale: 1.02 }}
                            whileTap={isLocked || isComingSoon ? {} : { scale: 0.98 }}
                            onClick={() => handleChange("interviewType", type.id)}
                            className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                              formData.interviewType === type.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            } 
                            ${isComingSoon ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            disabled={isComingSoon}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold">{type.label}</p>
                              {isComingSoon && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </motion.button>
                        </TooltipTrigger>
                        {isComingSoon && (
                          <TooltipContent>
                            <p>Coming Soon</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );

                    if (flagKey) {
                      return (
                        <FeatureFlag key={type.id} name={flagKey}>
                          {content}
                        </FeatureFlag>
                      );
                    }

                    return content;
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Difficulty Level
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DIFFICULTY_LEVELS.map((level) => (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChange("difficultyLevel", level.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.difficultyLevel === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold">{level.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {level.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-3">
              <Label htmlFor="questions" className="text-base font-semibold">
                Number of Questions
              </Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="questions"
                  min="3"
                  max="10"
                  step="1"
                  value={formData.numberOfQuestions}
                  onChange={(e) =>
                    handleChange("numberOfQuestions", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-primary min-w-12 text-center">
                  {formData.numberOfQuestions}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose between 3-10 questions
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Session Duration
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([15, 30, 60] as const).map((duration) => (
                  <motion.button
                    key={duration}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChange("duration", duration)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      formData.duration === duration
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold">{duration} min</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Job Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm">
                    Job Title
                  </Label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle || ""}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm">
                    Company
                  </Label>
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g., Tech Company Inc"
                    value={formData.company || ""}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Customization Details - Wrapped in Accordion */}
            <Accordion
              type="single"
              collapsible
              className="w-full border-t border-border/50 pt-4"
            >
              <AccordionItem value="ai-scaling" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        AI Interview Scaling
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Deeply personalize your session (Optional)
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6 space-y-6">
                  {/* Company Style */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="companyStyle"
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-primary" />{" "}
                      Company-Specific Style
                    </Label>
                    <Select
                      value={formData.companyStyle}
                      onValueChange={(val) => handleChange("companyStyle", val)}
                    >
                      <SelectTrigger
                        id="companyStyle"
                        className="w-full h-12 bg-background border-2 hover:border-primary/50 transition-colors"
                      >
                        <SelectValue placeholder="Select an interview style" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_STYLES.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            <div className="flex flex-col text-left py-1">
                              <span className="font-medium text-sm">
                                {style.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight">
                                {style.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Topics */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="customTopics"
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-primary" /> Custom
                      Topics to Cover
                    </Label>
                    <input
                      id="customTopics"
                      type="text"
                      placeholder="e.g., React hooks, Redux, Next.js App Router"
                      value={formData.customTopics || ""}
                      onChange={(e) =>
                        handleChange("customTopics", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      The AI will prioritize these specific areas during the
                      conversation.
                    </p>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="jobDescription"
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <FileUp className="w-4 h-4 text-primary" /> Paste Job
                      Description (JD)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the target Job Description to align questions with requirements..."
                      className="min-h-[140px] bg-background border-2 resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={formData.jobDescription || ""}
                      onChange={(e) =>
                        handleChange("jobDescription", e.target.value)
                      }
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      Tailors questions to match specific job requirements and
                      responsibilities.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <p className="text-sm">
                <span className="font-semibold">Interview Summary:</span> You'll
                practice a{" "}
                <span className="text-primary font-semibold capitalize">
                  {formData.interviewType === "system-design"
                    ? "System Design"
                    : formData.interviewType}
                </span>{" "}
                interview at{" "}
                <span className="text-primary font-semibold capitalize">
                  {formData.difficultyLevel}
                </span>{" "}
                level with{" "}
                <span className="text-primary font-semibold">
                  {formData.numberOfQuestions}
                </span>{" "}
                questions in{" "}
                <span className="text-primary font-semibold">
                  {formData.duration} minutes
                </span>
                .
              </p>
            </motion.div>

            {/* Start Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <LoadingButton
                onClick={handleStartInterview}
                size="lg"
                className="w-full h-12 text-lg text-white  shadow-xl shadow-primary/20"
                isLoading={isLoading}
                loadingText="Setting up interview..."
              >
                {isFeatureEnabled('resume_upload_enabled') && showResumeWarning
                  ? "Upload Resume to Continue"
                  : "Start Interview"}
              </LoadingButton>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <ResumeUploadModal
          onClose={() => setShowResumeModal(false)}
          onUpload={() => {
            setShowResumeModal(false);
          }}
        />
      )}

      {/* Credit Limit Modal */}
      <CreditLimitModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
      />
    </>
  );
}
