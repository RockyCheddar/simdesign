import { ProgressionScenario } from '@/types/progression';
import { SimulationCase } from '@/types';
import { loadCase, saveCase } from './caseStorage';

/**
 * Save a progression scenario to a specific case
 */
export const saveProgressionScenario = (
  caseId: string, 
  scenario: ProgressionScenario
): boolean => {
  try {
    console.log('Saving progression scenario to case:', caseId, scenario.title);
    
    // Load the current case
    const existingCase = loadCase(caseId);
    if (!existingCase) {
      throw new Error(`Case with ID ${caseId} not found`);
    }
    
    // Initialize progressionScenarios array if it doesn't exist
    if (!existingCase.progressionScenarios) {
      existingCase.progressionScenarios = [];
    }
    
    // Check if scenario with this ID already exists
    const existingIndex = existingCase.progressionScenarios.findIndex(
      s => s.id === scenario.id
    );
    
    if (existingIndex >= 0) {
      // Update existing scenario
      existingCase.progressionScenarios[existingIndex] = scenario;
      console.log('Updated existing progression scenario:', scenario.id);
    } else {
      // Add new scenario
      existingCase.progressionScenarios.push(scenario);
      console.log('Added new progression scenario:', scenario.id);
    }
    
    // Update the case's updatedAt timestamp
    existingCase.updatedAt = new Date();
    
    // Save the updated case back to storage
    const saved = saveCase(existingCase);
    if (saved) {
      console.log('Progression scenario saved successfully');
      
      // Dispatch custom event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('progressionScenarioAdded', {
          detail: { caseId, scenarioId: scenario.id }
        }));
      }
    }
    
    return saved;
  } catch (error) {
    console.error('Error saving progression scenario:', error);
    return false;
  }
};

/**
 * Load all progression scenarios for a specific case
 */
export const loadProgressionScenarios = (caseId: string): ProgressionScenario[] => {
  try {
    const existingCase = loadCase(caseId);
    if (!existingCase) {
      console.warn(`Case with ID ${caseId} not found`);
      return [];
    }
    
    // Convert date strings back to Date objects
    const scenarios = existingCase.progressionScenarios || [];
    return scenarios.map(scenario => {
      const createdAt = new Date(scenario.createdAt);
      // Fallback to current date if invalid
      const validatedDate = isNaN(createdAt.getTime()) ? new Date() : createdAt;
      
      return {
        ...scenario,
        createdAt: validatedDate
      };
    });
  } catch (error) {
    console.error('Error loading progression scenarios:', error);
    return [];
  }
};

/**
 * Delete a specific progression scenario from a case
 */
export const deleteProgressionScenario = (
  caseId: string, 
  scenarioId: string
): boolean => {
  try {
    console.log('Deleting progression scenario from case:', caseId, scenarioId);
    
    // Load the current case
    const existingCase = loadCase(caseId);
    if (!existingCase) {
      throw new Error(`Case with ID ${caseId} not found`);
    }
    
    if (!existingCase.progressionScenarios) {
      console.warn('No progression scenarios found for case:', caseId);
      return true; // Nothing to delete
    }
    
    // Filter out the scenario to delete
    const initialCount = existingCase.progressionScenarios.length;
    existingCase.progressionScenarios = existingCase.progressionScenarios.filter(
      s => s.id !== scenarioId
    );
    
    if (existingCase.progressionScenarios.length === initialCount) {
      console.warn('Progression scenario not found:', scenarioId);
      return false;
    }
    
    // Update the case's updatedAt timestamp
    existingCase.updatedAt = new Date();
    
    // Save the updated case back to storage
    const saved = saveCase(existingCase);
    if (saved) {
      console.log('Progression scenario deleted successfully');
      
      // Dispatch custom event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('progressionScenarioDeleted', {
          detail: { caseId, scenarioId }
        }));
      }
    }
    
    return saved;
  } catch (error) {
    console.error('Error deleting progression scenario:', error);
    return false;
  }
};

/**
 * Get a specific progression scenario by ID
 */
export const getProgressionScenario = (
  caseId: string, 
  scenarioId: string
): ProgressionScenario | null => {
  try {
    const scenarios = loadProgressionScenarios(caseId);
    const scenario = scenarios.find(s => s.id === scenarioId) || null;
    
    // Ensure createdAt is a proper Date object
    if (scenario) {
      const createdAt = new Date(scenario.createdAt);
      const validatedDate = isNaN(createdAt.getTime()) ? new Date() : createdAt;
      
      return {
        ...scenario,
        createdAt: validatedDate
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting progression scenario:', error);
    return null;
  }
};

/**
 * Update a specific progression scenario
 */
export const updateProgressionScenario = (
  caseId: string,
  scenarioId: string,
  updates: Partial<ProgressionScenario>
): boolean => {
  try {
    const existingCase = loadCase(caseId);
    if (!existingCase || !existingCase.progressionScenarios) {
      return false;
    }
    
    const scenarioIndex = existingCase.progressionScenarios.findIndex(
      s => s.id === scenarioId
    );
    
    if (scenarioIndex === -1) {
      return false;
    }
    
    // Update the scenario
    const updatedScenario = {
      ...existingCase.progressionScenarios[scenarioIndex],
      ...updates
    };
    
    // Ensure createdAt remains a valid Date object
    if (updatedScenario.createdAt) {
      const createdAt = new Date(updatedScenario.createdAt);
      updatedScenario.createdAt = isNaN(createdAt.getTime()) ? new Date() : createdAt;
    }
    
    existingCase.progressionScenarios[scenarioIndex] = updatedScenario;
    
    // Update the case's updatedAt timestamp
    existingCase.updatedAt = new Date();
    
    // Save the updated case
    const saved = saveCase(existingCase);
    if (saved) {
      // Dispatch custom event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('progressionScenarioUpdated', {
          detail: { caseId, scenarioId }
        }));
      }
    }
    
    return saved;
  } catch (error) {
    console.error('Error updating progression scenario:', error);
    return false;
  }
}; 