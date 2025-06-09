'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface ComplicationData {
  immediateComplications: Array<{
    name: string;
    likelihood: 'low' | 'moderate' | 'high';
    timeframe: string;
    description: string;
    earlyWarnings: string[];
    management: string[];
  }>;
  delayedComplications: Array<{
    name: string;
    likelihood: 'low' | 'moderate' | 'high';
    timeframe: string;
    description: string;
    earlyWarnings: string[];
    management: string[];
  }>;
  emergencyProtocols: Array<{
    scenario: string;
    triggerSigns: string[];
    immediateActions: string[];
    escalationCriteria: string[];
  }>;
}

interface ComplicationScenariosSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (complicationData: ComplicationData) => void;
}

const ComplicationScenariosSection: React.FC<ComplicationScenariosSectionProps> = ({ 
  caseData, 
  onContentGenerated 
}) => {
  // Check if complication data already exists in the case
  const existingComplicationData = caseData.onDemandOptions?.['complication-scenarios'] 
    ? JSON.parse(caseData.onDemandOptions['complication-scenarios']) as ComplicationData
    : null;
    
  const [complicationData, setComplicationData] = useState<ComplicationData | null>(existingComplicationData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-complication-scenarios', {
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
        throw new Error(errorData.error || 'Failed to generate complication scenarios');
      }

      const { complicationData: generatedData } = await response.json();
      setComplicationData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate complication scenarios');
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
    if (complicationData) {
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

  const getLikelihoodBadge = (likelihood: 'low' | 'moderate' | 'high') => {
    const badgeStyles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${badgeStyles[likelihood]}`}>
        {likelihood.charAt(0).toUpperCase() + likelihood.slice(1)} Risk
      </span>
    );
  };

  const buttonState = getButtonState();

  if (!complicationData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Complication Scenarios</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate potential complications, early warning signs, and emergency management protocols
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
      title="Complication Scenarios" 
      subtitle="Potential complications, early warning signs, and emergency management protocols"
    >
      <div className="space-y-0">
        {/* Immediate Complications */}
        <DataRow 
          label="Immediate Complications (0-2 hours)" 
          value={
            <div className="space-y-4">
              {complicationData.immediateComplications.map((complication, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-base font-semibold text-red-900">{complication.name}</h5>
                    <div className="flex items-center space-x-2">
                      {getLikelihoodBadge(complication.likelihood)}
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {complication.timeframe}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-red-800 mb-3 leading-relaxed">
                    {complication.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h6 className="text-sm font-medium text-red-900 mb-2">Early Warning Signs</h6>
                      <ul className="space-y-1">
                        {complication.earlyWarnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start text-sm text-red-700">
                            <span className="text-red-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-red-900 mb-2">Management</h6>
                      <ul className="space-y-1">
                        {complication.management.map((action, idx) => (
                          <li key={idx} className="flex items-start text-sm text-red-700">
                            <span className="text-red-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        {/* Delayed Complications */}
        <DataRow 
          label="Delayed Complications (2+ hours)" 
          value={
            <div className="space-y-4">
              {complicationData.delayedComplications.map((complication, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-base font-semibold text-orange-900">{complication.name}</h5>
                    <div className="flex items-center space-x-2">
                      {getLikelihoodBadge(complication.likelihood)}
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {complication.timeframe}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-orange-800 mb-3 leading-relaxed">
                    {complication.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h6 className="text-sm font-medium text-orange-900 mb-2">Early Warning Signs</h6>
                      <ul className="space-y-1">
                        {complication.earlyWarnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start text-sm text-orange-700">
                            <span className="text-orange-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-orange-900 mb-2">Management</h6>
                      <ul className="space-y-1">
                        {complication.management.map((action, idx) => (
                          <li key={idx} className="flex items-start text-sm text-orange-700">
                            <span className="text-orange-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        />

        {/* Emergency Protocols */}
        <DataRow 
          label="Emergency Protocols" 
          value={
            <div className="space-y-4">
              {complicationData.emergencyProtocols.map((protocol, index) => (
                <div key={index} className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <h5 className="text-base font-semibold text-red-900 mb-3 flex items-center">
                    <span className="mr-2">🚨</span>
                    {protocol.scenario}
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-red-900 mb-2">Trigger Signs</h6>
                      <ul className="space-y-1">
                        {protocol.triggerSigns.map((sign, idx) => (
                          <li key={idx} className="flex items-start text-sm text-red-800">
                            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0">⚠️</span>
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-red-900 mb-2">Immediate Actions</h6>
                      <ul className="space-y-1">
                        {protocol.immediateActions.map((action, idx) => (
                          <li key={idx} className="flex items-start text-sm text-red-800">
                            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-red-900 mb-2">Escalation Criteria</h6>
                      <ul className="space-y-1">
                        {protocol.escalationCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start text-sm text-red-800">
                            <span className="text-red-600 mr-2 mt-0.5 flex-shrink-0">📞</span>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </InfoCard>
  );
};

export default ComplicationScenariosSection; 