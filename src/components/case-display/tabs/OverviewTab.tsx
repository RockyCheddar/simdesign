'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import InfoCard from '../components/InfoCard';

interface OverviewTabProps {
  caseData: GeneratedCaseData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ caseData }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
  };

  return (
    <div className="space-y-8">
      {/* Case Information Card */}
      <InfoCard title="Case Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {caseData.overview?.caseTitle || 'Case Title'}
            </h3>
            <p className="text-gray-600 mb-6">
              {caseData.overview?.caseSummary || 'Case summary not available'}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Clinical Setting</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium text-gray-900">
                  {caseData.overview?.clinicalSetting?.location || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time of Day:</span>
                <span className="font-medium text-gray-900">
                  {caseData.overview?.clinicalSetting?.timeOfDay || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Acuity Level:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  caseData.overview?.clinicalSetting?.acuity === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : caseData.overview?.clinicalSetting?.acuity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {caseData.overview?.clinicalSetting?.acuity || 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Learning Objectives Card */}
      <InfoCard title="Learning Objectives">
        <div className="space-y-3">
          {caseData.overview?.learningObjectives?.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-900 flex-1">{objective}</p>
            </div>
          )) || (
            <p className="text-gray-500 italic">No learning objectives available</p>
          )}
        </div>
      </InfoCard>

      {/* Patient Basics Card */}
      <InfoCard title="Patient Basics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name:</span>
              <span className="font-semibold text-gray-900">
                {caseData.overview?.patientBasics?.name || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Age:</span>
              <span className="font-medium text-gray-900">
                {caseData.overview?.patientBasics?.age || 'Not specified'} years old
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Gender:</span>
              <span className="font-medium text-gray-900 capitalize">
                {caseData.overview?.patientBasics?.gender || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Race:</span>
              <span className="font-medium text-gray-900">
                {caseData.overview?.patientBasics?.race || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* On-Demand Content Sections */}
      <div className="space-y-6">
        <OnDemandSection
          id="case-background"
          title="Case Background"
          description="Extended clinical context and educational rationale"
          content={onDemandContent['case-background']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate extended clinical context and educational rationale for this healthcare simulation case"
        />

        <OnDemandSection
          id="educational-rationale"
          title="Educational Rationale"
          description="Why this case matters for learning outcomes"
          content={onDemandContent['educational-rationale']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate educational rationale explaining why this case matters for learning outcomes"
        />

        <OnDemandSection
          id="prerequisites"
          title="Prerequisites"
          description="Required knowledge and skills before this case"
          content={onDemandContent['prerequisites']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate prerequisites including required knowledge and skills before attempting this case"
        />
      </div>
    </div>
  );
};

export default OverviewTab; 