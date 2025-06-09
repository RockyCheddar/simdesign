'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface CommonMistake {
  mistake: string;
  category: 'assessment' | 'clinical_reasoning' | 'communication' | 'technical' | 'safety' | 'prioritization';
  whyItHappens: string;
  preventionStrategy: string;
  correctApproach: string;
}

interface CommonMistakesData {
  mistakes: CommonMistake[];
}

interface CommonMistakesSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (mistakesData: CommonMistakesData) => void;
}

const CommonMistakesSection: React.FC<CommonMistakesSectionProps> = ({ 
  caseData, 
  onContentGenerated 
}) => {
  // Check if common mistakes data already exists in the case
  const existingMistakesData = caseData.onDemandOptions?.['common-mistakes'] 
    ? JSON.parse(caseData.onDemandOptions['common-mistakes']) as CommonMistakesData
    : null;
    
  const [mistakesData, setMistakesData] = useState<CommonMistakesData | null>(existingMistakesData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-common-mistakes', {
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
        throw new Error(errorData.error || 'Failed to generate common mistakes');
      }

      const { commonMistakesData } = await response.json();
      setMistakesData(commonMistakesData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(commonMistakesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate common mistakes');
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
    if (mistakesData) {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assessment': return '🔍';
      case 'clinical_reasoning': return '🧠';
      case 'communication': return '💬';
      case 'technical': return '🛠️';
      case 'safety': return '⚠️';
      case 'prioritization': return '📋';
      default: return '❌';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'assessment': return 'Assessment';
      case 'clinical_reasoning': return 'Clinical Reasoning';
      case 'communication': return 'Communication';
      case 'technical': return 'Technical Skills';
      case 'safety': return 'Safety';
      case 'prioritization': return 'Prioritization';
      default: return 'General';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'assessment': return 'bg-blue-50 border-blue-200';
      case 'clinical_reasoning': return 'bg-purple-50 border-purple-200';
      case 'communication': return 'bg-green-50 border-green-200';
      case 'technical': return 'bg-orange-50 border-orange-200';
      case 'safety': return 'bg-red-50 border-red-200';
      case 'prioritization': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!mistakesData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Common Mistakes</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate typical errors and correction strategies for instructors
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
      title="Common Mistakes" 
      subtitle="Typical errors and correction strategies for instructors"
    >
      <div className="space-y-4">
        {mistakesData.mistakes.map((mistake, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getCategoryColor(mistake.category)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(mistake.category)}</span>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {getCategoryName(mistake.category)}
                </span>
              </div>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                Mistake #{index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <h6 className="text-sm font-semibold text-gray-900 mb-1">❌ Common Mistake:</h6>
                <p className="text-sm text-gray-800 leading-relaxed">{mistake.mistake}</p>
              </div>
              
              <div>
                <h6 className="text-sm font-semibold text-gray-900 mb-1">🤔 Why It Happens:</h6>
                <p className="text-sm text-gray-700 leading-relaxed">{mistake.whyItHappens}</p>
              </div>
              
              <div>
                <h6 className="text-sm font-semibold text-gray-900 mb-1">✅ Correct Approach:</h6>
                <p className="text-sm text-gray-700 leading-relaxed">{mistake.correctApproach}</p>
              </div>
              
              <div>
                <h6 className="text-sm font-semibold text-gray-900 mb-1">🎯 Prevention Strategy:</h6>
                <p className="text-sm text-gray-700 leading-relaxed italic">{mistake.preventionStrategy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};

export default CommonMistakesSection; 