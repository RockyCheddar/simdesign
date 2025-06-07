import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DocumentProcessingData {
  originalText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  caseId: string;
}

interface DocumentStore {
  // State
  isProcessing: boolean;
  error: string | null;
  processedData: DocumentProcessingData | null;
  
  // Actions
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  setProcessedData: (data: DocumentProcessingData) => void;
  clearProcessedData: () => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      // Initial state
      isProcessing: false,
      error: null,
      processedData: null,
      
      // Actions
      setProcessing: (isProcessing) => set({ isProcessing, error: null }),
      
      setError: (error) => set({ error, isProcessing: false }),
      
      setProcessedData: (data) => set({ 
        processedData: data, 
        isProcessing: false, 
        error: null 
      }),
      
      clearProcessedData: () => set({ processedData: null }),
      
      reset: () => set({ 
        isProcessing: false, 
        error: null, 
        processedData: null 
      }),
    }),
    {
      name: 'document-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist processedData, not the transient states
      partialize: (state) => ({ processedData: state.processedData }),
    }
  )
); 