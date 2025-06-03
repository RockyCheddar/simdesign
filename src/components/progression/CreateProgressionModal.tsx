'use client';

import React, { useState, useCallback } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { ProgressionScenario, ScenarioType, CreateProgressionFormData, AIGenerationProgress } from '@/types/progression';

interface CreateProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScenario: (scenario: Omit<ProgressionScenario, 'id' | 'createdAt'>) => void;
  scenarioTypes: ScenarioType[];
  caseData?: GeneratedCaseData;
}

/**
 * CreateProgressionModal - Modal for creating new progression scenarios
 * Provides interface for selecting scenario types and configuration
 */
const CreateProgressionModal: React.FC<CreateProgressionModalProps> = ({
  isOpen,
  onClose,
  onCreateScenario,
  scenarioTypes
}) => {
  const [step, setStep] = useState<'select-type' | 'configure' | 'generating'>('select-type');
  const [selectedType, setSelectedType] = useState<ScenarioType | null>(null);
  const [formData, setFormData] = useState<CreateProgressionFormData>({
    type: 'conditional',
    title: '',
    description: '',
    parameters: {
      complexity: 'moderate',
      learningFocus: []
    },
    generateWithAI: true
  });
  const [generationProgress, setGenerationProgress] = useState<AIGenerationProgress>({
    stage: 'initializing',
    progress: 0,
    message: 'Preparing to generate scenario...'
  });

  /**
   * Handle form data changes
   */
  const handleFormChange = useCallback((field: keyof CreateProgressionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle parameter changes
   */
  const handleParameterChange = useCallback((field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [field]: value }
    }));
  }, []);

  /**
   * Simulate AI generation process
   */
  const simulateAIGeneration = useCallback(async (): Promise<Omit<ProgressionScenario, 'id' | 'createdAt'>> => {
    const stages: AIGenerationProgress[] = [
      { stage: 'initializing', progress: 20, message: 'Initializing scenario generation...' },
      { stage: 'generating-timeline', progress: 50, message: 'Creating timeline data points...' },
      { stage: 'creating-branches', progress: 80, message: 'Generating conditional branches...' },
      { stage: 'finalizing', progress: 100, message: 'Finalizing scenario...' }
    ];

    for (const stage of stages) {
      setGenerationProgress(stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate mock timeline data based on type
    const mockTimelineData = {
      duration: formData.parameters.timelineLength || 30,
      dataPoints: [
        {
          timeMinutes: 0,
          vitalSigns: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 80,
            respiratoryRate: 16,
            temperature: 98.6,
            oxygenSaturation: 98,
            painLevel: 3
          },
          physicalFindings: ['Alert and oriented', 'No acute distress'],
          patientResponse: 'Patient appears stable',
          clinicalEvents: ['Initial assessment completed'],
          significance: 'normal' as const
        }
      ],
      branches: formData.type === 'conditional' ? [
        {
          id: 'branch-1',
          condition: 'medication_given_within_5_min',
          conditionDisplay: 'Medication given within 5 minutes',
          timeline: [],
          outcome: 'positive' as const,
          probability: 75
        }
      ] : undefined
    };

    return {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      isGenerated: formData.generateWithAI,
      timelineData: mockTimelineData,
      parameters: formData.parameters,
      instructorNotes: `Generated ${formData.type} scenario based on case data`
    };
  }, [formData]);

  if (!isOpen) return null;

  /**
   * Handle scenario type selection
   */
  const handleTypeSelection = (type: ScenarioType, generateWithAI: boolean) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type: type.id,
      generateWithAI,
      title: `${type.label} Scenario`,
      description: `A ${type.label.toLowerCase()} scenario for enhanced learning`
    }));
    setStep('configure');
  };

  /**
   * Handle scenario creation
   */
  const handleCreateScenario = async () => {
    if (formData.generateWithAI) {
      setStep('generating');
      try {
        const generatedScenario = await simulateAIGeneration();
        onCreateScenario(generatedScenario);
      } catch (error) {
        console.error('Error generating scenario:', error);
        // Handle error state
      }
    } else {
      // Create manual scenario
      const manualScenario: Omit<ProgressionScenario, 'id' | 'createdAt'> = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        isGenerated: false,
        parameters: formData.parameters,
        instructorNotes: 'Manually created scenario'
      };
      onCreateScenario(manualScenario);
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (step) {
      case 'select-type':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose Scenario Type
              </h3>
              <p className="text-gray-600">
                Select the type of progression scenario you want to create
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {scenarioTypes.map((type) => (
                <div key={type.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {type.label}
                      </h4>
                      <p className="text-gray-600 mb-4">{type.description}</p>
                      
                      <div className="mb-4">
                        <strong className="text-sm text-gray-700">Examples:</strong>
                        <ul className="mt-1 text-sm text-gray-600 space-y-1">
                          {type.examples.map((example, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleTypeSelection(type, true)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                          <span className="mr-2">🤖</span>
                          Generate with AI
                        </button>
                        <button
                          onClick={() => handleTypeSelection(type, false)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                        >
                          <span className="mr-2">✏️</span>
                          Create Manually
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStep('select-type')}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configure {selectedType?.label}
                </h3>
                <p className="text-gray-600">
                  Set up your progression scenario parameters
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter scenario title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this scenario will accomplish"
                />
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complexity Level
                </label>
                <select
                  value={formData.parameters.complexity}
                  onChange={(e) => handleParameterChange('complexity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Simple - Basic progression</option>
                  <option value="moderate">Moderate - Multiple decision points</option>
                  <option value="complex">Complex - Advanced branching</option>
                </select>
              </div>

              {/* Type-specific parameters */}
              {formData.type === 'conditional' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Point
                  </label>
                  <input
                    type="text"
                    value={formData.parameters.decisionPoint || ''}
                    onChange={(e) => handleParameterChange('decisionPoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Medication administration timing"
                  />
                </div>
              )}

              {formData.type === 'time-based' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.parameters.timelineLength || 30}
                    onChange={(e) => handleParameterChange('timelineLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="5"
                    max="120"
                  />
                </div>
              )}

              {formData.type === 'complication' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complication Type
                    </label>
                    <input
                      type="text"
                      value={formData.parameters.complicationType || ''}
                      onChange={(e) => handleParameterChange('complicationType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Allergic reaction, Equipment failure"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <select
                      value={formData.parameters.severity || 'moderate'}
                      onChange={(e) => handleParameterChange('severity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="mild">Mild - Minor complication</option>
                      <option value="moderate">Moderate - Requires intervention</option>
                      <option value="severe">Severe - Critical complication</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScenario}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
              >
                {formData.generateWithAI ? 'Generate Scenario' : 'Create Scenario'}
              </button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generating Your Scenario
            </h3>
            <p className="text-gray-600 mb-6">
              {generationProgress.message}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress.progress}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              {generationProgress.progress}% complete
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Progression Scenario
            </h2>
            {step !== 'generating' && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default CreateProgressionModal; 