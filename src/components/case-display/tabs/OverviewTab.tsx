'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import InfoCard, { DataRow } from '../components/InfoCard';

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
      <InfoCard 
        title="Case Information" 
        subtitle="Overview and essential details of the simulation case."
      >
        <div className="space-y-0">
          <DataRow 
            label="Case Title" 
            value={caseData.overview?.caseTitle || 'Not specified'} 
          />
          <DataRow 
            label="Case Summary" 
            value={caseData.overview?.caseSummary || 'No summary available'} 
          />
          <DataRow 
            label="Clinical Setting" 
            value={`${caseData.overview?.clinicalSetting?.location || 'Not specified'} - ${caseData.overview?.clinicalSetting?.acuity || 'Standard'} acuity`} 
          />
          <DataRow 
            label="Time of Day" 
            value={caseData.overview?.clinicalSetting?.timeOfDay || 'Not specified'} 
          />
          <DataRow 
            label="Environmental Factors" 
            value={caseData.overview?.clinicalSetting?.environmentalFactors || 'Standard clinical environment'} 
          />
        </div>
      </InfoCard>

      {/* Learning Objectives Card */}
      <InfoCard 
        title="Learning Objectives" 
        subtitle="Educational goals and outcomes for this simulation case."
      >
        <div className="space-y-3">
          {caseData.overview?.learningObjectives?.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3 py-2">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-900 flex-1 text-sm leading-relaxed">{objective}</p>
            </div>
          )) || (
            <p className="text-gray-500 italic text-sm">No learning objectives available</p>
          )}
        </div>
      </InfoCard>

      {/* Patient Basics Card */}
      <InfoCard 
        title="Patient Information" 
        subtitle="Basic demographic and identifying information."
      >
        <div className="space-y-0">
          <DataRow 
            label="Full Name" 
            value={caseData.overview?.patientBasics?.name || 'Not specified'} 
          />
          <DataRow 
            label="Age" 
            value={caseData.overview?.patientBasics?.age ? `${caseData.overview.patientBasics.age} years old` : 'Not specified'} 
          />
          <DataRow 
            label="Gender" 
            value={caseData.overview?.patientBasics?.gender ? 
              caseData.overview.patientBasics.gender.charAt(0).toUpperCase() + 
              caseData.overview.patientBasics.gender.slice(1) : 'Not specified'} 
          />
          <DataRow 
            label="Race/Ethnicity" 
            value={caseData.overview?.patientBasics?.race || 'Not specified'} 
          />
        </div>
      </InfoCard>

      {/* Clinical Setting Details */}
      {caseData.overview?.clinicalSetting && (
        <InfoCard 
          title="Clinical Setting" 
          subtitle="Environmental context and care setting details."
        >
          <div className="space-y-0">
            <DataRow 
              label="Location" 
              value={caseData.overview.clinicalSetting.location || 'Not specified'} 
            />
            <DataRow 
              label="Acuity Level" 
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  caseData.overview.clinicalSetting.acuity === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : caseData.overview.clinicalSetting.acuity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {caseData.overview.clinicalSetting.acuity?.charAt(0).toUpperCase() + 
                   caseData.overview.clinicalSetting.acuity?.slice(1) || 'Standard'}
                </span>
              } 
            />
            <DataRow 
              label="Time of Day" 
              value={caseData.overview.clinicalSetting.timeOfDay || 'Not specified'} 
            />
            <DataRow 
              label="Environmental Factors" 
              value={caseData.overview.clinicalSetting.environmentalFactors || 'Standard clinical environment'} 
            />
          </div>
        </InfoCard>
      )}

      {/* On-Demand Content Sections */}
      <OnDemandSection
        id="case-background"
        title="Additional Case Background"
        description="Generate additional context and background information for this case"
        content={onDemandContent['case-background']}
        onContentGenerated={handleContentGenerated}
        prompt="Generate additional context and background information for this healthcare simulation case"
      />

      <OnDemandSection
        id="pre-simulation-briefing"
        title="Pre-Simulation Briefing"
        description="Generate detailed briefing materials for facilitators and participants"
        content={onDemandContent['pre-simulation-briefing']}
        onContentGenerated={handleContentGenerated}
        prompt="Generate detailed briefing materials for facilitators and participants for this healthcare simulation case"
      />
    </div>
  );
};

export default OverviewTab; 