import Anthropic from '@anthropic-ai/sdk';
import { SimulationCase, AIGenerationRequest } from '@/types';
import { generateId } from '@/utils/helpers';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface CaseGenerationPrompt {
  caseType: string;
  specialty: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  additionalRequirements?: string;
}

export const generateCasePrompt = (prompt: CaseGenerationPrompt): string => {
  return `
You are an expert medical educator creating realistic healthcare simulation cases. Generate a comprehensive medical case simulation with the following specifications:

**Case Requirements:**
- Type: ${prompt.caseType}
- Medical Specialty: ${prompt.specialty}
- Difficulty Level: ${prompt.difficulty}
- Duration: ${prompt.duration} minutes
${prompt.additionalRequirements ? `- Additional Requirements: ${prompt.additionalRequirements}` : ''}

**Generate a complete case including:**

1. **Case Title and Description**: A clear, educational title and comprehensive description
2. **Patient Information**: Realistic demographics, medical history, current medications, allergies
3. **Chief Complaint**: Primary reason for seeking medical care
4. **Initial Presentation**: How the patient presents (symptoms, timeline, context)
5. **Vital Signs**: Realistic vital signs appropriate for the condition
6. **Physical Examination**: Systematic findings organized by body systems
7. **Learning Objectives**: 3-5 specific, measurable learning outcomes
8. **Recommended Lab/Imaging**: Appropriate diagnostic tests for the case
9. **Case Progression**: How the case might evolve over time

**Format Requirements:**
Please format your response as a JSON object with the following structure:

{
  "title": "Case Title",
  "description": "Comprehensive case description",
  "patientInfo": {
    "name": "Patient Name",
    "age": 0,
    "gender": "male|female|other",
    "weight": 0,
    "height": 0,
    "allergies": ["allergy1", "allergy2"],
    "medications": ["medication1", "medication2"],
    "medicalHistory": ["condition1", "condition2"],
    "chiefComplaint": "Primary complaint"
  },
  "scenario": {
    "initialPresentation": "How patient presents",
    "vitalSigns": {
      "bloodPressure": {"systolic": 0, "diastolic": 0},
      "heartRate": 0,
      "respiratoryRate": 0,
      "temperature": 0,
      "oxygenSaturation": 0,
      "painLevel": 0
    },
    "physicalExam": {
      "general": "General appearance",
      "cardiovascular": "Heart examination",
      "respiratory": "Lung examination",
      "abdominal": "Abdominal examination",
      "neurological": "Neurological examination",
      "musculoskeletal": "MSK examination",
      "skin": "Skin examination"
    },
    "labResults": [
      {
        "test": "Test Name",
        "value": "Result",
        "unit": "Unit",
        "referenceRange": "Normal Range",
        "isAbnormal": false
      }
    ],
    "progressNotes": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "note": "Progress note",
        "author": "Provider",
        "type": "assessment"
      }
    ]
  },
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "difficulty": "${prompt.difficulty}",
  "duration": ${prompt.duration},
  "tags": ["tag1", "tag2", "tag3"]
}

Make sure all values are realistic and appropriate for the medical condition. The case should be educationally valuable and clinically accurate.
`;
};

export const generateSimulationCase = async (
  request: AIGenerationRequest
): Promise<SimulationCase> => {
  try {
    const prompt = generateCasePrompt({
      caseType: request.caseType,
      specialty: request.specialty,
      difficulty: request.difficulty,
      duration: 60, // Default duration
      additionalRequirements: request.prompt,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      throw new Error('Invalid response from Claude API');
    }

    // Parse the JSON response
    const caseData = JSON.parse(response.content[0].text);

    // Create a complete SimulationCase object
    const simulationCase: SimulationCase = {
      id: generateId(),
      title: caseData.title,
      description: caseData.description,
      patientInfo: {
        ...caseData.patientInfo,
        allergies: caseData.patientInfo.allergies || [],
        medications: caseData.patientInfo.medications || [],
        medicalHistory: caseData.patientInfo.medicalHistory || [],
      },
      scenario: {
        ...caseData.scenario,
        labResults: caseData.scenario.labResults || [],
        imagingResults: caseData.scenario.imagingResults || [],
        progressNotes: caseData.scenario.progressNotes.map((note: { timestamp: string; [key: string]: unknown }) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        })) || [],
      },
      learningObjectives: caseData.learningObjectives || [],
      difficulty: caseData.difficulty,
      duration: caseData.duration,
      createdBy: 'ai-generated',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: caseData.tags || [],
      isPublic: false,
    };

    return simulationCase;
  } catch (error) {
    console.error('Error generating case with Claude:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate case: ${error.message}`
        : 'Failed to generate case with AI'
    );
  }
};

// Helper function to enhance existing cases with AI
export const enhanceCaseWithAI = async (
  partialCase: Partial<SimulationCase>,
  enhancementType: 'vitals' | 'physical-exam' | 'labs' | 'progression'
): Promise<Partial<SimulationCase>> => {
  try {
    const enhancementPrompts = {
      vitals: `Given this patient case, generate realistic vital signs that match the clinical presentation:`,
      'physical-exam': `Generate detailed physical examination findings for this patient case:`,
      labs: `Suggest appropriate laboratory tests and realistic results for this case:`,
      progression: `Create progression notes showing how this case might evolve over time:`,
    };

    const prompt = `
${enhancementPrompts[enhancementType]}

Case: ${partialCase.title}
Patient: ${partialCase.patientInfo?.name}, ${partialCase.patientInfo?.age} years old
Chief Complaint: ${partialCase.patientInfo?.chiefComplaint}
Description: ${partialCase.description}

Please provide your response in JSON format that can be merged with the existing case data.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      throw new Error('Invalid response from Claude API');
    }

    const enhancementData = JSON.parse(response.content[0].text);
    return enhancementData;
  } catch (error) {
    console.error('Error enhancing case with Claude:', error);
    throw new Error('Failed to enhance case with AI');
  }
};

// Validate API key
export const validateAnthropicApiKey = (): boolean => {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}; 