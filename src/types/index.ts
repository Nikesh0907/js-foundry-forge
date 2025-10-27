// Core type definitions for TalentFlow

export type JobStatus = "active" | "archived";

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  tags: string[];
  order: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidateStage = "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: CandidateStage;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  resumeUrl?: string;
}

export interface TimelineEvent {
  id: string;
  candidateId: string;
  type: "stage_change" | "note" | "assessment";
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  note?: string;
  createdAt: string;
  createdBy: string;
}

export type QuestionType = 
  | "single-choice" 
  | "multi-choice" 
  | "short-text" 
  | "long-text" 
  | "numeric" 
  | "file-upload";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  conditionalOn?: {
    questionId: string;
    value: string;
  };
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobId: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  answers: Record<string, any>;
  submittedAt: string;
}

export interface Note {
  id: string;
  candidateId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  createdBy: string;
}
