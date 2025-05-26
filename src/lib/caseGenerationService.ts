import { 
  GeneratedCaseData, 
  LearningContext, 
  ParameterAnswers, 
  SmartDefaults 
} from '@/types/caseCreation';
import { determineSmartDefaults } from '@/lib/smartDefaults';

export interface CaseGenerationRequest {
  learningContext: Partial<LearningContext>;
  refinedObjectives: string[];
  parameterAnswers: ParameterAnswers;
}

export interface CaseGenerationResponse {
  success: boolean;
  data?: GeneratedCaseData;
  error?: string;
  details?: string;
}

// Generate comprehensive case prompt
export const generateCasePrompt = (request: CaseGenerationRequest): string => {
  const { learningContext, refinedObjectives, parameterAnswers } = request;
  const smartDefaults = determineSmartDefaults(learningContext, parameterAnswers);
  
  // Determine which smart defaults to include
  const includeExpanded = smartDefaults.expanded.length > 0;
  const includeAcuteCare = smartDefaults.acuteCare.length > 0;
  const includeProcedural = smartDefaults.procedural.length > 0;

  return `
You are an expert medical educator creating comprehensive healthcare simulation cases. Generate a detailed simulation case following the EXACT specifications below.

**CONTEXT:**
- Target Learners: ${learningContext.targetLearners}
- Experience Level: ${learningContext.experienceLevel}
- Clinical Domain: ${learningContext.clinicalDomain}
- Duration: ${learningContext.duration} minutes
- Participant Count: ${learningContext.participantCount}

**LEARNING OBJECTIVES:**
${refinedObjectives.map(obj => `- ${obj}`).join('\n')}

**PARAMETER SPECIFICATIONS:**
${Object.entries(parameterAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**SMART DEFAULTS APPLIED:**
${includeExpanded ? `- Expanded content for advanced learners: ${smartDefaults.expanded.join(', ')}` : ''}
${includeAcuteCare ? `- Acute care content: ${smartDefaults.acuteCare.join(', ')}` : ''}
${includeProcedural ? `- Procedural content: ${smartDefaults.procedural.join(', ')}` : ''}

**GENERATE EXACTLY THIS JSON STRUCTURE:**

{
  "overview": {
    "caseTitle": "string (max 80 chars, descriptive clinical title)",
    "caseSummary": "string (2-3 sentences, elevator pitch of scenario)",
    "learningObjectives": ["array of refined objectives from input"],
    "patientBasics": {
      "name": "realistic name appropriate for demographics",
      "age": "integer",
      "gender": "male/female/other", 
      "race": "diverse representation"
    },
    "clinicalSetting": {
      "location": "Emergency Department/ICU/Medical Floor/etc.",
      "timeOfDay": "specific time affecting staffing/resources",
      "acuity": "high/medium/low",
      "environmentalFactors": "noise, family present, etc."
    }
  },
  "patient": {
    "demographics": {
      "fullName": "First Last",
      "age": "integer",
      "gender": "male/female/other",
      "weight": "number in kg (one decimal)",
      "height": "integer in cm", 
      "BMI": "calculated (one decimal)"
    },
    "chiefComplaint": "string (patient's own words, 1-2 sentences)",
    "historyPresentIllness": {
      "onset": "when symptoms started",
      "duration": "how long",
      "severity": "scale or description",
      "associatedSymptoms": ["array of related symptoms"],
      "timeline": "chronological progression (paragraph format)"
    },
    "currentMedications": [
      {
        "name": "generic name",
        "dose": "amount with units", 
        "frequency": "how often",
        "indication": "why prescribed"
      }
    ]
  },
  "presentation": {
    "vitalSigns": {
      "temperature": {
        "value": "number (one decimal, e.g., 37.2)",
        "unit": "string (°C or °F)",
        "normalRange": "string (e.g., '36.1-37.2°C')",
        "status": "string (normal/elevated/high/critical/low)",
        "colorCode": "string (green/yellow/red)",
        "displaySize": "string (always 'large bold numbers for card display')"
      },
      "heartRate": {
        "value": "number (integer, e.g., 85)", 
        "unit": "string (always 'bpm')",
        "normalRange": "string (e.g., '60-100 bpm')",
        "status": "string (normal/elevated/high/critical/low)",
        "colorCode": "string (green/yellow/red)",
        "displaySize": "string (always 'large bold numbers for card display')"
      },
      "bloodPressure": {
        "systolic": "number (integer, e.g., 120)",
        "diastolic": "number (integer, e.g., 80)", 
        "unit": "string (always 'mmHg')",
        "normalRange": "string (e.g., '<120/80 mmHg')",
        "status": "string (normal/elevated/high/critical)",
        "colorCode": "string (green/yellow/red)",
        "displaySize": "string (always 'large bold numbers for card display')"
      },
      "respiratoryRate": {
        "value": "number (integer, e.g., 16)",
        "unit": "string (always 'breaths/min')",
        "normalRange": "string (e.g., '12-20/min')", 
        "status": "string (normal/elevated/high/critical/low)",
        "colorCode": "string (green/yellow/red)",
        "displaySize": "string (always 'large bold numbers for card display')"
      },
      "oxygenSaturation": {
        "value": "number (integer, e.g., 98)",
        "unit": "string (always '%')",
        "oxygenSupport": "string (e.g., 'room air', '2L NC', '15L NRB')",
        "normalRange": "string (e.g., '95-100%')",
        "status": "string (normal/low/critical)",
        "colorCode": "string (green/yellow/red)",
        "displaySize": "string (always 'large bold numbers for card display')"
      }
    },
    "physicalExamFindings": {
      "general": "overall appearance, distress level",
      "primarySystem": "focused exam of affected system",
      "keyAbnormalities": ["array of significant findings"],
      "normalFindings": ["array of reassuring normal findings"]
    }
  },
  "treatment": {
    "initialInterventions": [
      {
        "intervention": "specific action or treatment",
        "rationale": "clinical reasoning for this intervention",
        "timing": "when to perform (immediate/within 5min/etc.)",
        "expectedOutcome": "what should happen as a result"
      }
    ],
    "treatmentPlan": {
      "immediate": ["array of urgent actions needed now"],
      "shortTerm": ["array of actions for next few hours"],
      "monitoring": ["array of parameters to monitor and frequency"]
    },
    "scenarioProgression": {
      "phase1": "initial presentation and assessment (first 5-10 minutes)",
      "phase2": "response to initial interventions (next 10-15 minutes)",
      "phase3": "ongoing management and complications (final phase)",
      "endPoint": "clear resolution criteria or transfer point"
    }
  },
  "simulation": {
    "learningObjectives": ["array of simulation-specific learning goals"],
    "competencyAreas": [
      {
        "domain": "clinical competency area (e.g., Assessment, Communication)",
        "specificSkills": ["array of specific skills to demonstrate"],
        "assessmentCriteria": ["array of observable behaviors for evaluation"]
      }
    ],
    "coreAssessment": {
      "criticalActions": ["array of must-do actions for patient safety"],
      "performanceIndicators": ["array of behaviors indicating competence"],
      "safetyConsiderations": ["array of safety issues to monitor"]
    }
  },
  "smartDefaults": {
    "expandedContent": "additional content for advanced learners or complex cases",
    "minimalContent": "simplified content for novice learners or basic cases",
    "acuteCareContent": "specialized content for ICU/Emergency scenarios",
    "proceduralContent": "step-by-step procedural guidance when applicable",
    "assessmentTools": "specific assessment instruments or checklists",
    "debriefingPoints": "key discussion points for post-simulation debrief"
  },
  "onDemandOptions": {
    "labResults": "additional lab values that can be requested",
    "imagingStudies": "available imaging and expected findings",
    "consultations": "specialist consultations available and their input",
    "familyInteraction": "family member concerns and questions",
    "complications": "potential complications that could be introduced",
    "resources": "additional equipment or personnel that could be called"
  }
}

Make sure all values are realistic and appropriate for the medical condition. The case should be educationally valuable and clinically accurate.
`;
};

// Estimate generation time based on complexity
export const estimateGenerationTime = (
  learningContext: Partial<LearningContext>,
  parameterAnswers: ParameterAnswers
): number => {
  const { experienceLevel, duration, participantCount } = learningContext;
  
  let baseTime = 15; // Base 15 seconds
  
  // Add time based on experience level (more advanced = more complex)
  if (experienceLevel === 'advanced') {
    baseTime += 10;
  } else if (experienceLevel === 'intermediate') {
    baseTime += 5;
  }
  
  // Add time based on duration (longer cases = more content)
  if (duration && duration > 60) {
    baseTime += 15;
  } else if (duration && duration > 30) {
    baseTime += 8;
  }
  
  // Add time based on participant count (more participants = more complexity)
  if (participantCount && participantCount > 6) {
    baseTime += 10;
  } else if (participantCount && participantCount > 3) {
    baseTime += 5;
  }
  
  // Check for complex parameters
  const complexityAnswer = parameterAnswers['complexity'] as string;
  if (complexityAnswer?.toLowerCase().includes('high') || 
      complexityAnswer?.toLowerCase().includes('complex')) {
    baseTime += 12;
  }
  
  // Check for procedural cases (typically more detailed)
  const caseType = parameterAnswers['case_type'] as string;
  if (caseType?.toLowerCase().includes('procedural') ||
      caseType?.toLowerCase().includes('skills')) {
    baseTime += 8;
  }
  
  return Math.min(baseTime, 60); // Cap at 60 seconds
}; 