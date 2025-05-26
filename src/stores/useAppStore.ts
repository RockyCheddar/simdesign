import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppState, SimulationCase, User, CaseFormData, Tab } from '@/types';

interface AppStore extends AppState {
  // Auth actions
  setUser: (user: User | null) => void;
  logout: () => void;

  // Case actions
  setCases: (cases: SimulationCase[]) => void;
  addCase: (case_: SimulationCase) => void;
  updateCase: (id: string, updates: Partial<SimulationCase>) => void;
  deleteCase: (id: string) => void;
  setCurrentCase: (case_: SimulationCase | null) => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Tab management
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

interface CaseFormStore {
  formData: CaseFormData;
  updateFormData: (updates: Partial<CaseFormData>) => void;
  resetForm: () => void;
  isGenerating: boolean;
  setGenerating: (generating: boolean) => void;
}

const initialFormData: CaseFormData = {
  step: 1,
  patientInfo: {},
  scenario: {},
  caseDetails: {
    title: '',
    description: '',
    learningObjectives: [],
    difficulty: 'beginner',
    duration: 30,
    tags: [],
    isPublic: false,
  },
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        cases: [],
        currentCase: null,
        isLoading: false,
        error: null,
        activeTab: 'overview',

        // Auth actions
        setUser: (user) => set({ user }),
        logout: () => set({ user: null, cases: [], currentCase: null }),

        // Case actions
        setCases: (cases) => set({ cases }),
        addCase: (case_) => set((state) => ({ cases: [...state.cases, case_] })),
        updateCase: (id, updates) =>
          set((state) => ({
            cases: state.cases.map((case_) =>
              case_.id === id ? { ...case_, ...updates } : case_
            ),
            currentCase:
              state.currentCase?.id === id
                ? { ...state.currentCase, ...updates }
                : state.currentCase,
          })),
        deleteCase: (id) =>
          set((state) => ({
            cases: state.cases.filter((case_) => case_.id !== id),
            currentCase:
              state.currentCase?.id === id ? null : state.currentCase,
          })),
        setCurrentCase: (case_) => set({ currentCase: case_ }),

        // UI state
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        setActiveTab: (activeTab) => set({ activeTab }),
      }),
      {
        name: 'healthcare-sim-storage',
        partialize: (state) => ({
          user: state.user,
          cases: state.cases,
        }),
      }
    )
  )
);

export const useCaseFormStore = create<CaseFormStore>()(
  devtools((set) => ({
    formData: initialFormData,
    isGenerating: false,

    updateFormData: (updates) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...updates,
          patientInfo: {
            ...state.formData.patientInfo,
            ...updates.patientInfo,
          },
          scenario: {
            ...state.formData.scenario,
            ...updates.scenario,
          },
          caseDetails: {
            ...state.formData.caseDetails,
            ...updates.caseDetails,
          },
        },
      })),

    resetForm: () => set({ formData: initialFormData }),
    setGenerating: (isGenerating) => set({ isGenerating }),
  }))
); 