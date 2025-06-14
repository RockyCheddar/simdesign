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
  generateComprehensiveCase: () => Promise<void>;
  
  // Validation actions
  validateCurrentStep: () => boolean;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // Reset actions
  resetForm: () => void;
  resetToStep: (step: number) => void;
  
  // Saved case tracking
  savedCaseId: string | null;
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
  generatedCase: undefined,
  isValid: false,
  errors: {}
};

const initialStoreState = {
  ...initialState,
  savedCaseId: null as string | null
};

export const useCaseCreationStore = create<CaseCreationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialStoreState,

    // Navigation actions
    nextStep: () => {
      const { currentStep, validateCurrentStep } = get();
      if (validateCurrentStep() && currentStep < FORM_STEPS.length) {
        const newStep = currentStep + 1;
        
        // Reset generation progress when navigating to step 5 (Case Generation)
        if (newStep === 5) {
          console.log('NextStep: Moving to Case Generation step - resetting generation progress to idle');
          set({ 
            currentStep: newStep,
            generationProgress: {
              status: 'idle',
              currentPhase: '',
              progress: 0
            },
            generatedCase: undefined,
            savedCaseId: null
          });
        } else {
          set({ currentStep: newStep });
        }
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
        console.log('=== NAVIGATING TO STEP ===', step);
        
        // Reset generation progress when navigating to step 5 (Case Generation)
        if (step === 5) {
          console.log('Navigating to Case Generation step - resetting generation progress to idle');
          set({ 
            currentStep: step,
            generationProgress: {
              status: 'idle',
              currentPhase: '',
              progress: 0
            },
            generatedCase: undefined,
            savedCaseId: null
          });
        } else {
          set({ currentStep: step });
        }
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
        const questions: ParameterQuestion[] = aiQuestions.map((q: {
          id: string;
          category: string;
          question: string;
          options: string[];
          whyThisMatters?: string;
          focusArea?: string;
        }) => ({
          id: q.id,
          category: q.category,
          question: q.question,
          type: 'select' as const,
          options: q.options,
          required: true,
          whyThisMatters: q.whyThisMatters,
          focusArea: q.focusArea
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

    generateComprehensiveCase: async () => {
      console.log('=== GENERATE COMPREHENSIVE CASE CALLED ===');
      const { learningContext, refinedObjectives, parameterAnswers } = get();
      
      console.log('Current state data:');
      console.log('- learningContext:', learningContext);
      console.log('- refinedObjectives:', refinedObjectives);
      console.log('- parameterAnswers:', parameterAnswers);
      
      try {
        console.log('Starting case generation process...');
        // Reset and start generation
        set(() => ({
          generationProgress: { 
            status: 'generating', 
            currentPhase: 'Analyzing learning context...', 
            progress: 0,
            estimatedTimeRemaining: 90
          }
        }));

        console.log('Generation progress set to generating...');

        // Phase 1: Analyzing context
        await new Promise(resolve => setTimeout(resolve, 1000));
        set(state => ({
          generationProgress: { 
            ...state.generationProgress, 
            currentPhase: 'Creating patient profile...', 
            progress: 20,
            estimatedTimeRemaining: 70
          }
        }));

        // Phase 2: Call the API
        const response = await fetch('/api/ai/generate-comprehensive-case', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learningContext,
            refinedObjectives: refinedObjectives.selectedObjectives || [],
            parameterAnswers
          }),
        });

        // Phase 3: Processing response
        set(state => ({
          generationProgress: { 
            ...state.generationProgress, 
            currentPhase: 'Generating clinical scenario...', 
            progress: 60,
            estimatedTimeRemaining: 30
          }
        }));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to generate case');
        }

        const result = await response.json();

        // Phase 4: Finalizing
        set(state => ({
          generationProgress: { 
            ...state.generationProgress, 
            currentPhase: 'Finalizing case materials...', 
            progress: 90,
            estimatedTimeRemaining: 5
          }
        }));

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Complete generation
        set(() => ({
          generatedCase: result.data,
          generationProgress: { 
            status: 'completed', 
            currentPhase: 'Case generated successfully!', 
            progress: 100,
            estimatedTimeRemaining: 0
          }
        }));

        // Save the generated case to localStorage for dashboard access
        try {
          const { convertAndSaveGeneratedCase } = await import('@/utils/caseConversion');
          const { toast } = await import('react-hot-toast');
          const { learningContext } = get();
          
          console.log('=== CASE SAVING DEBUG ===');
          console.log('Attempting to save case with data:', result.data);
          console.log('Learning context:', learningContext);
          
          // Validate that we have the required data before attempting to save
          if (!result.data || !result.data.overview) {
            throw new Error('Invalid case data: missing overview section');
          }
          
          if (!result.data.overview.caseTitle) {
            throw new Error('Invalid case data: missing case title');
          }
          
          const savedCase = convertAndSaveGeneratedCase(result.data, learningContext);
          console.log('Case saved to dashboard successfully:', savedCase.id);
          console.log('Saved case details:', {
            id: savedCase.id,
            title: savedCase.title,
            createdAt: savedCase.createdAt,
            createdBy: savedCase.createdBy
          });
          
          // Verify the case was actually saved by trying to load it
          const { loadCase } = await import('@/utils/caseStorage');
          const verifyCase = loadCase(savedCase.id);
          if (!verifyCase) {
            throw new Error(`Case verification failed: could not load case ${savedCase.id} after saving`);
          }
          console.log('Case verification successful:', verifyCase.id);
          
          // Store the saved case ID for navigation - this is critical!
          console.log('Setting savedCaseId in store:', savedCase.id);
          set(state => ({
            ...state,
            savedCaseId: savedCase.id
          }));
          
          // Verify the store was updated
          const updatedState = get();
          console.log('Store updated with savedCaseId:', updatedState.savedCaseId);
          
          if (updatedState.savedCaseId !== savedCase.id) {
            console.error('ERROR: savedCaseId was not properly set in store!');
            throw new Error('Failed to update store with saved case ID');
          }
          
          toast.success(`Case "${savedCase.title}" saved to dashboard!`, {
            duration: 4000,
            icon: '💾'
          });

          // Trigger storage events to notify the dashboard to refresh
          console.log('Dispatching storage events...');
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'simcase_index',
            newValue: localStorage.getItem('simcase_index'),
            storageArea: localStorage
          }));
          
          // Also dispatch a custom event as a fallback
          window.dispatchEvent(new CustomEvent('caseAdded', {
            detail: { caseId: savedCase.id }
          }));
          
          console.log('=== CASE SAVING COMPLETE ===');
          
        } catch (saveError) {
          console.error('=== CASE SAVING ERROR ===');
          console.error('Failed to save case to dashboard:', saveError);
          console.error('Error details:', saveError);
          console.error('Stack trace:', saveError instanceof Error ? saveError.stack : 'No stack trace');
          
          const { toast } = await import('react-hot-toast');
          toast.error(`Failed to save case: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`, {
            duration: 6000
          });
          
          // Set an error state but don't fail the entire generation
          set(state => ({
            generationProgress: { 
              ...state.generationProgress, 
              error: `Case generated but save failed: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`
            }
          }));
        }

      } catch (error) {
        console.error('Error generating comprehensive case:', error);
        set(() => ({
          generationProgress: { 
            status: 'error', 
            currentPhase: 'Failed to generate case',
            progress: 0,
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
      set(initialStoreState);
    },

    resetToStep: (step: number) => {
      set(state => ({
        ...initialStoreState,
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
export const useGeneratedCase = () => useCaseCreationStore(state => state.generatedCase);
export const useFormErrors = () => useCaseCreationStore(state => state.errors);
export const useFormValid = () => useCaseCreationStore(state => state.isValid);
export const useSavedCaseId = () => useCaseCreationStore(state => state.savedCaseId); 