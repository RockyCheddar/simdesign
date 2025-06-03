/**
 * Types for Progression Scenarios
 * These interfaces define the structure for managing case progression scenarios
 */

import { VitalSigns } from './index';

export interface ProgressionScenario {
  id: string;
  type: 'conditional' | 'time-based' | 'complication';
  title: string;
  description: string;
  isGenerated: boolean;
  createdAt: Date;
  timelineData?: TimelineData;
  parameters: ProgressionParameters;
  instructorNotes?: string;
}

export interface TimelineData {
  duration: number; // in minutes
  dataPoints: TimelinePoint[];
  branches?: ConditionalBranch[];
}

export interface TimelinePoint {
  timeMinutes: number;
  vitalSigns: VitalSigns;
  physicalFindings: string[];
  patientResponse: string;
  clinicalEvents: string[];
  significance: 'normal' | 'concerning' | 'critical';
  instructorNotes?: string;
}

export interface ConditionalBranch {
  id: string;
  condition: string; // "medication_given_within_5_min"
  conditionDisplay: string; // "Medication given within 5 minutes"
  timeline: TimelinePoint[];
  outcome: 'positive' | 'negative' | 'neutral';
  probability: number; // 0-100
}

export interface ProgressionParameters {
  decisionPoint?: string; // for conditional
  timelineLength?: number; // for time-based
  complicationType?: string; // for complication
  complexity: 'simple' | 'moderate' | 'complex';
  learningFocus: string[];
  triggerTiming?: number; // minutes from scenario start
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface ScenarioType {
  id: 'conditional' | 'time-based' | 'complication';
  label: string;
  icon: string;
  description: string;
  examples: string[];
}

export interface CreateProgressionFormData {
  type: 'conditional' | 'time-based' | 'complication';
  title: string;
  description: string;
  parameters: ProgressionParameters;
  generateWithAI: boolean;
}

export interface ProgressionDragItem {
  id: string;
  index: number;
  type: 'scenario';
}

export interface AIGenerationProgress {
  stage: 'initializing' | 'generating-timeline' | 'creating-branches' | 'finalizing';
  progress: number; // 0-100
  message: string;
}

export interface ProgressionExportData {
  scenarios: ProgressionScenario[];
  metadata: {
    exportedAt: Date;
    version: string;
    caseId?: string;
  };
} 