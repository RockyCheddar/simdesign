import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  CaseCreationFormData, 
  LearningContext, 
  RefinedObjectives, 
  ParameterQuestion,
  CasePreview,
  GenerationProgress,
  FORM_STEPS
} from '@/types/caseCreation';

interface CaseCreationStore extends CaseCreationFormData {
  // Navigation actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Data update actions
  updateLearningContext: (data: Partial<LearningContext>) => void;
  updateRefinedObjectives: (data: Partial<RefinedObjectives>) => void;
  updateParameterQuestions: (questions: ParameterQuestion[]) => void;
  updateParameterAnswer: (questionId: string, answer: string | number | boolean | string[]) => void;
  updateCasePreview: (data: Partial<CasePreview>) => void;
  updateGenerationProgress: (data: Partial<GenerationProgress>) => void;
  
  // AI generation actions
  generateParameterQuestions: () => Promise<void>;
  
  // Validation actions
  validateCurrentStep: () => boolean;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // Reset actions
  resetForm: () => void;
  resetToStep: (step: number) => void;
}

const initialState: CaseCreationFormData = {
  currentStep: 1,
  learningContext: {},
  refinedObjectives: {},
  parameterQuestions: [],
  parameterAnswers: {},
  casePreview: {},
  generationProgress: {
    status: 'idle',
    currentPhase: '',
    progress: 0
  },
  isValid: false,
  errors: {}
};

export const useCaseCreationStore = create<CaseCreationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Navigation actions
    nextStep: () => {
      const { currentStep, validateCurrentStep } = get();
      if (validateCurrentStep() && currentStep < FORM_STEPS.length) {
        set({ currentStep: currentStep + 1 });
      }
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 1) {
        set({ currentStep: currentStep - 1 });
      }
    },

    goToStep: (step: number) => {
      if (step >= 1 && step <= FORM_STEPS.length) {
        set({ currentStep: step });
      }
    },

    // Data update actions
    updateLearningContext: (data: Partial<LearningContext>) => {
      set(state => ({
        learningContext: { ...state.learningContext, ...data },
        errors: { ...state.errors }
      }));
    },

    updateRefinedObjectives: (data: Partial<RefinedObjectives>) => {
      set(state => ({
        refinedObjectives: { ...state.refinedObjectives, ...data }
      }));
    },

    updateParameterQuestions: (questions: ParameterQuestion[]) => {
      set({ parameterQuestions: questions });
    },

    updateParameterAnswer: (questionId: string, answer: string | number | boolean | string[]) => {
      set(state => ({
        parameterAnswers: { ...state.parameterAnswers, [questionId]: answer }
      }));
    },

    updateCasePreview: (data: Partial<CasePreview>) => {
      set(state => ({
        casePreview: { ...state.casePreview, ...data }
      }));
    },

    updateGenerationProgress: (data: Partial<GenerationProgress>) => {
      set(state => ({
        generationProgress: { ...state.generationProgress, ...data }
      }));
    },

    // AI generation actions
    generateParameterQuestions: async () => {
      const { learningContext, refinedObjectives } = get();
      
      try {
        set(state => ({
          generationProgress: { ...state.generationProgress, status: 'generating', currentPhase: 'Generating parameter questions...' }
        }));

        // Call the API endpoint
        const response = await fetch('/api/ai/parameter-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learningContext,
            refinedObjectives: refinedObjectives.selectedObjectives || []
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to generate questions');
        }

        const { questions: aiQuestions } = await response.json();

        // Convert AI questions to ParameterQuestion format
        const questions: ParameterQuestion[] = aiQuestions.map((q: any) => ({
          id: q.id,
          category: q.category,
          question: q.question,
          type: 'select' as const,
          options: q.options,
          required: true
        }));

        set(state => ({
          parameterQuestions: questions,
          generationProgress: { ...state.generationProgress, status: 'completed', currentPhase: 'Questions generated successfully' }
        }));
      } catch (error) {
        console.error('Error generating parameter questions:', error);
        set(state => ({
          generationProgress: { 
            ...state.generationProgress, 
            status: 'error', 
            currentPhase: 'Failed to generate questions',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }
    },

    // Validation actions
    validateCurrentStep: () => {
      const state = get();
      const { currentStep, learningContext, refinedObjectives, parameterQuestions, parameterAnswers } = state;
      
      let isValid = true;
      const errors: Record<string, string> = {};

      switch (currentStep) {
        case 1: // Learning Context & Objectives
          if (!learningContext.targetLearners) {
            errors.targetLearners = 'Target learners is required';
            isValid = false;
          }
          if (!learningContext.experienceLevel) {
            errors.experienceLevel = 'Experience level is required';
            isValid = false;
          }
          if (!learningContext.clinicalDomain) {
            errors.clinicalDomain = 'Clinical domain is required';
            isValid = false;
          }
          if (!learningContext.duration || learningContext.duration < 15) {
            errors.duration = 'Duration is required';
            isValid = false;
          }
          if (!learningContext.participantCount || learningContext.participantCount < 1) {
            errors.participantCount = 'At least 1 participant is required';
            isValid = false;
          }
          if (!learningContext.learningObjectives?.length) {
            errors.learningObjectives = 'At least one learning objective is required';
            isValid = false;
          }
          break;

        case 2: // AI Objectives Refinement
          if (!refinedObjectives.selectedObjectives?.length) {
            errors.selectedObjectives = 'Please select at least one learning objective';
            isValid = false;
          }
          break;

        case 3: // Parameter Questions
          const requiredQuestions = parameterQuestions.filter(q => q.required);
          for (const question of requiredQuestions) {
            if (!parameterAnswers[question.id]) {
              errors[`param_${question.id}`] = `This question is required`;
              isValid = false;
            }
          }
          break;

        case 4: // Case Preview
          // Always valid - just review step
          break;

        case 5: // Case Generation
          // Always valid - just generation step
          break;
      }

      set({ isValid, errors });
      return isValid;
    },

    setError: (field: string, error: string) => {
      set(state => ({
        errors: { ...state.errors, [field]: error },
        isValid: false
      }));
    },

    clearError: (field: string) => {
      set(state => {
        const newErrors = { ...state.errors };
        delete newErrors[field];
        return { errors: newErrors };
      });
    },

    clearAllErrors: () => {
      set({ errors: {}, isValid: true });
    },

    // Reset actions
    resetForm: () => {
      set(initialState);
    },

    resetToStep: (step: number) => {
      set(state => ({
        ...initialState,
        currentStep: step,
        learningContext: step > 1 ? state.learningContext : {},
        refinedObjectives: step > 2 ? state.refinedObjectives : {},
        parameterQuestions: step > 3 ? state.parameterQuestions : [],
        parameterAnswers: step > 3 ? state.parameterAnswers : {},
      }));
    }
  }))
);

// Selectors for easier access to specific parts of the state
export const useCurrentStep = () => useCaseCreationStore(state => state.currentStep);
export const useLearningContext = () => useCaseCreationStore(state => state.learningContext);
export const useRefinedObjectives = () => useCaseCreationStore(state => state.refinedObjectives);
export const useParameterQuestions = () => useCaseCreationStore(state => state.parameterQuestions);
export const useParameterAnswers = () => useCaseCreationStore(state => state.parameterAnswers);
export const useCasePreview = () => useCaseCreationStore(state => state.casePreview);
export const useGenerationProgress = () => useCaseCreationStore(state => state.generationProgress);
export const useFormErrors = () => useCaseCreationStore(state => state.errors);
export const useFormValid = () => useCaseCreationStore(state => state.isValid); 