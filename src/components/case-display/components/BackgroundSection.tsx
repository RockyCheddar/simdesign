'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface BackgroundData {
  scenarioNarrative: string;
  immediateContextSummary: string;
  emsReport: {
    summary: string;
    fieldVitals: {
      HR: string;
      BP: string;
      RR: string;
      SpO2: string;
      temp: string;
    };
    interventions: string[];
  };
}

interface BackgroundSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (backgroundData: BackgroundData) => void;
}

const BackgroundSection: React.FC<BackgroundSectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if background data already exists in the case
  const existingBackgroundData = caseData.onDemandOptions?.['case-background'] 
    ? JSON.parse(caseData.onDemandOptions['case-background']) as BackgroundData
    : null;
    
  const [backgroundData, setBackgroundData] = useState<BackgroundData | null>(existingBackgroundData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-background', {
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
        throw new Error(errorData.error || 'Failed to generate background');
      }

      const { backgroundData: generatedData } = await response.json();
      setBackgroundData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate background');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonState = () => {
    if (isGenerating) {
      return {
        text: 'Generating...',
        className: 'bg-gray-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (backgroundData) {
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

  if (!backgroundData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Additional Case Background</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate narrative context, patient history summary, and pre-hospital information
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

  return (
    <InfoCard 
      title="Additional Case Background" 
      subtitle="Narrative context, patient history summary, and pre-hospital information"
    >
      <div className="space-y-0">
        <DataRow 
          label="Narrative Context" 
          value={
            <div className="text-sm leading-relaxed whitespace-pre-line text-gray-900">
              {backgroundData.scenarioNarrative}
            </div>
          }
        />
        
        <DataRow 
          label="Patient History Summary" 
          value={
            <div className="text-sm leading-relaxed whitespace-pre-line text-gray-900">
              {backgroundData.immediateContextSummary}
            </div>
          }
        />
        
        <DataRow 
          label="Pre-Hospital Information" 
          value={
            <div className="space-y-4">
              {/* Transport Summary */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Transport Summary</div>
                <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 mb-3">
                  {backgroundData.emsReport.summary}
                </div>
              </div>

              {/* Field Vitals */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Field Vitals</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">HR</div>
                    <div className="text-sm font-medium text-gray-900">{backgroundData.emsReport.fieldVitals.HR}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">BP</div>
                    <div className="text-sm font-medium text-gray-900">{backgroundData.emsReport.fieldVitals.BP}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">RR</div>
                    <div className="text-sm font-medium text-gray-900">{backgroundData.emsReport.fieldVitals.RR}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">SpO2</div>
                    <div className="text-sm font-medium text-gray-900">{backgroundData.emsReport.fieldVitals.SpO2}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Temp</div>
                    <div className="text-sm font-medium text-gray-900">{backgroundData.emsReport.fieldVitals.temp}</div>
                  </div>
                </div>
              </div>

              {/* Field Interventions */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Field Interventions</div>
                <div className="space-y-1">
                  {backgroundData.emsReport.interventions.map((intervention, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{intervention}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </InfoCard>
  );
};

export default BackgroundSection; 