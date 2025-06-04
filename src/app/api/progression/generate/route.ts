import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { ProgressionScenario, CreateProgressionFormData } from '@/types/progression';
import { GeneratedCaseData } from '@/types/caseCreation';
import fs from 'fs';
import path from 'path';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ProgressionGenerationRequest {
  formData: CreateProgressionFormData;
  caseData?: GeneratedCaseData;
}

/**
 * Generate progression scenario using AI
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const body: ProgressionGenerationRequest = await request.json();
    const { formData, caseData } = body;

    // Load the appropriate prompt from our AI_GENERATION_PROMPTS.md file
    const promptsPath = path.join(process.cwd(), 'AI_GENERATION_PROMPTS.md');
    const promptsContent = fs.readFileSync(promptsPath, 'utf-8');
    
    // Extract the appropriate prompt based on scenario type
    const prompt = extractPromptForType(promptsContent, formData.type);
    
    // Build the context data from the case
    const contextData = buildContextFromCase(caseData);
    
    // Create the full prompt with case data and parameters
    const fullPrompt = buildFullPrompt(prompt, formData, contextData);

    console.log('Generating progression scenario with AI...', {
      type: formData.type,
      title: formData.title,
      hasContextData: Boolean(contextData)
    });

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });

    const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    // Parse JSON response from AI
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const generatedScenario = JSON.parse(jsonMatch[1]);
    
    // Validate and enhance the generated scenario
    const progressionScenario: Omit<ProgressionScenario, 'id' | 'createdAt'> = {
      type: formData.type,
      title: generatedScenario.title || formData.title,
      description: generatedScenario.description || formData.description,
      isGenerated: true,
      timelineData: generatedScenario.timelineData || {
        duration: formData.parameters.timelineLength || 30,
        dataPoints: [],
        branches: []
      },
      parameters: {
        ...formData.parameters,
        ...generatedScenario.parameters
      },
      instructorNotes: generatedScenario.instructorNotes?.keyLearningPoints?.join('; ') || 
                      'AI-generated progression scenario'
    };

    console.log('Successfully generated progression scenario:', {
      type: progressionScenario.type,
      title: progressionScenario.title,
      dataPointsCount: progressionScenario.timelineData?.dataPoints?.length || 0,
      branchesCount: progressionScenario.timelineData?.branches?.length || 0
    });

    return NextResponse.json({ 
      success: true, 
      scenario: progressionScenario 
    });

  } catch (error) {
    console.error('Error generating progression scenario:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate progression scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Extract the appropriate prompt for the given scenario type
 */
function extractPromptForType(promptsContent: string, type: string): string {
  const prompts = {
    'conditional': 'Conditional Branching AI Generation Prompt',
    'time-based': 'Time-Based Evolution AI Generation Prompt', 
    'complication': 'Complication Scenario AI Generation Prompt'
  };

  const promptTitle = prompts[type as keyof typeof prompts];
  if (!promptTitle) {
    throw new Error(`Unknown scenario type: ${type}`);
  }

  // Extract the section for this prompt type
  const startPattern = new RegExp(`## ${promptTitle}`, 'g');
  const nextPromptPattern = /## \w+.*AI Generation Prompt/g;
  
  const startMatch = startPattern.exec(promptsContent);
  if (!startMatch) {
    throw new Error(`Prompt not found for type: ${type}`);
  }

  // Find the next prompt to determine where this one ends
  nextPromptPattern.lastIndex = startMatch.index + startMatch[0].length;
  const nextMatch = nextPromptPattern.exec(promptsContent);
  
  const endIndex = nextMatch ? nextMatch.index : promptsContent.length;
  const promptSection = promptsContent.slice(startMatch.index, endIndex);
  
  return promptSection;
}

/**
 * Build context data from the case for AI generation
 */
function buildContextFromCase(caseData?: GeneratedCaseData): Record<string, any> {
  if (!caseData) {
    return {
      fullCaseData: 'No case data provided',
      caseTitle: 'Generic Healthcare Scenario',
      patientDemographics: 'Adult patient',
      chiefComplaint: 'Medical concern',
      historyPresentIllness: 'Patient presenting with symptoms',
      currentMedications: 'None specified',
      baselineVitalSigns: 'Normal for age',
      physicalExamFindings: 'To be determined',
      labResults: 'Pending',
      clinicalSetting: 'Healthcare facility',
      learningObjectives: 'Educational progression scenario'
    };
  }

  return {
    fullCaseData: JSON.stringify(caseData, null, 2),
    caseTitle: caseData.overview?.caseTitle || 'Healthcare Simulation Case',
    patientDemographics: `${caseData.patient?.demographics?.age || 'Adult'} year old ${caseData.patient?.demographics?.gender || 'patient'}`,
    chiefComplaint: caseData.patient?.chiefComplaint || 'Medical concern',
    historyPresentIllness: caseData.patient?.historyPresentIllness?.timeline || 'Patient presenting with symptoms',
    currentMedications: caseData.patient?.currentMedications?.map(med => `${med.name} ${med.dose} ${med.frequency}`).join(', ') || 'None specified',
    baselineVitalSigns: caseData.presentation?.vitalSigns ? 
      `HR: ${caseData.presentation.vitalSigns.heartRate?.value}, BP: ${caseData.presentation.vitalSigns.bloodPressure?.systolic}/${caseData.presentation.vitalSigns.bloodPressure?.diastolic}, RR: ${caseData.presentation.vitalSigns.respiratoryRate?.value}, Temp: ${caseData.presentation.vitalSigns.temperature?.value}, SpO2: ${caseData.presentation.vitalSigns.oxygenSaturation?.value}%` :
      'Normal for age',
    physicalExamFindings: caseData.presentation?.physicalExamFindings ? 
      `General: ${caseData.presentation.physicalExamFindings.general}, Primary: ${caseData.presentation.physicalExamFindings.primarySystem}, Key findings: ${caseData.presentation.physicalExamFindings.keyAbnormalities?.join(', ')}` :
      'Normal physical examination',
    labResults: 'To be determined based on clinical presentation', 
    clinicalSetting: `${caseData.overview?.clinicalSetting?.location || 'Healthcare facility'} - ${caseData.overview?.clinicalSetting?.acuity || 'moderate'} acuity`,
    learningObjectives: caseData.overview?.learningObjectives?.join(', ') || 'Educational progression scenario',
    primaryCondition: caseData.patient?.chiefComplaint || 'Medical condition',
    currentTreatment: caseData.treatment?.treatmentPlan ? 
      `Immediate: ${caseData.treatment.treatmentPlan.immediate?.join(', ')}, Short-term: ${caseData.treatment.treatmentPlan.shortTerm?.join(', ')}` :
      'Standard care'
  };
}

/**
 * Build the full prompt with parameters substituted
 */
function buildFullPrompt(
  promptTemplate: string, 
  formData: CreateProgressionFormData, 
  contextData: Record<string, any>
): string {
  let prompt = promptTemplate;
  
  // Replace context placeholders
  Object.entries(contextData).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  // Replace parameter placeholders
  const paramReplacements = {
    duration: formData.parameters.duration || formData.parameters.timelineLength || 30,
    complexity: formData.parameters.complexity || 'moderate',
    learningFocusAreas: formData.parameters.learningFocus || [],
    decisionFocus: formData.parameters.decisionPoint || 'Clinical decision making',
    decisionWindow: formData.parameters.decisionWindow || 5,
    progressionRate: formData.parameters.progressionRate || 'moderate',
    evolutionFocus: formData.parameters.evolutionFocus || 'Natural disease progression',
    complicationType: formData.parameters.complicationType || 'medication_reaction',
    triggerTiming: formData.parameters.triggerTiming || 10,
    severityLevel: formData.parameters.severity || 'moderate'
  };
  
  Object.entries(paramReplacements).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
    prompt = prompt.replace(new RegExp(placeholder, 'g'), valueStr);
  });
  
  return prompt;
} 