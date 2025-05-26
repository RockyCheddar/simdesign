import { SimulationCase } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate mock simulation cases for testing
 */
export const generateMockCases = (): SimulationCase[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: uuidv4(),
      title: "Acute Myocardial Infarction in Emergency Department",
      description: "A 58-year-old male presents to the emergency department with severe chest pain radiating to the left arm. This case focuses on rapid assessment, ECG interpretation, and emergency intervention protocols for STEMI patients.",
      difficulty: 'intermediate',
      duration: 45,
      createdBy: 'demo-user',
      createdAt: now,
      updatedAt: now,
      tags: ['cardiology', 'emergency medicine', 'ECG', 'STEMI'],
      isPublic: true,
      learningObjectives: [
        "Recognize classic signs and symptoms of acute myocardial infarction",
        "Interpret ECG findings consistent with STEMI",
        "Implement appropriate emergency treatment protocols",
        "Demonstrate effective patient communication during crisis"
      ],
      patientInfo: {
        name: "Robert Johnson",
        age: 58,
        gender: 'male',
        weight: 82,
        height: 175,
        allergies: ["Penicillin"],
        medications: ["Metoprolol 25mg BID", "Atorvastatin 40mg daily"],
        medicalHistory: ["Hypertension", "Hyperlipidemia", "Former smoker"],
        chiefComplaint: "Severe chest pain for 2 hours"
      },
      scenario: {
        initialPresentation: "Patient arrives via ambulance reporting crushing chest pain that started 2 hours ago while mowing the lawn. Pain is 9/10, radiates to left arm and jaw, associated with shortness of breath and diaphoresis.",
        vitalSigns: {
          bloodPressure: { systolic: 90, diastolic: 60 },
          heartRate: 110,
          respiratoryRate: 22,
          temperature: 37.1,
          oxygenSaturation: 94,
          painLevel: 9
        },
        physicalExam: {
          general: "Diaphoretic, anxious, in moderate distress",
          cardiovascular: "Tachycardic, no murmurs, S3 gallop present",
          respiratory: "Bilateral crackles at bases",
          abdominal: "Soft, non-tender",
          neurological: "Alert and oriented x3",
          musculoskeletal: "No obvious deformities",
          skin: "Pale, cool, diaphoretic"
        },
        labResults: [
          { test: "Troponin I", value: "12.5", unit: "ng/mL", referenceRange: "<0.04", isAbnormal: true },
          { test: "CK-MB", value: "45", unit: "ng/mL", referenceRange: "<3.6", isAbnormal: true },
          { test: "BNP", value: "890", unit: "pg/mL", referenceRange: "<100", isAbnormal: true }
        ],
        progressNotes: [
          {
            timestamp: now,
            note: "Patient arrived with classic STEMI presentation. ECG shows ST elevation in leads II, III, aVF. Cardiology consulted for emergent PCI.",
            author: "Dr. Sarah Chen",
            type: 'assessment'
          }
        ]
      }
    },
    {
      id: uuidv4(),
      title: "Pediatric Asthma Exacerbation",
      description: "An 8-year-old child presents with acute asthma exacerbation triggered by viral upper respiratory infection. Focus on pediatric assessment techniques, medication dosing, and family communication.",
      difficulty: 'beginner',
      duration: 30,
      createdBy: 'demo-user',
      createdAt: yesterday,
      updatedAt: yesterday,
      tags: ['pediatrics', 'respiratory', 'asthma', 'emergency'],
      isPublic: true,
      learningObjectives: [
        "Assess severity of pediatric asthma exacerbation",
        "Calculate age-appropriate medication dosages",
        "Demonstrate proper inhaler technique education",
        "Communicate effectively with pediatric patients and families"
      ],
      patientInfo: {
        name: "Emma Martinez",
        age: 8,
        gender: 'female',
        weight: 28,
        height: 125,
        allergies: ["Environmental allergens (pollen, dust)"],
        medications: ["Albuterol MDI PRN", "Flovent 44mcg BID"],
        medicalHistory: ["Asthma since age 4", "Eczema"],
        chiefComplaint: "Difficulty breathing and cough for 2 days"
      },
      scenario: {
        initialPresentation: "8-year-old female brought by mother with worsening cough, wheezing, and shortness of breath over past 2 days. Started with cold symptoms, now using rescue inhaler every 2 hours with minimal relief.",
        vitalSigns: {
          bloodPressure: { systolic: 95, diastolic: 60 },
          heartRate: 125,
          respiratoryRate: 32,
          temperature: 37.8,
          oxygenSaturation: 91,
          painLevel: 0
        },
        physicalExam: {
          general: "Anxious, mild respiratory distress, able to speak in short sentences",
          cardiovascular: "Tachycardic, regular rhythm",
          respiratory: "Expiratory wheeze, decreased air entry bilaterally, accessory muscle use",
          abdominal: "Soft, non-tender",
          neurological: "Alert, cooperative",
          musculoskeletal: "Normal",
          skin: "Slight cyanosis around lips"
        },
        progressNotes: [
          {
            timestamp: yesterday,
            note: "Moderate asthma exacerbation. Started on nebulizer treatments and oral corticosteroids. Mother educated on proper inhaler technique.",
            author: "Dr. Michael Rodriguez",
            type: 'assessment'
          }
        ]
      }
    },
    {
      id: uuidv4(),
      title: "Geriatric Fall Assessment and Hip Fracture",
      description: "An 82-year-old woman presents after a fall at home. This case addresses comprehensive geriatric assessment, fall risk factors, and management of suspected hip fracture in elderly patients.",
      difficulty: 'advanced',
      duration: 60,
      createdBy: 'demo-user',
      createdAt: lastWeek,
      updatedAt: lastWeek,
      tags: ['geriatrics', 'orthopedics', 'fall prevention', 'fracture'],
      isPublic: false,
      learningObjectives: [
        "Conduct comprehensive geriatric assessment",
        "Identify and address fall risk factors",
        "Recognize complications unique to elderly patients",
        "Develop appropriate care transitions and discharge planning"
      ],
      patientInfo: {
        name: "Dorothy Williams",
        age: 82,
        gender: 'female',
        weight: 58,
        height: 160,
        allergies: ["Codeine", "Latex"],
        medications: [
          "Amlodipine 5mg daily",
          "Metformin 500mg BID",
          "Calcium + Vitamin D",
          "Donepezil 10mg daily"
        ],
        medicalHistory: [
          "Hypertension",
          "Type 2 Diabetes",
          "Osteoporosis",
          "Mild cognitive impairment",
          "Previous fall 6 months ago"
        ],
        chiefComplaint: "Right hip pain after fall this morning"
      },
      scenario: {
        initialPresentation: "82-year-old female brought by daughter after falling in bathroom this morning. Patient reports slipping on wet floor, unable to bear weight on right leg. Daughter concerned about increasing confusion and mobility issues at home.",
        vitalSigns: {
          bloodPressure: { systolic: 165, diastolic: 88 },
          heartRate: 95,
          respiratoryRate: 18,
          temperature: 36.8,
          oxygenSaturation: 97,
          painLevel: 7
        },
        physicalExam: {
          general: "Elderly female in mild distress, lying supine, right leg shortened and externally rotated",
          cardiovascular: "Regular rhythm, no murmurs",
          respiratory: "Clear bilaterally",
          abdominal: "Soft, non-tender",
          neurological: "Alert but mild confusion, MMSE 24/30",
          musculoskeletal: "Right hip pain with movement, unable to bear weight, good peripheral pulses",
          skin: "Thin, bruising on right hip and arm"
        },
        imagingResults: [
          {
            type: "X-ray Hip",
            findings: "Displaced intracapsular fracture of right femoral neck",
            impression: "Right hip fracture requiring surgical intervention",
            date: lastWeek
          }
        ],
        progressNotes: [
          {
            timestamp: lastWeek,
            note: "Displaced hip fracture confirmed on imaging. Orthopedic surgery consulted. Started on DVT prophylaxis and pain management. Social work consulted for discharge planning given living situation concerns.",
            author: "Dr. Jennifer Park",
            type: 'assessment'
          }
        ]
      }
    }
  ];
};

/**
 * Initialize mock data in localStorage for testing
 */
export const initializeMockData = (): void => {
  // Only initialize if no cases exist
  const existingCases = localStorage.getItem('simcase_index');
  if (!existingCases || JSON.parse(existingCases).length === 0) {
    const mockCases = generateMockCases();
    // Import the storage functions to save mock data
    import('./caseStorage').then(({ saveCase }) => {
      mockCases.forEach(mockCase => {
        saveCase(mockCase);
      });
    });
  }
}; 