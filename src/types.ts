export interface ScoringPoint {
  point: string;
  status: 'MET' | 'PARTIALLY MET' | 'MISSING';
  explanation: string;
}

export interface MarkBreakdownItem {
  criterion: string;
  score: number;
  maxScore: number;
}

export interface StructureScore {
  introduction: 'Good' | 'Strong' | 'Average' | 'Needs Work' | string;
  body: 'Good' | 'Strong' | 'Average' | 'Needs Work' | string;
  conclusion: 'Good' | 'Strong' | 'Average' | 'Needs Work' | string;
}

export interface EvaluationResult {
  estimatedScore: number;
  scoreSummary?: string;
  topic?: string;
  scoringPoints: ScoringPoint[];
  marksBreakdown?: MarkBreakdownItem[];
  structureScore?: StructureScore;
  confidencePercentage?: number;
  missingConcepts: string[];
  marksLostExplanation: string;
  improvementSuggestions: string[];
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  generalFeedback: string;
  modelAnswer?: string;
}

export interface EvaluationHistoryItem {
  id: string;
  timestamp: string;
  dateNumber: number;
  subject: string;
  question: string;
  answer: string;
  maxMarks: number;
  estimatedScore: number;
  percentage: number;
  result: EvaluationResult;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

