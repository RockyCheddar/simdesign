'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface SocialHistoryData {
  familyDynamics: {
    maritalStatus: string;
    children: string;
    familySupport: string;
    significantRelationships: string;
  };
  workEnvironment: {
    occupation: string;
    workStatus: string;
    workStressors: string;
    occupationalHazards: string;
  };
  lifestyleFactors: {
    exercise: string;
    diet: string;
    sleep: string;
    stressManagement: string;
  };
  livingSituation: {
    housingType: string;
    livingArrangement: string;
    housingStability: string;
    accessibilityNeeds: string;
  };
  supportSystem: {
    primarySupport: string;
    emergencyContact: string;
    socialConnections: string;
    communityInvolvement: string;
  };
  substanceUse: {
    tobacco: string;
    alcohol: string;
    illicitDrugs: string;
    prescription: string;
  };
}

interface SocialHistorySectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (socialHistoryData: SocialHistoryData) => void;
}

const SocialHistorySection: React.FC<SocialHistorySectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if social history data already exists in the case
  const existingSocialHistoryData = caseData.onDemandOptions?.['detailed-social-history'] 
    ? JSON.parse(caseData.onDemandOptions['detailed-social-history']) as SocialHistoryData
    : null;
    
  const [socialHistoryData, setSocialHistoryData] = useState<SocialHistoryData | null>(existingSocialHistoryData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-social-history', {
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
        throw new Error(errorData.error || 'Failed to generate social history');
      }

      const { socialHistoryData: generatedData } = await response.json();
      setSocialHistoryData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate social history');
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
    if (socialHistoryData) {
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

  if (!socialHistoryData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Detailed Social History</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate family dynamics, work environment, lifestyle factors, and support systems
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
      title="Detailed Social History" 
      subtitle="Family dynamics, work environment, lifestyle factors, and support systems"
    >
      <div className="space-y-0">
        <DataRow 
          label="Family Dynamics" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Marital Status:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.familyDynamics.maritalStatus}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Children:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.familyDynamics.children}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Family Support:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.familyDynamics.familySupport}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Key Relationships:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.familyDynamics.significantRelationships}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Work Environment" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Occupation:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.workEnvironment.occupation}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Work Status:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.workEnvironment.workStatus}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Work Stressors:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.workEnvironment.workStressors}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Occupational Hazards:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.workEnvironment.occupationalHazards}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Lifestyle Factors" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Exercise:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.lifestyleFactors.exercise}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Diet:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.lifestyleFactors.diet}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sleep:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.lifestyleFactors.sleep}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Stress Management:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.lifestyleFactors.stressManagement}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Living Situation" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Housing Type:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.livingSituation.housingType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Living Arrangement:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.livingSituation.livingArrangement}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Housing Stability:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.livingSituation.housingStability}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Accessibility Needs:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.livingSituation.accessibilityNeeds}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Support System" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Primary Support:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.supportSystem.primarySupport}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Emergency Contact:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.supportSystem.emergencyContact}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Social Connections:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.supportSystem.socialConnections}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Community Involvement:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.supportSystem.communityInvolvement}</span>
              </div>
            </div>
          }
        />
        
        <DataRow 
          label="Substance Use" 
          value={
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Tobacco:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.substanceUse.tobacco}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Alcohol:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.substanceUse.alcohol}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Illicit Drugs:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.substanceUse.illicitDrugs}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Prescription Use:</span>
                <span className="ml-2 text-gray-900">{socialHistoryData.substanceUse.prescription}</span>
              </div>
            </div>
          }
        />
      </div>
    </InfoCard>
  );
};

export default SocialHistorySection; 