'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { AlertCircle, FileUp, Sparkles, BookOpen, Building2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ResumeUploadModal from '@/components/profile/resume-upload-modal';

const INTERVIEW_TYPES = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Behavioral & HR questions'
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Coding & technical skills'
  },
  {
    id: 'system-design',
    label: 'System Design',
    description: 'Architecture & design problems'
  }
] as const;

const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: '0-2 years experience'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: '2-5 years experience'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: '5+ years experience'
  }
] as const;
 
const COMPANY_STYLES = [
  { id: 'standard', label: 'Standard Professional', description: 'Balanced and objective' },
  { id: 'google', label: 'Google-Style', description: 'First principles & problem solving' },
  { id: 'amazon', label: 'Amazon-Style', description: 'Leadership Principles & data' },
  { id: 'meta', label: 'Meta-Style', description: 'Fast execution & product sense' },
  { id: 'startup', label: 'High-Growth Startup', description: 'Ambiguity & high ownership' },
] as const;

interface InterviewSetupFormProps {
  onStartInterview: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  interviewType: 'behavioral' | 'technical' | 'system-design';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  numberOfQuestions: number;
  duration: number;
  jobTitle?: string;
  company?: string;
  customTopics?: string;
  jobDescription?: string;
  companyStyle?: string;
}

export default function InterviewSetupForm({ onStartInterview }: InterviewSetupFormProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const [formData, setFormData] = useState<InterviewConfig>({
    interviewType: 'behavioral',
    difficultyLevel: 'intermediate',
    numberOfQuestions: 5,
    duration: 30,
    jobTitle: '',
    company: '',
    customTopics: '',
    jobDescription: '',
    companyStyle: 'standard'
  });

  useEffect(() => {
    const type = searchParams.get('type') as any;
    const difficulty = searchParams.get('difficulty') as any;
    
    if (type || difficulty) {
      setFormData(prev => ({
        ...prev,
        interviewType: type && ['behavioral', 'technical', 'system-design'].includes(type) ? type : prev.interviewType,
        difficultyLevel: difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : prev.difficultyLevel,
      }));
    }
  }, [searchParams]);

  const showResumeWarning = !(user?.resume || user?.hasResume);

  const handleChange = (field: keyof InterviewConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartInterview = () => {
    if (showResumeWarning) {
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
      transition: { duration: 0.5 }
    }
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
            {showResumeWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-amber-900 mb-1">Resume Not Uploaded</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    Upload your resume to personalize your interview questions and get better feedback.
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

            {/* Interview Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Interview Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INTERVIEW_TYPES.map(type => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChange('interviewType', type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.interviewType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Difficulty Level</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DIFFICULTY_LEVELS.map(level => (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChange('difficultyLevel', level.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.difficultyLevel === level.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
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
                  onChange={(e) => handleChange('numberOfQuestions', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-primary min-w-12 text-center">
                  {formData.numberOfQuestions}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Choose between 3-10 questions</p>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Session Duration</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([15, 30, 60] as const).map(duration => (
                  <motion.button
                    key={duration}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChange('duration', duration)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${formData.duration === duration
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
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
                  <Label htmlFor="jobTitle" className="text-sm">Job Title</Label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle || ''}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm">Company</Label>
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g., Tech Company Inc"
                    value={formData.company || ''}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
 
            {/* Customization Details - Wrapped in Accordion */}
            <Accordion type="single" collapsible className="w-full border-t border-border/50 pt-4">
              <AccordionItem value="ai-scaling" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">AI Interview Scaling</h3>
                      <p className="text-xs text-muted-foreground">Deeply personalize your session (Optional)</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6 space-y-6">
                  {/* Company Style */}
                  <div className="space-y-3">
                    <Label htmlFor="companyStyle" className="text-base font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" /> Company-Specific Style
                    </Label>
                    <Select 
                      value={formData.companyStyle} 
                      onValueChange={(val) => handleChange('companyStyle', val)}
                    >
                      <SelectTrigger id="companyStyle" className="w-full h-12 bg-background border-2 hover:border-primary/50 transition-colors">
                        <SelectValue placeholder="Select an interview style" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_STYLES.map(style => (
                          <SelectItem key={style.id} value={style.id}>
                            <div className="flex flex-col text-left py-1">
                              <span className="font-medium text-sm">{style.label}</span>
                              <span className="text-[10px] text-muted-foreground leading-tight">{style.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Topics */}
                  <div className="space-y-3">
                    <Label htmlFor="customTopics" className="text-base font-semibold flex items-center gap-2">
                       <BookOpen className="w-4 h-4 text-primary" /> Custom Topics to Cover
                    </Label>
                    <input
                      id="customTopics"
                      type="text"
                      placeholder="e.g., React hooks, Redux, Next.js App Router"
                      value={formData.customTopics || ''}
                      onChange={(e) => handleChange('customTopics', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">The AI will prioritize these specific areas during the conversation.</p>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-3">
                    <Label htmlFor="jobDescription" className="text-base font-semibold flex items-center gap-2">
                      <FileUp className="w-4 h-4 text-primary" /> Paste Job Description (JD)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the target Job Description to align questions with requirements..."
                      className="min-h-[140px] bg-background border-2 resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={formData.jobDescription || ''}
                      onChange={(e) => handleChange('jobDescription', e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">Tailors questions to match specific job requirements and responsibilities.</p>
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
                <span className="font-semibold">Interview Summary:</span> You'll practice a{' '}
                <span className="text-primary font-semibold capitalize">
                  {formData.interviewType === 'system-design' ? 'System Design' : formData.interviewType}
                </span>{' '}
                interview at{' '}
                <span className="text-primary font-semibold capitalize">
                  {formData.difficultyLevel}
                </span>{' '}
                level with <span className="text-primary font-semibold">{formData.numberOfQuestions}</span> questions in{' '}
                <span className="text-primary font-semibold">{formData.duration} minutes</span>.
              </p>
            </motion.div>

            {/* Start Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleStartInterview}
                size="lg"
                className="w-full"
              >
                {showResumeWarning ? 'Upload Resume to Continue' : 'Start Interview'}
              </Button>
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
    </>
  );
}
