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
    const caseKey = `${CASE_STORAGE_PREFIX}${simulationCase.id}`;
    localStorage.setItem(caseKey, JSON.stringify(simulationCase));
    updateCaseIndex(simulationCase.id);
    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caseAdded', {
        detail: { caseId: simulationCase.id }
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving case:', error);
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
    const caseIds = getCaseIndex();
    const cases: SimulationCase[] = [];
    
    caseIds.forEach(caseId => {
      const simulationCase = loadCase(caseId);
      if (simulationCase) {
        cases.push(simulationCase);
      }
    });
    
    // Sort by creation date (newest first)
    return cases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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