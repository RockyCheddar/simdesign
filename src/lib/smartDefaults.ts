import { 
  LearningContext, 
  ParameterAnswers, 
  SmartDefaults 
} from '@/types/caseCreation';

// Smart default logic implementation
export const determineSmartDefaults = (
  learningContext: Partial<LearningContext>,
  parameterAnswers: ParameterAnswers
): SmartDefaults => {
  const { experienceLevel, duration, clinicalDomain } = learningContext;
  
  // Get complexity from parameter answers
  const complexityAnswer = parameterAnswers['complexity'] as string;
  const isHighComplexity = complexityAnswer?.toLowerCase().includes('high') || 
                          complexityAnswer?.toLowerCase().includes('complex');
  
  // Get case type from parameter answers
  const caseType = parameterAnswers['case_type'] as string;
  const isICUCase = caseType?.toLowerCase().includes('icu') || 
                   caseType?.toLowerCase().includes('emergency') ||
                   clinicalDomain?.toLowerCase().includes('emergency') ||
                   clinicalDomain?.toLowerCase().includes('critical');
  
  const isProceduralCase = caseType?.toLowerCase().includes('procedural') ||
                          caseType?.toLowerCase().includes('skills') ||
                          caseType?.toLowerCase().includes('procedure');

  const smartDefaults: SmartDefaults = {
    expanded: [],
    minimal: [],
    acuteCare: [],
    procedural: []
  };

  // Advanced learners OR duration >45min OR high complexity
  if (experienceLevel === 'advanced' || (duration && duration > 45) || isHighComplexity) {
    smartDefaults.expanded = [
      'detailedSocialHistory',
      'pastMedicalHistory', 
      'laboratoryResults',
      'basicImaging',
      'medicationDetails'
    ];
  }

  // Novice learners OR duration <30min OR low complexity
  if (experienceLevel === 'novice' || (duration && duration < 30)) {
    smartDefaults.minimal = [
      // Only core always-generated content
    ];
  }

  // ICU/Emergency cases
  if (isICUCase) {
    smartDefaults.acuteCare = [
      'laboratoryResults',
      'imagingStudies',
      'trendingData'
    ];
  }

  // Procedural/Skills cases
  if (isProceduralCase) {
    smartDefaults.procedural = [
      'equipmentList',
      'stepByStepGuide',
      'commonMistakes'
    ];
  }

  return smartDefaults;
}; 