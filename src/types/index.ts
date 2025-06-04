// Healthcare Simulation Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt?: Date;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export interface SimulationCase {
  id: string;
  title: string;
  description: string;
  patientInfo: PatientInfo;
  scenario: CaseScenario;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
  originalGeneratedData?: import('@/types/caseCreation').GeneratedCaseData; // Preserve full AI-generated data
  progressionScenarios?: import('@/types/progression').ProgressionScenario[]; // Stored progression scenarios
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  chiefComplaint: string;
}

export interface CaseScenario {
  initialPresentation: string;
  vitalSigns: VitalSigns;
  physicalExam: PhysicalExamFindings;
  labResults?: LabResult[];
  imagingResults?: ImagingResult[];
  progressNotes: ProgressNote[];
}

export interface VitalSigns {
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  respiratoryRate: number;
  temperature: number; // in Celsius
  oxygenSaturation: number;
  painLevel: number; // 0-10 scale
}

export interface PhysicalExamFindings {
  general: string;
  cardiovascular: string;
  respiratory: string;
  abdominal: string;
  neurological: string;
  musculoskeletal: string;
  skin: string;
}

export interface LabResult {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface ImagingResult {
  type: string; // X-ray, CT, MRI, etc.
  findings: string;
  impression: string;
  date: Date;
}

export interface ProgressNote {
  timestamp: Date;
  note: string;
  author: string;
  type: 'assessment' | 'intervention' | 'response' | 'observation';
}

export interface CaseFormData {
  step: number;
  patientInfo: Partial<PatientInfo>;
  scenario: Partial<CaseScenario>;
  caseDetails: {
    title: string;
    description: string;
    learningObjectives: string[];
    difficulty: SimulationCase['difficulty'];
    duration: number;
    tags: string[];
    isPublic: boolean;
  };
}

export interface AIGenerationRequest {
  prompt: string;
  caseType: 'emergency' | 'routine' | 'complex' | 'pediatric' | 'geriatric';
  specialty: string;
  difficulty: SimulationCase['difficulty'];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AppState {
  user: User | null;
  cases: SimulationCase[];
  currentCase: SimulationCase | null;
  isLoading: boolean;
  error: string | null;
}

export type Tab = 'overview' | 'patient' | 'scenario' | 'objectives' | 'notes';

export interface TabContent {
  id: Tab;
  label: string;
  icon?: string;
} 