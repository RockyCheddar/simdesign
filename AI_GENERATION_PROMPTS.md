# AI Generation Prompts for Healthcare Simulation Progression Scenarios

## Conditional Branching AI Generation Prompt

You are a medical education expert creating conditional branching scenarios for healthcare simulations. Generate realistic progression scenarios based on key clinical decisions using ALL available case data.

### CONTEXT:
**Full Case Data:** {fullCaseData}
- Case Title: {caseTitle}
- Patient Demographics: {patientDemographics}
- Chief Complaint: {chiefComplaint}
- History of Present Illness: {historyPresentIllness}
- Current Medications: {currentMedications}
- Baseline Vital Signs: {baselineVitalSigns}
- Physical Exam Findings: {physicalExamFindings}
- Lab Results: {labResults}
- Clinical Setting: {clinicalSetting}
- Learning Objectives: {learningObjectives}
- Treatment Plan: {existingTreatmentPlan}

### USER PARAMETERS:
- Decision Focus: {decisionFocus}
- Scenario Duration: {duration} minutes
- Complexity Level: {complexity}
- Key Decision Window: {decisionWindow} minutes
- Learning Focus Areas: {learningFocusAreas}

### TASK:
Create a conditional branching scenario with 2-4 different pathways based on learner actions. Use ALL the existing case data as your foundation and ensure the progression scenarios are consistent with the patient's baseline condition, medications, and clinical context. Each pathway should show realistic medical consequences with specific data changes that build upon the existing case information.

### TIMELINE VISUALIZATION REQUIREMENTS:
For optimal timeline display, ensure each timeline point includes:

1. **Event Classification**: Specify eventType for proper icon assignment:
   - "assessment" (📋): Clinical evaluations, examinations, diagnostic tests
   - "vitals" (📊): Vital sign measurements, monitoring checks
   - "intervention" (💊): Medications, procedures, treatments
   - "deterioration" (📉): Clinical worsening, complications
   - "improvement" (📈): Clinical improvement, positive responses
   - "arrival" (👤): Patient presentation, initial contact
   - "consultation" (🩺): Specialist involvement, team discussions

2. **Realistic Clinical Timing**: Use actual clinical workflow patterns:
   - Example: 0, 3, 7, 12, 18, 25, 35, 42 minutes (not just 0, 5, 15, 30)
   - Reflect medication onset times, assessment intervals, and response patterns
   - Consider real-world workflow interruptions and priorities

3. **Enhanced Data Structure**: Organize information for clear timeline display

### IMPORTANT REQUIREMENTS:
1. **Use Existing Data**: Base all progressions on the provided baseline vital signs, medications, lab values, and patient condition
2. **Medication Interactions**: Consider how current medications affect patient responses
3. **Comorbidity Impact**: Factor in the patient's medical history and how it influences progression
4. **Lab Value Evolution**: Show how existing abnormal labs might change over time
5. **Age-Appropriate Responses**: Tailor vital sign changes and patient responses to the specific patient demographics
6. **Setting-Specific**: Consider the clinical environment (ED, ICU, etc.) and available resources

### SPECIFIC REQUIREMENTS:

**Medical Accuracy**: Base progressions on real pathophysiology AND the specific patient's condition

**Realistic Clinical Timing**: Use actual workflow patterns, not rounded intervals
- Consider medication onset times (epinephrine: 1-3 min, morphine: 5-10 min)
- Include assessment intervals (q5min for critical, q15min for stable)
- Factor in real-world delays and workflow patterns

**Specific Data**: Provide exact vital sign values that logically progress from the baseline case data

**Educational Value**: Focus on key learning objectives while using the specific case context

**Timeline Visualization**: Structure data for optimal display with proper event categorization

**Vital Sign Realism**:
- Start from the provided baseline vital signs
- Ensure physiologically plausible changes based on patient's age, weight, medications
- Include appropriate rates of change considering the patient's specific condition
- Consider medication half-lives, onset times, and drug interactions from current medications
- Account for compensatory mechanisms appropriate for this patient's age and health status

**Patient Response Authenticity**:
- Use realistic patient language appropriate for the demographics provided
- Show emotional responses consistent with the patient's background
- Include family concerns when relevant to the specific case
- Consider cultural factors if mentioned in case data

**Enhanced Physical Findings Structure**:
- Organize by body systems for clear timeline display
- Separate general appearance from system-specific findings
- Highlight key changes that occurred since previous assessment
- Include notable findings that instructors should specifically look for

### OUTPUT FORMAT (JSON):
```json
{
  "title": "Conditional Branching: [Specific Decision] - [Patient Context]",
  "description": "Brief overview of the decision point and its importance for THIS specific case",
  "type": "conditional",
  "parameters": {
    "complexity": "{complexity}",
    "duration": {duration},
    "learningFocus": ["{learningFocusAreas array}"],
    "decisionPoint": "when this decision must be made",
    "decisionWindow": {decisionWindow}
  },
  "timelineData": {
    "duration": {duration},
    "dataPoints": [
      {
        "timeMinutes": 0,
        "clinicalEvents": ["arrival", "initial_assessment"],
        "patientResponse": "Patient presentation and initial response appropriate for patient age, background, and personality from case",
        "vitalSigns": {
          "heartRate": 95,
          "bloodPressure": {"systolic": 140, "diastolic": 85},
          "respiratoryRate": 22,
          "oxygenSaturation": 94,
          "temperature": 99.2,
          "painLevel": 6
        },
        "physicalFindings": [
          "Alert but anxious appearing patient",
          "Diaphoretic with mild respiratory distress",
          "Heart rate regular, no murmurs audible",
          "Lungs clear to auscultation bilaterally"
        ],
        "significance": "concerning",
        "instructorNotes": "Key observation points for learners - note baseline from existing case data"
      },
      {
        "timeMinutes": 3,
        "clinicalEvents": ["vital_signs_obtained", "initial_assessment"],
        "patientResponse": "Patient communication style consistent with case background and demographics",
        "vitalSigns": {
          "heartRate": 102,
          "bloodPressure": {"systolic": 135, "diastolic": 82},
          "respiratoryRate": 24,
          "oxygenSaturation": 92,
          "temperature": 99.4,
          "painLevel": 7
        },
        "physicalFindings": [
          "Increased anxiety and restlessness",
          "Mild tachypnea with shallow breathing",
          "Skin warm and diaphoretic",
          "Capillary refill 2 seconds"
        ],
        "significance": "concerning",
        "instructorNotes": "Early signs of progression - emphasize decision window approaching"
      }
    ],
    "branches": [
      {
        "id": "optimal_path",
        "condition": "correct_rapid_action",
        "conditionDisplay": "Appropriate intervention within {decisionWindow} minutes",
        "outcome": "positive",
        "probability": 75,
        "timeline": [
          {
            "timeMinutes": 0,
            "clinicalEvents": ["arrival", "initial_assessment"],
            "patientResponse": "Same baseline as main timeline",
            "vitalSigns": {
              "heartRate": 95,
              "bloodPressure": {"systolic": 140, "diastolic": 85},
              "respiratoryRate": 22,
              "oxygenSaturation": 94,
              "temperature": 99.2,
              "painLevel": 6
            },
            "physicalFindings": [
              "Alert but anxious appearing patient",
              "Diaphoretic with mild respiratory distress",
              "Heart rate regular, no murmurs audible"
            ],
            "significance": "concerning",
            "instructorNotes": "Starting point for optimal intervention pathway"
          },
          {
            "timeMinutes": 8,
            "clinicalEvents": ["intervention_initiated", "medication_administered"],
            "patientResponse": "Patient acknowledges treatment, expressing some relief",
            "vitalSigns": {
              "heartRate": 88,
              "bloodPressure": {"systolic": 125, "diastolic": 78},
              "respiratoryRate": 18,
              "oxygenSaturation": 96,
              "temperature": 99.0,
              "painLevel": 4
            },
            "physicalFindings": [
              "Decreased anxiety, more cooperative",
              "Respiratory distress improving",
              "Skin less diaphoretic",
              "Good response to intervention"
            ],
            "significance": "normal",
            "instructorNotes": "Early positive response to appropriate intervention"
          },
          {
            "timeMinutes": 15,
            "clinicalEvents": ["positive_response", "symptom_improvement"],
            "patientResponse": "Patient reporting significant improvement in symptoms",
            "vitalSigns": {
              "heartRate": 78,
              "bloodPressure": {"systolic": 118, "diastolic": 72},
              "respiratoryRate": 16,
              "oxygenSaturation": 98,
              "temperature": 98.8,
              "painLevel": 2
            },
            "physicalFindings": [
              "Alert and comfortable appearing",
              "Normal respiratory effort",
              "Skin warm and dry",
              "Good color, well perfused"
            ],
            "significance": "normal",
            "instructorNotes": "Excellent response demonstrates benefits of timely intervention"
          }
        ]
      },
      {
        "id": "delayed_path",
        "condition": "delayed_action",
        "conditionDisplay": "Treatment delayed beyond {decisionWindow} minutes",
        "outcome": "negative",
        "probability": 85,
        "timeline": [
          {
            "timeMinutes": 0,
            "clinicalEvents": ["arrival", "initial_assessment"],
            "patientResponse": "Same baseline presentation as optimal path",
            "vitalSigns": {
              "heartRate": 95,
              "bloodPressure": {"systolic": 140, "diastolic": 85},
              "respiratoryRate": 22,
              "oxygenSaturation": 94,
              "temperature": 99.2,
              "painLevel": 6
            },
            "physicalFindings": [
              "Alert but anxious appearing patient",
              "Diaphoretic with mild respiratory distress",
              "Heart rate regular, no murmurs audible"
            ],
            "significance": "concerning",
            "instructorNotes": "Same starting point but different trajectory due to delayed intervention"
          },
          {
            "timeMinutes": 12,
            "clinicalEvents": ["condition_worsening", "no_intervention"],
            "patientResponse": "Patient expressing increased discomfort and anxiety",
            "vitalSigns": {
              "heartRate": 115,
              "bloodPressure": {"systolic": 155, "diastolic": 92},
              "respiratoryRate": 28,
              "oxygenSaturation": 89,
              "temperature": 99.8,
              "painLevel": 8
            },
            "physicalFindings": [
              "Markedly increased anxiety and distress",
              "Moderate respiratory distress",
              "Skin cool and clammy",
              "Delayed capillary refill"
            ],
            "significance": "critical",
            "instructorNotes": "Clear deterioration due to delayed intervention - emphasize urgency"
          },
          {
            "timeMinutes": 20,
            "clinicalEvents": ["significant_deterioration", "urgent_intervention_needed"],
            "patientResponse": "Patient unable to speak in full sentences, altered mental status",
            "vitalSigns": {
              "heartRate": 135,
              "bloodPressure": {"systolic": 95, "diastolic": 60},
              "respiratoryRate": 35,
              "oxygenSaturation": 85,
              "temperature": 100.4,
              "painLevel": 9
            },
            "physicalFindings": [
              "Severe distress, altered mental status",
              "Severe respiratory distress",
              "Skin mottled, poor perfusion",
              "Signs of impending cardiovascular collapse"
            ],
            "significance": "critical",
            "instructorNotes": "Critical deterioration requiring immediate aggressive intervention"
          }
        ]
      }
    ]
  },
  "isGenerated": true,
  "instructorNotes": {
    "keyLearningPoints": ["points specific to this case and patient"],
    "commonMistakes": ["mistakes relevant to this patient type/condition"],
    "debriefingFocus": ["discussion points using this specific case context"],
    "patientSpecificConsiderations": ["unique factors from this case to highlight"],
    "timelineTeachingPoints": ["key moments in the timeline to highlight during instruction"]
  },
  "medicalAccuracy": {
    "evidence": "Literature supporting these progressions for this specific condition/patient type",
    "variability": "How this patient's specific factors (age, meds, comorbidities) affect typical responses",
    "realismFactors": ["case-specific elements that make this realistic"],
    "timingRationale": "Clinical basis for the specific timing intervals used"
  },
  "caseIntegration": {
    "baselineConsistency": "How this builds on existing case data",
    "medicationConsiderations": "How patient's current meds affect scenario",
    "labValueProgression": "How existing lab abnormalities evolve",
    "comorbidityImpact": "How patient's medical history influences outcomes"
  }
}
```

Generate the complete scenario with realistic clinical timing intervals covering the full duration specified. Each timeline point should show measurable changes that build logically from the existing case data and that instructors can observe and assess in the context of this specific patient.

---

## Time-Based Evolution AI Generation Prompt

You are a medical education expert creating time-based progression scenarios showing natural disease evolution. Generate realistic progression showing how a condition develops over time without intervention.

### CONTEXT:
**Full Case Data:** {fullCaseData}
- Case Title: {caseTitle}
- Patient Demographics: {patientDemographics}
- Chief Complaint: {chiefComplaint}
- History of Present Illness: {historyPresentIllness}
- Current Medications: {currentMedications}
- Baseline Vital Signs: {baselineVitalSigns}
- Physical Exam Findings: {physicalExamFindings}
- Lab Results: {labResults}
- Clinical Setting: {clinicalSetting}
- Learning Objectives: {learningObjectives}

### USER PARAMETERS:
- Timeline Duration: {duration} minutes
- Progression Rate: {progressionRate} (slow/moderate/rapid)
- Natural Evolution Focus: {evolutionFocus}
- Complexity Level: {complexity}
- Learning Focus Areas: {learningFocusAreas}

### TASK:
Create a time-based progression scenario showing how the patient's condition naturally evolves using ALL existing case data as the foundation. Focus on pathophysiological progression and realistic deterioration or improvement patterns specific to this patient.

### TIMELINE VISUALIZATION REQUIREMENTS:
1. **Event Classification**: Use appropriate eventType for each timeline point:
   - "assessment": Initial evaluations, monitoring checks
   - "vitals": Scheduled vital sign measurements
   - "deterioration": Natural worsening without intervention
   - "improvement": Spontaneous improvement (rare but possible)
   - "consultation": Family discussions, specialist involvement

2. **Realistic Clinical Timing**: Use natural disease progression patterns:
   - Acute conditions: 0, 5, 12, 18, 25, 35, 50 minutes
   - Chronic conditions: 0, 15, 35, 60, 90, 120 minutes
   - Reflect actual pathophysiology timing, not arbitrary intervals

3. **Progressive Data Changes**: Show gradual, realistic evolution

### SPECIFIC REQUIREMENTS:

**Pathophysiological Accuracy**: Base progression on real disease mechanisms AND the specific patient's physiology

**Realistic Timeframes**: Use clinically accurate progression rates for this patient's condition and demographics

**Continuous Evolution**: Show gradual, believable changes reflecting natural disease progression

**Educational Timing**: Include key recognition windows appropriate for this patient

**Multiple System Effects**: Show how condition affects different body systems over time

**Patient-Specific Factors**: Consider age, comorbidities, medications in timing and progression

**Compensatory Mechanisms**: Include body's natural responses appropriate for this patient's reserve capacity

**Critical Thresholds**: Identify points where intervention becomes urgent for this specific patient

### OUTPUT FORMAT (JSON):
```json
{
  "title": "Time-Based Evolution: [Condition] - [Patient Context]",
  "description": "Natural progression of [condition] in this specific patient without intervention",
  "type": "time-based",
  "parameters": {
    "complexity": "{complexity}",
    "duration": {duration},
    "learningFocus": ["{learningFocusAreas array}"],
    "progressionRate": "{progressionRate}",
    "evolutionFocus": "{evolutionFocus}"
  },
  "timelineData": {
    "duration": {duration},
    "dataPoints": [
      {
        "timeMinutes": 0,
        "clinicalEvents": ["arrival", "baseline_established"],
        "patientResponse": "Patient's baseline presentation based on existing case data",
        "vitalSigns": {
          "heartRate": 85,
          "bloodPressure": {"systolic": 130, "diastolic": 80},
          "respiratoryRate": 18,
          "oxygenSaturation": 96,
          "temperature": 98.8,
          "painLevel": 4
        },
        "physicalFindings": [
          "Alert and oriented baseline appearance from case data",
          "Baseline physical exam findings from case",
          "Current compensatory mechanisms maintaining stability",
          "Warning signs already present but subtle"
        ],
        "significance": "normal",
        "instructorNotes": "Baseline state - emphasize compensatory mechanisms and reserve capacity for this patient's age/condition"
      },
      {
        "timeMinutes": 8,
        "clinicalEvents": ["vitals_obtained", "early_physiological_stress"],
        "patientResponse": "Patient may mention feeling 'different' or 'not quite right' - subtle changes",
        "vitalSigns": {
          "heartRate": 92,
          "bloodPressure": {"systolic": 128, "diastolic": 78},
          "respiratoryRate": 20,
          "oxygenSaturation": 95,
          "temperature": 99.1,
          "painLevel": 5
        },
        "physicalFindings": [
          "Subtle increase in work of breathing or restlessness",
          "Early signs of sympathetic activation",
          "Minimal changes from baseline that experienced clinicians notice",
          "Compensatory mechanisms beginning to activate"
        ],
        "significance": "normal",
        "instructorNotes": "Early sympathetic activation - teach recognition of subtle compensation signs in this patient demographic"
      },
      {
        "timeMinutes": 18,
        "clinicalEvents": ["assessment", "compensatory_mechanisms_active"],
        "patientResponse": "Patient notices increased discomfort, may ask for help or repositioning",
        "vitalSigns": {
          "heartRate": 105,
          "bloodPressure": {"systolic": 125, "diastolic": 75},
          "respiratoryRate": 24,
          "oxygenSaturation": 93,
          "temperature": 99.6,
          "painLevel": 6
        },
        "physicalFindings": [
          "Mild increase in work of breathing, slight restlessness",
          "Signs of increased physiological demand",
          "Clear changes from baseline measurement",
          "Active compensation maintaining stability but with effort"
        ],
        "significance": "concerning",
        "instructorNotes": "Full compensatory mechanisms engaged - key teaching point about recognizing body's response to stress"
      },
      {
        "timeMinutes": 32,
        "clinicalEvents": ["deterioration", "compensation_strain"],
        "patientResponse": "Patient expressing significant discomfort, may be anxious about worsening symptoms",
        "vitalSigns": {
          "heartRate": 118,
          "bloodPressure": {"systolic": 115, "diastolic": 70},
          "respiratoryRate": 28,
          "oxygenSaturation": 90,
          "temperature": 100.2,
          "painLevel": 7
        },
        "physicalFindings": [
          "Obvious increase in distress, diaphoresis developing",
          "Clear signs of system strain and increased work",
          "Marked deterioration from previous assessment",
          "Compensation struggling to maintain stability"
        ],
        "significance": "concerning",
        "instructorNotes": "Compensatory reserve depleting - critical teaching moment about intervention windows"
      },
      {
        "timeMinutes": 48,
        "clinicalEvents": ["deterioration", "frank_decompensation"],
        "patientResponse": "Patient may be unable to speak in full sentences, expressing significant distress",
        "vitalSigns": {
          "heartRate": 135,
          "bloodPressure": {"systolic": 95, "diastolic": 60},
          "respiratoryRate": 35,
          "oxygenSaturation": 86,
          "temperature": 101.1,
          "painLevel": 8
        },
        "physicalFindings": [
          "Obvious distress, altered mental status possible",
          "Signs of organ system strain or early failure",
          "Dramatic deterioration requiring immediate intervention",
          "Compensatory mechanisms failing"
        ],
        "significance": "critical",
        "instructorNotes": "Frank decompensation - emphasize urgency of intervention and consequences of delay"
      }
    ],
    "branches": []
  },
  "isGenerated": true,
  "pathophysiology": {
    "underlying_mechanisms": "Brief explanation of pathophysiology specific to this patient",
    "patient_factors": {
      "age_related": "How patient's age affects progression rate and compensation",
      "comorbidity_impact": "How existing conditions influence timeline",
      "medication_effects": "How current medications may help or hinder natural progression",
      "physiological_reserve": "Patient's compensatory capacity and limitations"
    },
    "progression_phases": [
      {
        "phase": "initial_presentation",
        "timeframe": "0-10 minutes",
        "description": "Baseline state with subtle early stress signs"
      },
      {
        "phase": "early_compensation", 
        "timeframe": "10-20 minutes",
        "description": "Body actively compensating, reserve being utilized"
      },
      {
        "phase": "compensation_strain",
        "timeframe": "20-40 minutes", 
        "description": "Compensatory mechanisms struggling, visible deterioration"
      },
      {
        "phase": "decompensation",
        "timeframe": "40+ minutes",
        "description": "Frank failure of compensation, urgent intervention needed"
      }
    ]
  },
  "criticalTimePoints": [
    {
      "timeMinutes": 18,
      "significance": "Early intervention window - compensation still effective",
      "reasoning": "Point where intervention can prevent further deterioration in this patient",
      "clinicalSigns": ["Specific signs indicating this critical point for this patient type"]
    },
    {
      "timeMinutes": 32,
      "significance": "Urgent intervention needed - compensation failing", 
      "reasoning": "Point where delay significantly worsens outcomes for this patient",
      "clinicalSigns": ["Warning signs of impending decompensation specific to this condition"]
    }
  ],
  "naturalOutcome": {
    "without_intervention": "Expected outcome if no treatment provided for this specific patient",
    "time_to_outcome": "Realistic timeframe for progression in this patient demographic",
    "variability_factors": ["Patient-specific factors affecting timeline"],
    "patient_specific_risks": ["Risks unique to this patient's profile"]
  },
  "instructorNotes": {
    "keyLearningPoints": [
      "Recognition of early compensation vs decompensation",
      "Understanding of patient-specific risk factors", 
      "Timing of intervention windows for this condition"
    ],
    "commonMistakes": [
      "Missing subtle early signs in this patient population",
      "Misinterpreting compensation as stability",
      "Delays specific to this patient demographic"
    ],
    "debriefingFocus": [
      "Trend analysis rather than single point values",
      "Pattern recognition skills for this patient type",
      "Understanding of disease trajectory in this demographic"
    ],
    "timelineTeachingPoints": [
      "Key moments where intervention could change trajectory",
      "Subtle signs often missed in this patient population"
    ]
  },
  "clinicalPearls": [
    "Early signs specific to this condition/patient type that are often missed",
    "Key vital sign trends to watch in this patient demographic", 
    "Physical findings that indicate progression in this specific scenario"
  ]
}
```

Generate a comprehensive progression that helps learners understand disease evolution and recognize intervention windows specific to this patient's characteristics and condition.

---

## Complication Scenario AI Generation Prompt

You are a medical education expert creating complication scenarios for healthcare simulations. Generate realistic unexpected events that could occur during case management using ALL available case data.

### CONTEXT:
**Full Case Data:** {fullCaseData}
- Case Title: {caseTitle}
- Patient Demographics: {patientDemographics}
- Chief Complaint: {chiefComplaint}
- History of Present Illness: {historyPresentIllness}
- Current Medications: {currentMedications}
- Baseline Vital Signs: {baselineVitalSigns}
- Physical Exam Findings: {physicalExamFindings}
- Lab Results: {labResults}
- Clinical Setting: {clinicalSetting}
- Primary Condition: {primaryCondition}
- Current Treatment: {currentTreatment}
- Learning Objectives: {learningObjectives}

### USER PARAMETERS:
- Complication Type: {complicationType}
- Trigger Timing: {triggerTiming} minutes
- Severity Level: {severityLevel} (mild/moderate/severe)
- Scenario Duration: {duration} minutes
- Learning Focus Areas: {learningFocusAreas}

### TASK:
Create a complication scenario that introduces an unexpected clinical event using ALL existing case data. Test learners' ability to recognize, adapt, and manage changing situations specific to this patient.

### TIMELINE VISUALIZATION REQUIREMENTS:
1. **Event Classification**: Use specific eventType for each phase:
   - "assessment": Pre-complication monitoring
   - "intervention": Treatment that triggers complication
   - "deterioration": Complication onset and progression
   - "consultation": Emergency team involvement
   - "improvement": Response to complication treatment

2. **Realistic Clinical Timing**: Use actual complication onset patterns:
   - Allergic reactions: 0, 2, 5, 8, 12 minutes (rapid onset)
   - Drug reactions: 0, 5, 15, 25, 40 minutes (varied onset)
   - Procedure complications: 0, 3, 8, 15, 30 minutes (immediate to delayed)

3. **Patient-Specific Risk Integration**: Consider all case data factors

### SPECIFIC REQUIREMENTS:

**Clinical Accuracy**: Base on real complications with accurate presentation for this patient type

**Realistic Timing**: Use appropriate onset and progression timeframes for this patient's characteristics

**Severity Appropriate**: Match requested severity level with realistic presentation

**Educational Value**: Focus on recognition and management skills specific to this patient

**Multiple Pathways**: Show different outcomes based on management decisions

**Patient-Specific Risk Integration**: Use ALL case data to determine realistic complication risk

**Early Warning Signs**: Include subtle initial symptoms appropriate for this patient

**Crisis Management**: Test team coordination and communication skills

**Timeline Optimization**: Structure data for clear visual timeline display

### COMPLICATION TYPES TO CONSIDER:
- **Medication Reactions**: Allergic reactions, drug interactions, side effects specific to this patient's medication profile
- **Procedure Complications**: Bleeding, perforation, equipment issues related to current treatment
- **Concurrent Conditions**: New symptoms, exacerbation of existing conditions from patient's medical history
- **Equipment Failures**: Monitor malfunctions, IV infiltration, oxygen delivery issues
- **Patient Factors**: Non-compliance, anxiety reactions, family interference based on patient demographics

### TIMING PRINCIPLES:
- Early signs should be subtle and potentially missed by novice learners
- Progressive worsening if not recognized/treated appropriately
- Realistic response times to interventions based on complication type and patient factors
- Include "point of no return" if applicable for educational impact
- Consider patient-specific factors that may accelerate or slow progression

### OUTPUT FORMAT (JSON):
```json
{
  "title": "Complication: [Specific Complication] - [Patient Context]",
  "description": "What complication occurs and why it's educationally valuable for this specific patient",
  "type": "complication",
  "parameters": {
    "complexity": "{severityLevel}",
    "duration": {duration},
    "learningFocus": ["{learningFocusAreas array}"],
    "complicationType": "{complicationType}",
    "triggerTiming": {triggerTiming},
    "severityLevel": "{severityLevel}"
  },
  "timelineData": {
    "duration": {duration},
    "dataPoints": [
      {
        "timeMinutes": 0,
        "clinicalEvents": ["assessment", "routine_care"],
        "patientResponse": "Patient comfortable and cooperative at baseline from case data",
        "vitalSigns": {
          "heartRate": 85,
          "bloodPressure": {"systolic": 130, "diastolic": 80},
          "respiratoryRate": 18,
          "oxygenSaturation": 96,
          "temperature": 98.8,
          "painLevel": 3
        },
        "physicalFindings": [
          "Patient baseline appearance from case data",
          "Normal findings for this patient",
          "Any subtle risk factors visible",
          "Comfortable and cooperative"
        ],
        "significance": "normal",
        "instructorNotes": "Baseline state - emphasize underlying risk factors from patient's case data"
      },
      {
        "timeMinutes": "based on triggerTiming parameter",
        "clinicalEvents": ["intervention", "trigger_event"],
        "patientResponse": "Patient tolerating intervention initially, no immediate concerns",
        "vitalSigns": {
          "heartRate": 88,
          "bloodPressure": {"systolic": 128, "diastolic": 78},
          "respiratoryRate": 18,
          "oxygenSaturation": 96,
          "temperature": 98.8,
          "painLevel": 3
        },
        "physicalFindings": [
          "Patient still comfortable after intervention",
          "No immediate changes visible",
          "Intervention completed without apparent issues",
          "Normal immediate post-intervention appearance"
        ],
        "significance": "normal",
        "instructorNotes": "Trigger event completed - complication will develop from this point"
      },
      {
        "timeMinutes": "triggerTiming + 2",
        "clinicalEvents": ["deterioration", "complication_onset"],
        "patientResponse": "Patient may mention feeling 'different', 'not right', or specific early symptoms",
        "vitalSigns": {
          "heartRate": 95,
          "bloodPressure": {"systolic": 125, "diastolic": 76},
          "respiratoryRate": 20,
          "oxygenSaturation": 95,
          "temperature": 99.0,
          "painLevel": 4
        },
        "physicalFindings": [
          "Very subtle changes - easy to miss initially",
          "Earliest complication-specific manifestations",
          "Subtle changes from baseline that experienced clinicians notice",
          "Patient appears slightly less comfortable"
        ],
        "significance": "concerning",
        "instructorNotes": "Early complication signs - test learner recognition of subtle changes"
      },
      {
        "timeMinutes": "triggerTiming + 5",
        "clinicalEvents": ["deterioration", "complication_progressing"],
        "patientResponse": "Patient expressing specific symptoms related to complication, increased concern",
        "vitalSigns": {
          "heartRate": 108,
          "bloodPressure": {"systolic": 118, "diastolic": 72},
          "respiratoryRate": 24,
          "oxygenSaturation": 92,
          "temperature": 99.4,
          "painLevel": 6
        },
        "physicalFindings": [
          "Changes becoming more obvious and concerning",
          "Clear complication-specific manifestations",
          "Obvious progression from baseline",
          "Signs that should prompt immediate assessment"
        ],
        "significance": "critical",
        "instructorNotes": "Complication becoming obvious - intervention window critical"
      }
    ],
    "branches": [
      {
        "id": "immediate_recognition",
        "condition": "appropriate_immediate_treatment",
        "conditionDisplay": "Complication recognized and treated within 2 minutes of onset",
        "outcome": "positive",
        "probability": 80,
        "timeline": [
          {
            "timeMinutes": "triggerTiming + 7",
            "clinicalEvents": ["intervention", "emergency_treatment"],
            "patientResponse": "Patient acknowledging treatment, expressing some relief from symptoms",
            "vitalSigns": {
              "heartRate": 98,
              "bloodPressure": {"systolic": 122, "diastolic": 75},
              "respiratoryRate": 22,
              "oxygenSaturation": 94,
              "temperature": 99.2,
              "painLevel": 5
            },
            "physicalFindings": [
              "Patient showing early signs of improvement",
              "Complication-specific symptoms beginning to resolve",
              "Positive response to emergency treatment",
              "Reassuring signs of stabilization"
            ],
            "significance": "concerning",
            "instructorNotes": "Early positive response to appropriate treatment - emphasize benefits of quick recognition"
          },
          {
            "timeMinutes": "triggerTiming + 15",
            "clinicalEvents": ["improvement", "complication_resolved"],
            "patientResponse": "Patient expressing significant relief, symptoms largely resolved",
            "vitalSigns": {
              "heartRate": 88,
              "bloodPressure": {"systolic": 128, "diastolic": 78},
              "respiratoryRate": 19,
              "oxygenSaturation": 96,
              "temperature": 98.9,
              "painLevel": 3
            },
            "physicalFindings": [
              "Patient much more comfortable, crisis resolved",
              "Clear improvement in complication-specific signs",
              "Return toward baseline appearance",
              "Successful resolution of emergency"
            ],
            "significance": "normal",
            "instructorNotes": "Excellent outcome with prompt recognition and treatment"
          }
        ]
      },
      {
        "id": "delayed_recognition",
        "condition": "delayed_or_inadequate_treatment",
        "conditionDisplay": "Complication not recognized or treatment delayed >5 minutes",
        "outcome": "negative",
        "probability": 90,
        "timeline": [
          {
            "timeMinutes": "triggerTiming + 10",
            "clinicalEvents": ["deterioration", "severe_progression"],
            "patientResponse": "Patient expressing severe distress, symptoms worsening significantly",
            "vitalSigns": {
              "heartRate": 125,
              "bloodPressure": {"systolic": 95, "diastolic": 60},
              "respiratoryRate": 32,
              "oxygenSaturation": 88,
              "temperature": 100.1,
              "painLevel": 8
            },
            "physicalFindings": [
              "Patient in obvious severe distress",
              "Severe manifestations of complication",
              "Life-threatening progression without treatment",
              "Signs requiring immediate emergency intervention"
            ],
            "significance": "critical",
            "instructorNotes": "Severe deterioration due to delayed recognition - emphasize consequences"
          },
          {
            "timeMinutes": "triggerTiming + 20",
            "clinicalEvents": ["consultation", "emergency_team"],
            "patientResponse": "Patient may be unable to respond appropriately, severely compromised",
            "vitalSigns": {
              "heartRate": 145,
              "bloodPressure": {"systolic": 85, "diastolic": 50},
              "respiratoryRate": 38,
              "oxygenSaturation": 82,
              "temperature": 101.2,
              "painLevel": 9
            },
            "physicalFindings": [
              "Patient critically ill, possibly altered mental status",
              "Multi-system involvement from severe complication",
              "Life-threatening presentation requiring intensive care",
              "Signs consistent with severe systemic reaction"
            ],
            "significance": "critical",
            "instructorNotes": "Critical deterioration requiring emergency team activation and intensive interventions"
          }
        ]
      }
    ]
  },
  "isGenerated": true,
  "patientRiskFactors": {
    "demographic_risks": ["Age-related factors from case data", "Gender-specific risks"],
    "medical_history_risks": ["Comorbidities from case that increase complication risk"],
    "medication_interactions": ["Current drugs from case that contribute to risk or affect treatment"],
    "procedural_risks": ["Factors related to current treatment that increase complication likelihood"]
  },
  "trigger": {
    "trigger_event": "Specific intervention or action that causes complication",
    "trigger_description": "What happens to cause the complication in this specific patient",
    "realistic_probability": "Likelihood of this complication in this patient based on case factors",
    "risk_factors": ["Patient-specific factors from case data that increase risk"],
    "warning_signs": ["Subtle signs that may have preceded the complication"]
  },
  "instructorNotes": {
    "keyLearningPoints": [
      "Early recognition of complication signs in this patient type",
      "Appropriate treatment protocols for this specific complication",
      "Understanding how patient factors affect complication presentation"
    ],
    "commonMistakes": [
      "Missing subtle early signs in this patient population",
      "Misattributing symptoms to primary condition",
      "Delays in recognition specific to this complication type"
    ],
    "debriefingFocus": [
      "Recognition strategies for this complication in this patient type",
      "Team communication during crisis management",
      "Prevention strategies based on patient risk factors"
    ],
    "cuingStrategy": "How to guide learners if they miss early complication signs",
    "timelineTeachingPoints": [
      "Critical moments for complication recognition",
      "Decision points that affect patient outcomes"
    ]
  },
  "clinicalRealism": {
    "incidence_rate": "How common this complication is in patients like this one",
    "evidence_base": "Literature supporting this complication presentation and timing",
    "standard_treatment": "Evidence-based management approach for this complication",
    "patient_variability": "How this patient's characteristics affect typical presentation",
    "outcome_expectations": "Realistic outcomes with proper vs delayed management"
  }
}
```

Generate a comprehensive complication scenario that challenges learners while remaining clinically realistic and educationally valuable for this specific patient and clinical context.

---

## Additional Progression Scenario Prompts

*All three core progression scenario prompts now complete and ready for AI generation integration.* 