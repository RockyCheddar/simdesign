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

export interface RefinedObjective {
  original: string;
  refined: string;
  explanation: string;
  accepted: boolean;
}

export interface RefinedObjectives {
  originalObjectives: string[];
  aiImprovedObjectives: RefinedObjective[];
  selectedObjectives: string[];
  feedback?: string;
  isLoading?: boolean;
  error?: string;
}

export interface ParameterQuestion {
  id: string;
  category: 'clinical_scenario' | 'simulation_resources' | 'complexity_fidelity' | 'assessment_methods' | 'facilitation_style';
  question: string;
  type: 'select' | 'multiselect' | 'text' | 'range' | 'boolean';
  options?: string[];
  required: boolean;
  answer?: string | number | boolean | string[];
}

export interface ParameterAnswers {
  [questionId: string]: string | number | boolean | string[];
}

export interface CasePreview {
  learningContext?: Partial<LearningContext>;
  refinedObjectives?: Partial<RefinedObjectives>;
  parameterAnswers?: ParameterAnswers;
  estimatedGenerationTime?: number;
  complexityScore?: number;
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