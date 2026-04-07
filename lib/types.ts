export interface ResumeData {
  filename: string;
  uploadedAt: string;
  extractedData?: {
    skills: string[];
    experience: string[];
    education: string[];
  };
}

export interface User {
  id: string; // The UI usage of id instead of _id for local consistency?
  name: string;
  email: string;
  avatar?: string;
  resume?: ResumeData;
  hasResume?: boolean;
  role?: "user" | "admin";
  twoFactorEnabled?: boolean;
}

export interface QuestionFeedback {
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
  modelAnswer: string;
}

export interface Feedback {
  _id?: string;
  interviewId?: string;
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  feedbackSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  questions?: QuestionFeedback[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Interview {
  _id: string;
  userId: string;
  interviewType: "behavioral" | "technical" | "system-design";
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  numberOfQuestions: number;
  duration: number;
  actualDuration: number;
  jobTitle?: string;
  company?: string;
  score: number;
  status: "not-started" | "in-progress" | "paused" | "completed";
  elapsedSeconds?: number;
  feedbackId?: Feedback;
  createdAt: string;
  updatedAt: string;
}

export interface Transcription {
  role: "human" | "ai";
  text: string;
  timestamp: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: "user" | "ai";
  text: string;
  timestamp: number;
  audioUrl?: string;
}

export interface InterviewDetail extends Interview {
  transcriptions: Transcription[];
}

export interface InterviewStats {
  totalInterviews: number;
  avgScore: number;
  totalDuration: number;
  streak: number;
  percentile: number;
  radarData: {
    communication: number;
    technical: number;
    confidence: number;
  };
}
