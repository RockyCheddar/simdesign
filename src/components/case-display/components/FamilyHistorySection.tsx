'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface FamilyHistoryData {
  parents: {
    father: string;
    mother: string;
  };
  siblings: {
    brothers: string;
    sisters: string;
  };
  grandparents: {
    paternal: string;
    maternal: string;
  };
  significantFamilyHistory: string[];
  hereditaryRisks: string[];
}

interface FamilyHistorySectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (familyHistoryData: FamilyHistoryData) => void;
}

const FamilyHistorySection: React.FC<FamilyHistorySectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if family history data already exists in the case
  const existingFamilyHistoryData = caseData.onDemandOptions?.['family-history'] 
    ? JSON.parse(caseData.onDemandOptions['family-history']) as FamilyHistoryData
    : null;
    
  const [familyHistoryData, setFamilyHistoryData] = useState<FamilyHistoryData | null>(existingFamilyHistoryData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-family-history', {
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
        throw new Error(errorData.error || 'Failed to generate family history');
      }

      const { familyHistoryData: generatedData } = await response.json();
      setFamilyHistoryData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate family history');
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
    if (familyHistoryData) {
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

  if (!familyHistoryData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Family History</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate comprehensive family medical history including hereditary risks and patterns
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

  const renderListItems = (items: string[], emptyMessage: string = 'None documented') => {
    if (!items || items.length === 0) {
      return <span className="text-gray-500 italic">{emptyMessage}</span>;
    }
    
    return (
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-900">
            <span className="text-blue-500 mr-2 mt-1 text-xs">•</span>
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <InfoCard 
      title="Family History" 
      subtitle="Comprehensive family medical history including hereditary risks and patterns"
    >
      <div className="space-y-0">
        <DataRow 
          label="Father" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.parents.father}</span>}
        />
        
        <DataRow 
          label="Mother" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.parents.mother}</span>}
        />
        
        <DataRow 
          label="Brothers" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.siblings.brothers}</span>}
        />
        
        <DataRow 
          label="Sisters" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.siblings.sisters}</span>}
        />
        
        <DataRow 
          label="Paternal Grandparents" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.grandparents.paternal}</span>}
        />
        
        <DataRow 
          label="Maternal Grandparents" 
          value={<span className="text-sm text-gray-900">{familyHistoryData.grandparents.maternal}</span>}
        />
        
        <DataRow 
          label="Significant Family History" 
          value={renderListItems(familyHistoryData.significantFamilyHistory, 'No significant patterns identified')}
        />
        
        <DataRow 
          label="Hereditary Risks & Recommendations" 
          value={renderListItems(familyHistoryData.hereditaryRisks, 'No significant hereditary risks identified')}
        />
      </div>
    </InfoCard>
  );
};

export default FamilyHistorySection; 