'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';
import { Clock, AlertTriangle, FileText, Stethoscope, Calendar, User } from 'lucide-react';

interface ImagingStudy {
  id: string;
  type: 'X-ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Nuclear Medicine' | 'Fluoroscopy';
  bodyPart: string;
  studyName: string;
  orderDateTime: string;
  completedDateTime: string;
  urgency: 'STAT' | 'Urgent' | 'Routine';
  indication: string;
  technique: string;
  contrast: {
    used: boolean;
    type: string | null;
    amount: string | null;
  };
  findings: string;
  impression: string;
  clinicalCorrelation: string;
  recommendations: string;
  radiologist: string;
  transcriptionDate: string;
}

interface ImagingStudiesData {
  studies: ImagingStudy[];
  clinicalRationale: string;
  priorityOrder: string[];
  totalStudies: number;
  emergentFindings: string[];
  followUpRecommendations: string[];
}

interface ImagingStudiesSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (imagingStudiesData: ImagingStudiesData) => void;
}

const ImagingStudiesSection: React.FC<ImagingStudiesSectionProps> = ({ caseData, onContentGenerated }) => {
  // Check if imaging studies data already exists in the case
  const existingImagingStudiesData = caseData.onDemandOptions?.['imaging-studies'] 
    ? JSON.parse(caseData.onDemandOptions['imaging-studies']) as ImagingStudiesData
    : null;
    
  const [imagingStudiesData, setImagingStudiesData] = useState<ImagingStudiesData | null>(existingImagingStudiesData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudies, setExpandedStudies] = useState<Record<string, boolean>>({});
  const [subGeneratorStates, setSubGeneratorStates] = useState({
    additionalXray: false,
    additionalCT: false,
    additionalMRI: false,
    additionalUltrasound: false
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-imaging-studies', {
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
        throw new Error(errorData.error || 'Failed to generate imaging studies');
      }

      const { imagingStudiesData: generatedData } = await response.json();
      setImagingStudiesData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate imaging studies');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSpecificStudy = async (studyType: string) => {
    if (!imagingStudiesData || !onContentGenerated) return;
    
    const stateKey = `additional${studyType}` as keyof typeof subGeneratorStates;
    setSubGeneratorStates(prev => ({ ...prev, [stateKey]: true }));
    
    try {
      const response = await fetch('/api/ai/generate-specific-imaging-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caseData, 
          studyType,
          existingStudies: imagingStudiesData.studies 
        })
      });
      
      if (response.ok) {
        const { newStudyData } = await response.json();
        const updatedData = {
          ...imagingStudiesData,
          studies: [...imagingStudiesData.studies, newStudyData],
          totalStudies: imagingStudiesData.totalStudies + 1
        };
        setImagingStudiesData(updatedData);
        onContentGenerated(updatedData);
      }
    } catch (error) {
      console.error(`Error generating additional ${studyType}:`, error);
    } finally {
      setSubGeneratorStates(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  const toggleStudy = (studyId: string) => {
    setExpandedStudies(prev => ({
      ...prev,
      [studyId]: !prev[studyId]
    }));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'STAT': return 'bg-red-100 text-red-800 border-red-200';
      case 'Urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStudyTypeIcon = (type: string) => {
    switch (type) {
      case 'X-ray': return '🩻';
      case 'CT': return '🔍';
      case 'MRI': return '🧲';
      case 'Ultrasound': return '📡';
      case 'Nuclear Medicine': return '☢️';
      case 'Fluoroscopy': return '📺';
      default: return '🏥';
    }
  };

  const getButtonState = () => {
    if (isGenerating) {
      return {
        text: 'Generating Imaging Studies...',
        className: 'bg-gray-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (imagingStudiesData) {
      return {
        text: 'Generated ✓',
        className: 'bg-green-600 cursor-default',
        disabled: true,
      };
    }
    return {
      text: 'Generate Imaging Studies',
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Imaging Studies</span>
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Radiological examinations with detailed findings and interpretations
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

        {imagingStudiesData && (
          <div className="space-y-6">
            {/* Clinical Rationale */}
            <InfoCard title="Clinical Rationale" className="border-blue-100 bg-blue-50">
              <p className="text-gray-700">{imagingStudiesData.clinicalRationale}</p>
            </InfoCard>

            {/* Emergency Findings Alert */}
            {imagingStudiesData.emergentFindings.length > 0 && 
             !imagingStudiesData.emergentFindings.includes('None identified') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="text-red-800 font-semibold">Critical Findings</h5>
                    <ul className="mt-2 space-y-1">
                      {imagingStudiesData.emergentFindings.map((finding, index) => (
                        <li key={index} className="text-red-700 text-sm">• {finding}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Studies */}
            <div className="space-y-4">
              {imagingStudiesData.studies.map((study, index) => (
                <div key={study.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleStudy(study.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStudyTypeIcon(study.type)}</span>
                        <div>
                          <h5 className="font-medium text-gray-900">{study.studyName}</h5>
                          <p className="text-sm text-gray-600">{study.bodyPart}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(study.urgency)}`}>
                          {study.urgency}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {expandedStudies[study.id] ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedStudies[study.id] && (
                    <div className="p-6 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Study Details */}
                        <div className="space-y-4">
                          <DataRow label="Study Type" value={study.type} />
                          <DataRow label="Indication" value={study.indication} />
                          <DataRow 
                            label="Ordered" 
                            value={
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{study.orderDateTime}</span>
                              </div>
                            } 
                          />
                          <DataRow 
                            label="Completed" 
                            value={
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{study.completedDateTime}</span>
                              </div>
                            } 
                          />
                          {study.contrast.used && (
                            <DataRow 
                              label="Contrast" 
                              value={`${study.contrast.type}${study.contrast.amount ? ` (${study.contrast.amount})` : ''}`} 
                            />
                          )}
                          <DataRow label="Technique" value={study.technique} />
                        </div>

                        {/* Radiologist Info */}
                        <div className="space-y-4">
                          <DataRow 
                            label="Radiologist" 
                            value={
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{study.radiologist}</span>
                              </div>
                            } 
                          />
                          <DataRow 
                            label="Transcribed" 
                            value={study.transcriptionDate} 
                          />
                        </div>
                      </div>

                      {/* Report Sections */}
                      <div className="mt-6 space-y-6">
                        <div>
                          <h6 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Findings</h6>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{study.findings}</p>
                          </div>
                        </div>

                        <div>
                          <h6 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Impression</h6>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-gray-800 font-medium leading-relaxed">{study.impression}</p>
                          </div>
                        </div>

                        <div>
                          <h6 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Clinical Correlation</h6>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-gray-800 leading-relaxed">{study.clinicalCorrelation}</p>
                          </div>
                        </div>

                        {study.recommendations && (
                          <div>
                            <h6 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Recommendations</h6>
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <p className="text-gray-800 leading-relaxed">{study.recommendations}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Follow-up Recommendations */}
            {imagingStudiesData.followUpRecommendations.length > 0 && 
             !imagingStudiesData.followUpRecommendations.includes('None at this time') && (
              <InfoCard title="Follow-up Recommendations" className="border-yellow-100 bg-yellow-50">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {imagingStudiesData.followUpRecommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* Additional Study Generators */}
            <div className="border-t border-gray-200 pt-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Add Specific Studies</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'Xray', label: 'X-ray', icon: '🩻' },
                  { type: 'CT', label: 'CT Scan', icon: '🔍' },
                  { type: 'MRI', label: 'MRI', icon: '🧲' },
                  { type: 'Ultrasound', label: 'Ultrasound', icon: '📡' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleAddSpecificStudy(type)}
                    disabled={subGeneratorStates[`additional${type}` as keyof typeof subGeneratorStates]}
                    className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-800 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subGeneratorStates[`additional${type}` as keyof typeof subGeneratorStates] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <span>{icon}</span>
                        <span>Add {label}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagingStudiesSection; 