'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface LabTest {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

interface LabPanel {
  panelName: string;
  category: string;
  clinicalRelevance: string;
  tests: LabTest[];
}

interface LaboratoryResultsData {
  labPanels: LabPanel[];
  orderingPhysician: string;
  collectionTime: string;
  processingLab: string;
  clinicalSummary: string;
}

interface LaboratoryResultsSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (laboratoryResultsData: LaboratoryResultsData) => void;
}

const LaboratoryResultsSection: React.FC<LaboratoryResultsSectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if laboratory results data already exists in the case
  const existingLaboratoryResultsData = caseData.onDemandOptions?.['laboratory-results'] 
    ? JSON.parse(caseData.onDemandOptions['laboratory-results']) as LaboratoryResultsData
    : null;
    
  const [laboratoryResultsData, setLaboratoryResultsData] = useState<LaboratoryResultsData | null>(existingLaboratoryResultsData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-laboratory-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate laboratory results');
      }

      const { laboratoryResultsData: generatedData } = await response.json();
      setLaboratoryResultsData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate laboratory results');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePanel = (panelName: string) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const getButtonState = () => {
    if (isGenerating) {
      return {
        text: 'Generating...',
        className: 'bg-gray-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (laboratoryResultsData) {
      return {
        text: 'Generated ✓',
        className: 'bg-green-600 cursor-default',
        disabled: true,
      };
    }
    return {
      text: 'Generate',
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  if (!laboratoryResultsData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Laboratory Results</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate comprehensive lab panel with reference ranges organized by clinical categories
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={buttonState.disabled}
              className={`
                px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2
                ${buttonState.className}
              `}
            >
              {isGenerating && <LoadingSpinner size="sm" />}
              <span>{buttonState.text}</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderLabPanel = (panel: LabPanel) => {
    const isExpanded = expandedPanels[panel.panelName];
    
    return (
      <div key={panel.panelName} className="border border-gray-200 rounded-lg">
        <button
          onClick={() => togglePanel(panel.panelName)}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">🔬</span>
            <div>
              <span className="font-medium text-gray-900">{panel.panelName}</span>
              <span className="ml-2 text-sm text-gray-500">- {panel.category}</span>
              <p className="text-xs text-gray-600 mt-1">{panel.clinicalRelevance}</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {panel.tests.map((test, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {test.test}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                        <span className={test.isAbnormal ? 'text-red-700 font-bold' : 'text-gray-900'}>
                          {test.value}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center font-mono">
                        {test.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center font-mono">
                        {test.referenceRange}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {test.isAbnormal ? (
                          <span className="inline-flex items-center text-red-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">ABNORMAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">NORMAL</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <InfoCard 
      title="Laboratory Results" 
      subtitle="Comprehensive lab panel with reference ranges organized by clinical categories"
    >
      <div className="space-y-4">
        {/* Lab Information Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Ordering Physician:</span>
              <span className="ml-2 text-blue-800">{laboratoryResultsData.orderingPhysician}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Collection Time:</span>
              <span className="ml-2 text-blue-800">{laboratoryResultsData.collectionTime}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Processing Lab:</span>
              <span className="ml-2 text-blue-800">{laboratoryResultsData.processingLab}</span>
            </div>
          </div>
        </div>

        {/* Lab Panels - Collapsible */}
        <div className="space-y-2">
          {laboratoryResultsData.labPanels.map(panel => renderLabPanel(panel))}
        </div>

        {/* Clinical Summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-yellow-900 font-medium text-sm">Clinical Summary:</p>
              <p className="text-yellow-800 text-sm mt-1">
                {laboratoryResultsData.clinicalSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  );
};

export default LaboratoryResultsSection; 