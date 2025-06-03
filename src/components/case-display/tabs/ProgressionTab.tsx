'use client';

import React, { useState, useCallback } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { ProgressionScenario, ScenarioType } from '@/types/progression';
import InfoCard from '../components/InfoCard';
import { ProgressionScenarioCard, CreateProgressionModal } from '../../progression';
import TimelineModal from '../../progression/TimelineModal';

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
  const [scenarios, setScenarios] = useState<ProgressionScenario[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ProgressionScenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle creating a new progression scenario
   */
  const handleCreateScenario = useCallback(async (scenarioData: Omit<ProgressionScenario, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const newScenario: ProgressionScenario = {
        ...scenarioData,
        id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      };

      setScenarios(prev => [...prev, newScenario]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating scenario:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    setScenarios(prev => prev.filter(scenario => scenario.id !== scenarioId));
  }, []);

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
   * Handle moving scenario up in order
   */
  const handleMoveScenarioUp = useCallback((index: number) => {
    if (index === 0) return;
    
    setScenarios(prev => {
      const newScenarios = [...prev];
      [newScenarios[index - 1], newScenarios[index]] = [newScenarios[index], newScenarios[index - 1]];
      return newScenarios;
    });
  }, []);

  /**
   * Handle moving scenario down in order
   */
  const handleMoveScenarioDown = useCallback((index: number) => {
    setScenarios(prev => {
      if (index >= prev.length - 1) return prev;
      
      const newScenarios = [...prev];
      [newScenarios[index], newScenarios[index + 1]] = [newScenarios[index + 1], newScenarios[index]];
      return newScenarios;
    });
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
          // Scenarios Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scenarios.map((scenario, index) => (
              <div key={scenario.id} className="relative">
                {/* Reorder Controls */}
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 z-10">
                  <button
                    onClick={() => handleMoveScenarioUp(index)}
                    disabled={index === 0}
                    className="w-6 h-6 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveScenarioDown(index)}
                    disabled={index === scenarios.length - 1}
                    className="w-6 h-6 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                <ProgressionScenarioCard
                  scenario={scenario}
                  onEdit={(updates: Partial<ProgressionScenario>) => handleEditScenario(scenario.id, updates)}
                  onDelete={() => handleDeleteScenario(scenario.id)}
                  onDuplicate={() => handleDuplicateScenario(scenario)}
                  onViewTimeline={() => setSelectedScenario(scenario)}
                  scenarioTypeConfig={getScenarioTypeConfig(scenario.type)}
                />
              </div>
            ))}
          </div>
        )}
      </InfoCard>

      {/* Timeline Modal */}
      {selectedScenario && (
        <TimelineModal
          isOpen={!!selectedScenario}
          onClose={() => setSelectedScenario(null)}
          scenario={selectedScenario}
        />
      )}

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