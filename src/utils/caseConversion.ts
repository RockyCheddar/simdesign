import { GeneratedCaseData, LearningContext } from '@/types/caseCreation';
import { SimulationCase } from '@/types';
import { saveCase } from './caseStorage';
import { generateId } from './helpers';

/**
 * Convert AI-generated case data to SimulationCase format and save it
 */
export const convertAndSaveGeneratedCase = (
  generatedCase: GeneratedCaseData,
  learningContext: Partial<LearningContext>
): SimulationCase => {
  console.log('Converting generated case to SimulationCase format...');
  console.log('Generated case data:', generatedCase);
  console.log('Learning context:', learningContext);
  
  // Create a unique ID for the case
  const caseId = generateId();
  console.log('Generated case ID:', caseId);
  
  // Convert to SimulationCase format
  const simulationCase: SimulationCase = {
    id: caseId,
    title: generatedCase.overview?.caseTitle || 'Generated Case',
    description: generatedCase.overview?.caseSummary || 'AI-generated simulation case',
    
    patientInfo: {
      name: generatedCase.patient?.demographics?.fullName || generatedCase.overview?.patientBasics?.name || 'Patient Name',
      age: generatedCase.patient?.demographics?.age || generatedCase.overview?.patientBasics?.age || 0,
      gender: generatedCase.patient?.demographics?.gender || generatedCase.overview?.patientBasics?.gender || 'unknown',
      weight: generatedCase.patient?.demographics?.weight || 70,
      height: generatedCase.patient?.demographics?.height || 170,
      allergies: [], // Will be populated from generated data if available
      medications: generatedCase.patient?.currentMedications?.map(med => med.name) || [],
      medicalHistory: [], // Will be populated from generated data if available
      chiefComplaint: generatedCase.patient?.chiefComplaint || 'Chief complaint not specified'
    },
    
    scenario: {
      initialPresentation: generatedCase.patient?.historyPresentIllness?.timeline || 
                          generatedCase.patient?.chiefComplaint || '',
      vitalSigns: {
        bloodPressure: {
          systolic: generatedCase.presentation?.vitalSigns?.bloodPressure?.systolic || 120,
          diastolic: generatedCase.presentation?.vitalSigns?.bloodPressure?.diastolic || 80
        },
        heartRate: generatedCase.presentation?.vitalSigns?.heartRate?.value || 80,
        respiratoryRate: generatedCase.presentation?.vitalSigns?.respiratoryRate?.value || 16,
        temperature: generatedCase.presentation?.vitalSigns?.temperature?.value || 98.6,
        oxygenSaturation: generatedCase.presentation?.vitalSigns?.oxygenSaturation?.value || 98,
        painLevel: 0 // Default, can be extracted from generated data if available
      },
      physicalExam: {
        general: generatedCase.presentation?.physicalExamFindings?.general || 'No acute distress',
        cardiovascular: 'Regular rate and rhythm', // Default
        respiratory: 'Clear to auscultation bilaterally', // Default
        abdominal: 'Soft, non-tender', // Default
        neurological: 'Alert and oriented', // Default
        musculoskeletal: 'Normal range of motion', // Default
        skin: 'Warm, dry, intact' // Default
      },
      labResults: [], // Can be populated from generated data if available
      imagingResults: [], // Can be populated from generated data if available
      progressNotes: [
        {
          timestamp: new Date(),
          note: generatedCase.overview?.caseSummary || 'Initial assessment completed',
          author: 'AI Generated',
          type: 'assessment'
        }
      ]
    },
    
    learningObjectives: generatedCase.overview?.learningObjectives || [],
    difficulty: learningContext?.experienceLevel === 'novice' ? 'beginner' :
               learningContext?.experienceLevel === 'advanced' ? 'advanced' : 'intermediate',
    duration: learningContext?.duration || 60,
    createdBy: 'ai-generated',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [
      learningContext?.clinicalDomain || 'General',
      'AI Generated',
      generatedCase.overview?.clinicalSetting?.location || 'Clinical'
    ].filter(Boolean),
    isPublic: false
  };
  
  console.log('Converted SimulationCase:', simulationCase);
  
  // Save to localStorage
  const saved = saveCase(simulationCase);
  console.log('Case save result:', saved);
  
  if (!saved) {
    throw new Error('Failed to save case to storage');
  }
  
  console.log('Case successfully saved to localStorage with ID:', simulationCase.id);
  return simulationCase;
};

/**
 * Get a more detailed case title based on generated content
 */
export const generateCaseTitle = (generatedCase: GeneratedCaseData): string => {
  const patientAge = generatedCase.patient?.demographics?.age;
  const patientGender = generatedCase.patient?.demographics?.gender;
  const chiefComplaint = generatedCase.patient?.chiefComplaint;
  
  if (patientAge && patientGender && chiefComplaint) {
    return `${patientAge}yo ${patientGender} with ${chiefComplaint}`;
  }
  
  return generatedCase.overview?.caseTitle || 'Generated Simulation Case';
};

/**
 * Extract tags from generated case content
 */
export const extractCaseTags = (
  generatedCase: GeneratedCaseData, 
  learningContext: Partial<LearningContext>
): string[] => {
  const tags: string[] = [];
  
  // Add clinical domain
  if (learningContext?.clinicalDomain) {
    tags.push(learningContext.clinicalDomain);
  }
  
  // Add location
  const location = generatedCase.overview?.clinicalSetting?.location;
  if (location) {
    tags.push(location);
  }
  
  // Add acuity level
  if (generatedCase.overview?.clinicalSetting?.acuity) {
    tags.push(`${generatedCase.overview.clinicalSetting.acuity} acuity`);
  }
  
  // Add patient demographics
  if (generatedCase.patient?.demographics?.age) {
    const age = generatedCase.patient.demographics.age;
    if (age < 18) tags.push('Pediatric');
    else if (age > 65) tags.push('Geriatric');
    else tags.push('Adult');
  }
  
  // Always add AI Generated tag
  tags.push('AI Generated');
  
  return [...new Set(tags)]; // Remove duplicates
}; 