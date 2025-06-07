'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface PastMedicalHistoryData {
  chronicConditions: string[];
  previousSurgeries: string[];
  previousHospitalizations: string[];
  significantIllnesses: string[];
  allergies: {
    medications: string;
    environmental: string;
    food: string;
  };
  immunizations: {
    status: string;
    recent: string;
  };

  mentalHealthHistory: {
    conditions: string;
    medications: string;
    hospitalizations: string;
  };
}

interface PastMedicalHistorySectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (pastMedicalHistoryData: PastMedicalHistoryData) => void;
}

const PastMedicalHistorySection: React.FC<PastMedicalHistorySectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if past medical history data already exists in the case
  const existingPastMedicalHistoryData = caseData.onDemandOptions?.['past-medical-history'] 
    ? JSON.parse(caseData.onDemandOptions['past-medical-history']) as PastMedicalHistoryData
    : null;
    
  const [pastMedicalHistoryData, setPastMedicalHistoryData] = useState<PastMedicalHistoryData | null>(existingPastMedicalHistoryData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-past-medical-history', {
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
        throw new Error(errorData.error || 'Failed to generate past medical history');
      }

      const { pastMedicalHistoryData: generatedData } = await response.json();
      setPastMedicalHistoryData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate past medical history');
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
    if (pastMedicalHistoryData) {
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

  if (!pastMedicalHistoryData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Past Medical History</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate comprehensive medical timeline including conditions, surgeries, allergies, and family history
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
    if (!items || items.length === 0 || (items.length === 1 && (items[0].toLowerCase().includes('none') || items[0].toLowerCase().includes('nkda')))) {
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
      title="Past Medical History" 
      subtitle="Comprehensive medical timeline including conditions, surgeries, allergies, and family history"
    >
      <div className="space-y-0">
        <DataRow 
          label="Chronic Conditions" 
          value={renderListItems(pastMedicalHistoryData.chronicConditions, 'No chronic conditions')}
        />
        
        <DataRow 
          label="Previous Surgeries" 
          value={renderListItems(pastMedicalHistoryData.previousSurgeries, 'No previous surgeries')}
        />
        
        <DataRow 
          label="Previous Hospitalizations" 
          value={renderListItems(pastMedicalHistoryData.previousHospitalizations, 'No previous hospitalizations')}
        />
        
        <DataRow 
          label="Significant Past Illnesses" 
          value={renderListItems(pastMedicalHistoryData.significantIllnesses, 'No significant past illnesses')}
        />
        
        <DataRow 
          label="Allergies" 
          value={
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Medications:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.allergies.medications}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Environmental:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.allergies.environmental}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Food:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.allergies.food}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Immunizations" 
          value={
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-2 ${
                  pastMedicalHistoryData.immunizations.status.toLowerCase().includes('current') || 
                  pastMedicalHistoryData.immunizations.status.toLowerCase().includes('up to date') 
                    ? 'text-green-700' 
                    : pastMedicalHistoryData.immunizations.status.toLowerCase().includes('behind')
                    ? 'text-red-700'
                    : 'text-gray-900'
                }`}>
                  {pastMedicalHistoryData.immunizations.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Recent:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.immunizations.recent}</span>
              </div>
            </div>
          }
        />
        
        
        <DataRow 
          label="Mental Health History" 
          value={
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Conditions:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.mentalHealthHistory.conditions}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Medications:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.mentalHealthHistory.medications}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Hospitalizations:</span>
                <span className="ml-2 text-gray-900">{pastMedicalHistoryData.mentalHealthHistory.hospitalizations}</span>
              </div>
            </div>
          }
        />
      </div>
    </InfoCard>
  );
};

export default PastMedicalHistorySection; 