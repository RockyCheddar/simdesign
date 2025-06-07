'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface CompletePhysicalExamData {
  generalAppearance: {
    overallAppearance: string;
    posture: string;
    hygiene: string;
    speechPattern: string;
  };
  heent: {
    head: string;
    eyes: string;
    ears: string;
    nose: string;
    throat: string;
  };
  neck: {
    inspection: string;
    palpation: string;
    thyroid: string;
    jugularVeins: string;
  };
  cardiovascular: {
    inspection: string;
    palpation: string;
    auscultation: string;
    peripheralPulses: string;
  };
  respiratory: {
    inspection: string;
    palpation: string;
    percussion: string;
    auscultation: string;
  };
  abdomen: {
    inspection: string;
    auscultation: string;
    palpation: string;
    percussion: string;
  };
  musculoskeletal: {
    gait: string;
    range: string;
    strength: string;
    deformities: string;
  };
  neurological: {
    mentalStatus: string;
    cranialNerves: string;
    motorExam: string;
    sensoryExam: string;
    reflexes: string;
    coordination: string;
  };
  skin: {
    color: string;
    texture: string;
    lesions: string;
    turgor: string;
  };
  keyAbnormalFindings: string[];
  clinicalSummary: string;
}

interface CompletePhysicalExamSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (completePhysicalExamData: CompletePhysicalExamData) => void;
}

const CompletePhysicalExamSection: React.FC<CompletePhysicalExamSectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if complete physical exam data already exists in the case
  const existingCompletePhysicalExamData = caseData.onDemandOptions?.['complete-physical-exam'] 
    ? JSON.parse(caseData.onDemandOptions['complete-physical-exam']) as CompletePhysicalExamData
    : null;
    
  const [completePhysicalExamData, setCompletePhysicalExamData] = useState<CompletePhysicalExamData | null>(existingCompletePhysicalExamData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-complete-physical-exam', {
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
        throw new Error(errorData.error || 'Failed to generate complete physical exam');
      }

      const { completePhysicalExamData: generatedData } = await response.json();
      setCompletePhysicalExamData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate complete physical exam');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
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
    if (completePhysicalExamData) {
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

  if (!completePhysicalExamData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Complete Physical Exam</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate comprehensive head-to-toe systematic assessment with detailed findings by body system
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

  const renderSystemSection = (title: string, sectionKey: string, data: Record<string, string>, icon: string) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div key={sectionKey} className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{icon}</span>
            <span className="font-medium text-gray-900">{title}</span>
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
          <div className="p-4 space-y-0">
            {Object.entries(data).map(([key, value]) => (
              <DataRow 
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                value={<span className="text-sm text-gray-900">{value}</span>}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderListItems = (items: string[], emptyMessage: string = 'No significant findings') => {
    if (!items || items.length === 0 || (items.length === 1 && items[0].toLowerCase().includes('no significant'))) {
      return <span className="text-gray-500 italic">{emptyMessage}</span>;
    }
    
    return (
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-900">
            <span className="text-red-500 mr-2 mt-1 text-xs">⚠️</span>
            <span className="text-sm font-medium text-red-700">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  const systemSections = [
    { title: 'General Appearance', key: 'generalAppearance', data: completePhysicalExamData.generalAppearance, icon: '👤' },
    { title: 'HEENT', key: 'heent', data: completePhysicalExamData.heent, icon: '👁️' },
    { title: 'Neck', key: 'neck', data: completePhysicalExamData.neck, icon: '🦢' },
    { title: 'Cardiovascular', key: 'cardiovascular', data: completePhysicalExamData.cardiovascular, icon: '❤️' },
    { title: 'Respiratory', key: 'respiratory', data: completePhysicalExamData.respiratory, icon: '🫁' },
    { title: 'Abdomen', key: 'abdomen', data: completePhysicalExamData.abdomen, icon: '🟣' },
    { title: 'Musculoskeletal', key: 'musculoskeletal', data: completePhysicalExamData.musculoskeletal, icon: '🦴' },
    { title: 'Neurological', key: 'neurological', data: completePhysicalExamData.neurological, icon: '🧠' },
    { title: 'Skin', key: 'skin', data: completePhysicalExamData.skin, icon: '🤚' },
  ];

  return (
    <InfoCard 
      title="Complete Physical Exam" 
      subtitle="Comprehensive head-to-toe systematic assessment with detailed findings by body system"
    >
      <div className="space-y-4">
        {/* Body Systems - Collapsible */}
        <div className="space-y-2">
          {systemSections.map(section => 
            renderSystemSection(section.title, section.key, section.data, section.icon)
          )}
        </div>

        {/* Key Abnormal Findings */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <DataRow 
            label="Key Abnormal Findings" 
            value={renderListItems(completePhysicalExamData.keyAbnormalFindings, 'No significant abnormal findings noted')}
          />
        </div>

        {/* Clinical Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-blue-900 font-medium text-sm">Clinical Summary:</p>
              <p className="text-blue-800 text-sm mt-1">
                {completePhysicalExamData.clinicalSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  );
};

export default CompletePhysicalExamSection; 