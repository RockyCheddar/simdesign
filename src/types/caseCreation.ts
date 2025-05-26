export interface LearningContext {
  targetLearners?: string;
  experienceLevel?: 'novice' | 'intermediate' | 'advanced';
  clinicalDomain?: string;
  duration?: number;
  participantCount?: number;
  title?: string;
  description?: string;
  learningObjectives?: string[];
}

export interface RefinedObjectives {
  originalObjectives: string[];
  aiImprovedObjectives: string[];
  selectedObjectives: string[];
  feedback?: string;
}

export interface ParameterQuestion {
  id: string;
  category: 'clinical_scenario' | 'resources' | 'complexity' | 'assessment';
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'boolean';
  options?: string[];
  required: boolean;
  answer?: any;
}

export interface ParameterAnswers {
  [questionId: string]: any;
}

export interface CasePreview {
  learningContext: LearningContext;
  refinedObjectives: RefinedObjectives;
  parameterAnswers: ParameterAnswers;
  estimatedGenerationTime: number;
  complexityScore: number;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'completed' | 'error';
  currentPhase: string;
  progress: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface CaseCreationFormData {
  currentStep: number;
  learningContext: Partial<LearningContext>;
  refinedObjectives: Partial<RefinedObjectives>;
  parameterQuestions: ParameterQuestion[];
  parameterAnswers: ParameterAnswers;
  casePreview: Partial<CasePreview>;
  generationProgress: GenerationProgress;
  isValid: boolean;
  errors: Record<string, string>;
}

export const FORM_STEPS = [
  {
    id: 1,
    title: 'Learning Context & Objectives',
    description: 'Define target learners and learning goals',
    component: 'LearningContextStep'
  },
  {
    id: 2,
    title: 'AI Objectives Refinement',
    description: 'Review and improve learning objectives',
    component: 'ObjectivesRefinementStep'
  },
  {
    id: 3,
    title: 'Parameter Questions',
    description: 'Answer questions about the clinical scenario',
    component: 'ParameterQuestionsStep'
  },
  {
    id: 4,
    title: 'Case Preview',
    description: 'Review all parameters before generation',
    component: 'CasePreviewStep'
  },
  {
    id: 5,
    title: 'Case Generation',
    description: 'AI generates your simulation case',
    component: 'CaseGenerationStep'
  }
] as const;

export type FormStepComponent = typeof FORM_STEPS[number]['component']; 