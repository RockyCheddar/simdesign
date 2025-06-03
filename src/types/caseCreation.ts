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
  whyThisMatters?: string;
  focusArea?: string;
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

// Enhanced types for comprehensive case generation
export interface VitalSign {
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'elevated' | 'high' | 'critical' | 'low';
  colorCode: 'green' | 'yellow' | 'red';
  displaySize: 'large bold numbers for card display';
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'elevated' | 'high' | 'critical';
  colorCode: 'green' | 'yellow' | 'red';
  displaySize: 'large bold numbers for card display';
}

export interface OxygenSaturation extends VitalSign {
  oxygenSupport: string;
}

export interface VitalSigns {
  temperature: VitalSign;
  heartRate: VitalSign;
  bloodPressure: BloodPressure;
  respiratoryRate: VitalSign;
  oxygenSaturation: OxygenSaturation;
}

export interface PhysicalExamFindings {
  general: string;
  primarySystem: string;
  keyAbnormalities: string[];
  normalFindings: string[];
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  indication: string;
}

export interface PatientDemographics {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg, one decimal
  height: number; // in cm
  BMI: number; // calculated, one decimal
}

export interface HistoryPresentIllness {
  onset: string;
  duration: string;
  severity: string;
  associatedSymptoms: string[];
  timeline: string; // paragraph format
}

export interface ClinicalSetting {
  location: string;
  timeOfDay: string;
  acuity: 'high' | 'medium' | 'low';
  environmentalFactors: string;
}

export interface PatientBasics {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  race: string;
}

export interface Intervention {
  intervention: string;
  rationale: string;
  timing: string;
  expectedOutcome: string;
}

export interface TreatmentPlan {
  immediate: string[];
  shortTerm: string[];
  monitoring: string[];
}

export interface ScenarioProgression {
  phase1: string;
  phase2: string;
  phase3: string;
  endPoint: string;
}

export interface CompetencyArea {
  domain: string;
  specificSkills: string[];
  assessmentCriteria: string[];
}

export interface CoreAssessment {
  criticalActions: string[];
  performanceIndicators: string[];
  safetyConsiderations: string[];
}

// Main case data structure
export interface GeneratedCaseData {
  overview: {
    caseTitle: string; // max 80 chars
    caseSummary: string; // 2-3 sentences
    learningObjectives: string[];
    patientBasics: PatientBasics;
    clinicalSetting: ClinicalSetting;
  };
  patient: {
    demographics: PatientDemographics;
    chiefComplaint: string; // patient's own words, 1-2 sentences
    historyPresentIllness: HistoryPresentIllness;
    currentMedications: Medication[];
  };
  presentation: {
    vitalSigns: VitalSigns;
    physicalExamFindings: PhysicalExamFindings;
  };
  treatment: {
    initialInterventions: Intervention[];
    treatmentPlan: TreatmentPlan;
    scenarioProgression: ScenarioProgression;
  };
  simulation: {
    learningObjectives: string[];
    competencyAreas: CompetencyArea[];
    coreAssessment: CoreAssessment;
  };
  // Smart defaults and on-demand content
  smartDefaults: {
    [key: string]: string | undefined;
  };
  onDemandOptions: {
    [key: string]: string | undefined;
  };
}

export interface SmartDefaults {
  expanded: string[]; // Advanced learners OR duration >45min OR high complexity
  minimal: string[]; // Novice learners OR duration <30min OR low complexity
  acuteCare: string[]; // ICU/Emergency cases
  procedural: string[]; // Procedural/Skills cases
}

export interface CaseCreationFormData {
  currentStep: number;
  learningContext: Partial<LearningContext>;
  refinedObjectives: Partial<RefinedObjectives>;
  parameterQuestions: ParameterQuestion[];
  parameterAnswers: ParameterAnswers;
  casePreview: Partial<CasePreview>;
  generationProgress: GenerationProgress;
  generatedCase?: GeneratedCaseData;
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