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
      model: 'claude-sonnet-4-20250514',
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
      model: 'claude-sonnet-4-20250514',
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

export const generateParameterQuestions = async (
  learningContext: {
    targetLearners?: string;
    experienceLevel?: string;
    clinicalDomain?: string;
    duration?: number;
    participantCount?: number;
  },
  refinedObjectives: string[]
): Promise<Array<{
  id: string;
  category: 'clinical_scenario' | 'simulation_resources' | 'complexity_fidelity' | 'assessment_methods' | 'facilitation_style';
  question: string;
  options: string[];
}>> => {
  let response: any = null;
  try {
    const prompt = `Based on the learning context and refined objectives below, generate 6-8 critical parameter questions for creating a realistic healthcare simulation case that follows INACSL best practices.

Learning Context:
- Target Learners: ${learningContext.targetLearners || 'Not specified'}
- Experience Level: ${learningContext.experienceLevel || 'Not specified'}
- Clinical Domain: ${learningContext.clinicalDomain || 'Not specified'}
- Duration: ${learningContext.duration || 'Not specified'} minutes
- Participant Count: ${learningContext.participantCount || 'Not specified'}

Refined Learning Objectives:
${refinedObjectives.map(obj => `- ${obj}`).join('\n')}

Generate questions covering these domains:
1. Clinical Scenario Details (patient condition, age, presentation, backstory)
2. Simulation Resources (equipment type, fidelity level, props available)
3. Complexity & Realism (case severity, complications, time pressure)
4. Assessment Focus (formative vs summative, observation methods)
5. Facilitation Approach (instructor involvement, cues, team dynamics)

Each question should have 3-4 multiple choice options appropriate for the learner level and clinical domain. 

Return as JSON array with this exact structure:
[
  {
    "id": "unique_question_id",
    "category": "clinical_scenario|simulation_resources|complexity_fidelity|assessment_methods|facilitation_style",
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
  }
]

IMPORTANT:
- Return ONLY the JSON array, no markdown formatting or code blocks
- Ensure your response is valid JSON with no control characters
- Escape any quotes, newlines, or special characters within string values
- Do not include any text before or after the JSON array

Ensure questions are:
- Specific to the clinical domain and learner level
- Aligned with INACSL simulation standards
- Practical for case generation
- Cover all 5 domains with 1-2 questions each
- Have clear, distinct multiple choice options`;

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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

    // Parse the JSON response with robust extraction
    let responseText = response.content[0].text;
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    let jsonString = jsonMatch[0];
    
    // Clean control characters that can break JSON parsing
    jsonString = jsonString
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control chars except \t, \n, \r
      .replace(/\u0000/g, '') // Remove null characters
      .replace(/\u0008/g, '') // Remove backspace
      .replace(/\u000B/g, '') // Remove vertical tab
      .replace(/\u000C/g, '') // Remove form feed
      .replace(/\u000E/g, '') // Remove shift out
      .replace(/\u000F/g, ''); // Remove shift in

    // Try parsing with multiple fallback strategies
    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (firstError) {
      console.warn('First JSON parse attempt failed, trying with additional cleaning:', firstError);
      
      try {
        // Second attempt: more aggressive cleaning
        const cleanedString = jsonString
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, (match: string) => {
            // Keep valid JSON escape characters
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return ''; // Remove other control characters
          })
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        questions = JSON.parse(cleanedString);
      } catch (secondError) {
        console.warn('Second JSON parse attempt failed, trying manual reconstruction:', secondError);
        
        // Third attempt: try to manually fix common issues
        let manuallyFixed = jsonString
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Replace all control chars with spaces
          .replace(/\s+/g, ' ') // Collapse spaces
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .trim();
        
        questions = JSON.parse(manuallyFixed);
      }
    }
    
    // Validate the response structure
    if (!Array.isArray(questions)) {
      throw new Error('AI response is not an array of questions');
    }

    // Validate each question has required fields
    const validatedQuestions = questions.map((q, index) => {
      if (!q.id || !q.category || !q.question || !Array.isArray(q.options)) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options
      };
    });

    return validatedQuestions;
  } catch (error) {
    console.error('Error generating parameter questions with Claude:', error);
    console.error('Raw response:', response?.content?.[0]?.text || 'No response content');
    throw new Error(
      error instanceof Error 
        ? `Failed to generate parameter questions: ${error.message}`
        : 'Failed to generate parameter questions with AI'
    );
  }
}; 