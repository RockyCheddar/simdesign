'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface BriefingData {
  learnerBriefingSBAR: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  keyChallenges: string[];
  anticipatedPitfalls: string[];
  primingQuestions: string[];
}

interface BriefingSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (briefingData: BriefingData) => void;
}

const BriefingSection: React.FC<BriefingSectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if briefing data already exists in the case
  const existingBriefingData = caseData.onDemandOptions?.['pre-simulation-briefing'] 
    ? JSON.parse(caseData.onDemandOptions['pre-simulation-briefing']) as BriefingData
    : null;
    
  const [briefingData, setBriefingData] = useState<BriefingData | null>(existingBriefingData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-briefing', {
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
        throw new Error(errorData.error || 'Failed to generate briefing');
      }

      const { briefingData: generatedData } = await response.json();
      setBriefingData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate briefing');
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
    if (briefingData) {
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

  if (!briefingData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Pre-Simulation Briefing</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate SBAR handoff, key challenges, pitfalls, and priming questions for facilitators
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
      title="Pre-Simulation Briefing" 
      subtitle="SBAR handoff, key challenges, pitfalls, and priming questions for facilitators"
    >
      <div className="space-y-0">
        <DataRow 
          label="Learner Briefing (SBAR)" 
          value={
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Situation</div>
                  <div className="text-sm text-blue-800 leading-relaxed">
                    {briefingData.learnerBriefingSBAR.situation}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-1">Background</div>
                  <div className="text-sm text-green-800 leading-relaxed">
                    {briefingData.learnerBriefingSBAR.background}
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-yellow-900 uppercase tracking-wide mb-1">Assessment</div>
                  <div className="text-sm text-yellow-800 leading-relaxed">
                    {briefingData.learnerBriefingSBAR.assessment}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-1">Recommendation</div>
                  <div className="text-sm text-purple-800 leading-relaxed">
                    {briefingData.learnerBriefingSBAR.recommendation}
                  </div>
                </div>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Key Challenges" 
          value={
            <div className="space-y-2">
              {briefingData.keyChallenges.map((challenge, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900 flex-1 leading-relaxed">{challenge}</p>
                </div>
              ))}
            </div>
          }
        />
        
        <DataRow 
          label="Anticipated Pitfalls" 
          value={
            <div className="space-y-2">
              {briefingData.anticipatedPitfalls.map((pitfall, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-900 flex-1 leading-relaxed">{pitfall}</p>
                </div>
              ))}
            </div>
          }
        />
        
        <DataRow 
          label="Priming Questions" 
          value={
            <div className="space-y-2">
              {briefingData.primingQuestions.map((question, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">Q{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900 flex-1 leading-relaxed italic">"{question}"</p>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </InfoCard>
  );
};

export default BriefingSection; 