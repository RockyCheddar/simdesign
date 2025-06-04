'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GeneratedCaseData } from '@/types/caseCreation';
import { ProgressionScenario, ScenarioType } from '@/types/progression';
import InfoCard from '../components/InfoCard';
import { ProgressionScenarioCard, CreateProgressionModal } from '../../progression';
import { 
  saveProgressionScenario, 
  loadProgressionScenarios, 
  deleteProgressionScenario 
} from '@/utils/progressionStorage';

interface ProgressionTabProps {
  caseData: GeneratedCaseData;
}

const SCENARIO_TYPES: ScenarioType[] = [
  {
    id: 'conditional',
    label: 'Conditional Branching',
    icon: '⚡',
    description: 'Create scenarios that branch based on learner decisions',
    examples: [
      'Different outcomes based on medication timing',
      'Varied responses to diagnostic choices',
      'Multiple treatment pathways'
    ]
  },
  {
    id: 'time-based',
    label: 'Time-Based Evolution',
    icon: '⏰',
    description: 'Natural progression of patient condition over time',
    examples: [
      'Patient deterioration without intervention',
      'Recovery following treatment',
      'Chronic condition progression'
    ]
  },
  {
    id: 'complication',
    label: 'Complication Scenarios',
    icon: '⚠️',
    description: 'Unexpected complications that may arise',
    examples: [
      'Adverse drug reactions',
      'Procedural complications',
      'Secondary infections'
    ]
  }
];

/**
 * ProgressionTab - Main component for managing simulation progression scenarios
 * Provides interface for creating, editing, and managing different types of progression scenarios
 */
const ProgressionTab: React.FC<ProgressionTabProps> = ({ caseData }) => {
  const params = useParams();
  const caseId = params?.id as string;
  const [scenarios, setScenarios] = useState<ProgressionScenario[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load progression scenarios from storage when component mounts
  useEffect(() => {
    if (caseId) {
      console.log('Loading progression scenarios for case:', caseId);
      const savedScenarios = loadProgressionScenarios(caseId);
      console.log('Loaded scenarios:', savedScenarios.length);
      setScenarios(savedScenarios);
    }
  }, [caseId]);

  // Listen for storage events to keep scenarios in sync
  useEffect(() => {
    if (!caseId) return;

    const handleStorageEvents = (event: CustomEvent) => {
      if (event.detail.caseId === caseId) {
        console.log('Storage event detected, reloading scenarios');
        // Add a small delay to prevent rapid multiple updates
        setTimeout(() => {
          const updatedScenarios = loadProgressionScenarios(caseId);
          setScenarios(prev => {
            // Only update if scenarios actually changed
            if (JSON.stringify(prev.map(s => s.id)) !== JSON.stringify(updatedScenarios.map(s => s.id))) {
              console.log('Scenarios changed, updating state');
              return updatedScenarios;
            }
            console.log('Scenarios unchanged, skipping update');
            return prev;
          });
        }, 50);
      }
    };

    const handleProgressionAdded = (event: CustomEvent) => handleStorageEvents(event);
    const handleProgressionDeleted = (event: CustomEvent) => handleStorageEvents(event);
    const handleProgressionUpdated = (event: CustomEvent) => handleStorageEvents(event);

    window.addEventListener('progressionScenarioAdded', handleProgressionAdded as EventListener);
    window.addEventListener('progressionScenarioDeleted', handleProgressionDeleted as EventListener);
    window.addEventListener('progressionScenarioUpdated', handleProgressionUpdated as EventListener);

    return () => {
      window.removeEventListener('progressionScenarioAdded', handleProgressionAdded as EventListener);
      window.removeEventListener('progressionScenarioDeleted', handleProgressionDeleted as EventListener);
      window.removeEventListener('progressionScenarioUpdated', handleProgressionUpdated as EventListener);
    };
  }, [caseId]);

  /**
   * Handle creating a new progression scenario
   */
  const handleCreateScenario = useCallback(async (scenarioData: Omit<ProgressionScenario, 'id' | 'createdAt'>) => {
    if (!caseId) {
      console.error('No case ID available for saving progression scenario');
      return;
    }

    setIsLoading(true);
    try {
      const newScenario: ProgressionScenario = {
        ...scenarioData,
        id: `scenario-${caseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };

      // Save to storage
      const saved = saveProgressionScenario(caseId, newScenario);
      if (saved) {
        console.log('Progression scenario saved successfully');
        // Don't update local state here - let the storage event handler do it
        // This prevents duplicates from both local update and storage event
        setIsCreateModalOpen(false);
        
        // Manually trigger a reload to ensure immediate UI update
        setTimeout(() => {
          const updatedScenarios = loadProgressionScenarios(caseId);
          setScenarios(updatedScenarios);
        }, 100);
      } else {
        throw new Error('Failed to save progression scenario');
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      // TODO: Show user error message
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  /**
   * Handle editing an existing scenario
   */
  const handleEditScenario = useCallback((scenarioId: string, updates: Partial<ProgressionScenario>) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === scenarioId 
          ? { ...scenario, ...updates }
          : scenario
      )
    );
  }, []);

  /**
   * Handle deleting a scenario
   */
  const handleDeleteScenario = useCallback((scenarioId: string) => {
    if (!caseId) {
      console.error('No case ID available for deleting progression scenario');
      return;
    }

    console.log('Deleting progression scenario:', scenarioId);
    const deleted = deleteProgressionScenario(caseId, scenarioId);
    if (deleted) {
      // Don't update local state here - let the storage event handler do it
      // This prevents duplicates and keeps everything in sync
      
      // Manually trigger a reload to ensure immediate UI update
      setTimeout(() => {
        const updatedScenarios = loadProgressionScenarios(caseId);
        setScenarios(updatedScenarios);
      }, 100);
    } else {
      console.error('Failed to delete progression scenario');
    }
  }, [caseId]);

  /**
   * Handle duplicating a scenario
   */
  const handleDuplicateScenario = useCallback((scenario: ProgressionScenario) => {
    const duplicatedScenario: ProgressionScenario = {
      ...scenario,
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${scenario.title} (Copy)`,
      createdAt: new Date()
    };
    setScenarios(prev => [...prev, duplicatedScenario]);
  }, []);

  /**
   * Handle timeline view (for tracking/analytics purposes)
   */
  const handleViewTimeline = useCallback((scenario: ProgressionScenario) => {
    // This can be used for analytics/tracking when timeline is expanded
    console.log('Timeline viewed for scenario:', scenario.title);
  }, []);



  /**
   * Get scenario type configuration
   */
  const getScenarioTypeConfig = (type: string) => {
    return SCENARIO_TYPES.find(st => st.id === type) || SCENARIO_TYPES[0];
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <InfoCard title="Progression Scenarios" subtitle="Create and manage simulation progression scenarios to enhance learning outcomes">
        <div className="space-y-6">
          {/* Create New Progression Button */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Manage Progression Scenarios
              </h4>
              <p className="text-gray-600">
                Create dynamic scenarios that adapt based on learner actions and time progression
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
              disabled={isLoading}
            >
              <span className="mr-2">➕</span>    Create New Progression
            </button>
          </div>

          {/* Scenario Types Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIO_TYPES.map((type) => (
              <div key={type.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <h5 className="font-semibold text-gray-900">{type.label}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>Examples:</strong>
                  <ul className="mt-1 space-y-1">
                    {type.examples.map((example, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InfoCard>

      {/* Scenarios List */}
      <InfoCard title="Existing Scenarios" subtitle={`${scenarios.length} scenario${scenarios.length !== 1 ? 's' : ''} configured`}>
        {scenarios.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progression Scenarios</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first progression scenario to add dynamic elements to your simulation case.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <span className="mr-2">⚡</span>
              Create Your First Scenario
            </button>
          </div>
        ) : (
          // Scenarios List - Full Width Layout
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={scenario.id}>
                <ProgressionScenarioCard
                  scenario={scenario}
                  onEdit={(updates: Partial<ProgressionScenario>) => handleEditScenario(scenario.id, updates)}
                  onDelete={() => handleDeleteScenario(scenario.id)}
                  onDuplicate={() => handleDuplicateScenario(scenario)}
                  onViewTimeline={() => handleViewTimeline(scenario)}
                  scenarioTypeConfig={getScenarioTypeConfig(scenario.type)}
                />
              </div>
            ))}
          </div>
        )}
      </InfoCard>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateProgressionModal
          isOpen={isCreateModalOpen}  
          onClose={() => setIsCreateModalOpen(false)}
          onCreateScenario={handleCreateScenario}
          scenarioTypes={SCENARIO_TYPES}
          caseData={caseData}
        />
      )}

      {/* Additional Features Section */}
      <InfoCard title="Additional Features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">Export Scenarios</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-2xl mb-2">📥</span>
            <span className="text-sm font-medium text-gray-700">Import Scenarios</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-2xl mb-2">👁️</span>
            <span className="text-sm font-medium text-gray-700">Preview Mode</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700">Instructor Guide</span>
          </button>
        </div>
      </InfoCard>
    </div>
  );
};

export default ProgressionTab; 