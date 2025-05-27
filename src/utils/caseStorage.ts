import { SimulationCase } from '@/types';

// Storage keys
const CASE_STORAGE_PREFIX = 'simcase_';
const CASES_INDEX_KEY = 'simcase_index';

/**
 * Get all case IDs from the index
 */
const getCaseIndex = (): string[] => {
  try {
    const index = localStorage.getItem(CASES_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch (error) {
    console.error('Error loading case index:', error);
    return [];
  }
};

/**
 * Update the case index with a new case ID
 */
const updateCaseIndex = (caseId: string): void => {
  try {
    const index = getCaseIndex();
    if (!index.includes(caseId)) {
      index.push(caseId);
      localStorage.setItem(CASES_INDEX_KEY, JSON.stringify(index));
    }
  } catch (error) {
    console.error('Error updating case index:', error);
  }
};

/**
 * Remove a case ID from the index
 */
const removeCaseFromIndex = (caseId: string): void => {
  try {
    const index = getCaseIndex();
    const newIndex = index.filter(id => id !== caseId);
    localStorage.setItem(CASES_INDEX_KEY, JSON.stringify(newIndex));
  } catch (error) {
    console.error('Error removing case from index:', error);
  }
};

/**
 * Save a case to localStorage
 */
export const saveCase = (simulationCase: SimulationCase): boolean => {
  try {
    console.log('=== CASE STORAGE DEBUG ===');
    console.log('Saving case to localStorage:', {
      id: simulationCase.id,
      title: simulationCase.title,
      createdBy: simulationCase.createdBy
    });
    
    const caseKey = `${CASE_STORAGE_PREFIX}${simulationCase.id}`;
    console.log('Storage key:', caseKey);
    
    // Serialize and save the case
    const serializedCase = JSON.stringify(simulationCase);
    localStorage.setItem(caseKey, serializedCase);
    console.log('Case data saved to localStorage');
    
    // Update the index
    updateCaseIndex(simulationCase.id);
    console.log('Case index updated');
    
    // Verify the save by trying to load it back
    const savedData = localStorage.getItem(caseKey);
    if (!savedData) {
      throw new Error('Case was not saved - localStorage.getItem returned null');
    }
    
    try {
      const parsedCase = JSON.parse(savedData);
      if (parsedCase.id !== simulationCase.id) {
        throw new Error('Case ID mismatch after save');
      }
      console.log('Case save verification successful');
    } catch (parseError) {
      throw new Error('Case save verification failed - could not parse saved data');
    }
    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      console.log('Dispatching caseAdded event');
      window.dispatchEvent(new CustomEvent('caseAdded', {
        detail: { caseId: simulationCase.id }
      }));
    }
    
    console.log('=== CASE STORAGE COMPLETE ===');
    return true;
  } catch (error) {
    console.error('=== CASE STORAGE ERROR ===');
    console.error('Error saving case:', error);
    console.error('Case data:', simulationCase);
    return false;
  }
};

/**
 * Load a specific case by ID
 */
export const loadCase = (caseId: string): SimulationCase | null => {
  try {
    const caseKey = `${CASE_STORAGE_PREFIX}${caseId}`;
    const caseData = localStorage.getItem(caseKey);
    if (caseData) {
      const parsed = JSON.parse(caseData);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading case:', error);
    return null;
  }
};

/**
 * Load all cases from localStorage
 */
export const loadAllCases = (): SimulationCase[] => {
  try {
    console.log('=== LOADING ALL CASES ===');
    const caseIds = getCaseIndex();
    console.log('Case IDs from index:', caseIds);
    const cases: SimulationCase[] = [];
    
    caseIds.forEach(caseId => {
      const simulationCase = loadCase(caseId);
      if (simulationCase) {
        cases.push(simulationCase);
        console.log('Loaded case:', {
          id: simulationCase.id,
          title: simulationCase.title,
          createdBy: simulationCase.createdBy,
          createdAt: simulationCase.createdAt
        });
      } else {
        console.warn('Failed to load case with ID:', caseId);
      }
    });
    
    // Sort by creation date (newest first)
    const sortedCases = cases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('Total cases loaded:', sortedCases.length);
    console.log('Cases by type:', {
      userCreated: sortedCases.filter(c => c.createdBy === 'ai-generated').length,
      demo: sortedCases.filter(c => c.createdBy === 'demo-user').length,
      other: sortedCases.filter(c => c.createdBy !== 'ai-generated' && c.createdBy !== 'demo-user').length
    });
    
    return sortedCases;
  } catch (error) {
    console.error('Error loading all cases:', error);
    return [];
  }
};

/**
 * Delete a case from localStorage
 */
export const deleteCase = (caseId: string): boolean => {
  try {
    const caseKey = `${CASE_STORAGE_PREFIX}${caseId}`;
    localStorage.removeItem(caseKey);
    removeCaseFromIndex(caseId);
    return true;
  } catch (error) {
    console.error('Error deleting case:', error);
    return false;
  }
};

/**
 * Export a case as JSON
 */
export const exportCaseAsJSON = (simulationCase: SimulationCase): void => {
  try {
    const dataStr = JSON.stringify(simulationCase, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${simulationCase.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_case.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting case:', error);
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = (): { totalCases: number; storageUsed: string } => {
  try {
    const caseIds = getCaseIndex();
    let totalSize = 0;
    
    caseIds.forEach(caseId => {
      const caseKey = `${CASE_STORAGE_PREFIX}${caseId}`;
      const caseData = localStorage.getItem(caseKey);
      if (caseData) {
        totalSize += caseData.length;
      }
    });
    
    // Convert bytes to KB/MB
    const sizeKB = totalSize / 1024;
    const storageUsed = sizeKB > 1024 
      ? `${(sizeKB / 1024).toFixed(2)} MB`
      : `${sizeKB.toFixed(2)} KB`;
    
    return {
      totalCases: caseIds.length,
      storageUsed,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalCases: 0, storageUsed: '0 KB' };
  }
};

/**
 * Clear all cases from localStorage
 */
export const clearAllCases = (): boolean => {
  try {
    const caseIds = getCaseIndex();
    caseIds.forEach(caseId => {
      const caseKey = `${CASE_STORAGE_PREFIX}${caseId}`;
      localStorage.removeItem(caseKey);
    });
    localStorage.removeItem(CASES_INDEX_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all cases:', error);
    return false;
  }
}; 