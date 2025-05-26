export const APP_CONFIG = {
  name: 'Healthcare Simulation Case Generator',
  version: '1.0.0',
  description: 'AI-powered medical case simulation generator for healthcare education',
};

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' },
] as const;

export const CASE_TYPES = [
  { value: 'emergency', label: 'Emergency Medicine' },
  { value: 'routine', label: 'Routine Care' },
  { value: 'complex', label: 'Complex Case' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'geriatric', label: 'Geriatric' },
] as const;

export const MEDICAL_SPECIALTIES = [
  'Cardiology',
  'Emergency Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Surgery',
  'Neurology',
  'Psychiatry',
  'Orthopedics',
  'Dermatology',
  'Radiology',
  'Anesthesiology',
  'Obstetrics & Gynecology',
] as const;

export const VITAL_SIGNS_NORMAL_RANGES = {
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
  },
  heartRate: { min: 60, max: 100 },
  respiratoryRate: { min: 12, max: 20 },
  temperature: { min: 36.1, max: 37.2 }, // Celsius
  oxygenSaturation: { min: 95, max: 100 },
} as const;

export const FORM_VALIDATION_RULES = {
  patientName: {
    required: 'Patient name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
  },
  age: {
    required: 'Age is required',
    min: { value: 0, message: 'Age must be positive' },
    max: { value: 120, message: 'Age must be realistic' },
  },
  weight: {
    required: 'Weight is required',
    min: { value: 0.5, message: 'Weight must be positive' },
    max: { value: 500, message: 'Weight must be realistic' },
  },
  height: {
    required: 'Height is required',
    min: { value: 30, message: 'Height must be positive' },
    max: { value: 250, message: 'Height must be realistic' },
  },
  title: {
    required: 'Case title is required',
    minLength: { value: 5, message: 'Title must be at least 5 characters' },
  },
  description: {
    required: 'Case description is required',
    minLength: { value: 20, message: 'Description must be at least 20 characters' },
  },
} as const;

export const API_ENDPOINTS = {
  generateCase: '/api/generate-case',
  saveCase: '/api/cases',
  getCases: '/api/cases',
  getCase: (id: string) => `/api/cases/${id}`,
  updateCase: (id: string) => `/api/cases/${id}`,
  deleteCase: (id: string) => `/api/cases/${id}`,
} as const;

export const LOCAL_STORAGE_KEYS = {
  user: 'healthcare-sim-user',
  cases: 'healthcare-sim-cases',
  theme: 'healthcare-sim-theme',
} as const; 