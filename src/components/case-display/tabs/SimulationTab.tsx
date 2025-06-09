'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import InfoCard, { DataRow } from '../components/InfoCard';
import DebriefingQuestionsSection from '../components/DebriefingQuestionsSection';
import CommonMistakesSection from '../components/CommonMistakesSection';

interface SimulationTabProps {
  caseData: GeneratedCaseData;
}

const SimulationTab: React.FC<SimulationTabProps> = ({ caseData }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
  };

  const handleDebriefingQuestionsGenerated = (debriefingData: any) => {
    // Update the case data with the new debriefing questions information
    // Note: This would need to be passed back to parent component to persist
    // For now, we'll just store it locally in the component
  };

  const handleCommonMistakesGenerated = (mistakesData: any) => {
    // Update the case data with the new common mistakes information
    // Note: This would need to be passed back to parent component to persist
    // For now, we'll just store it locally in the component
  };

  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <InfoCard title="Learning Objectives">
        <div className="space-y-3">
          {caseData.simulation?.learningObjectives?.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-900 flex-1 pt-1">{objective}</p>
            </div>
          )) || (
            <p className="text-gray-500 italic">No learning objectives specified</p>
          )}
        </div>
      </InfoCard>

      {/* Competency Areas */}
      <InfoCard title="Competency Areas">
        <div className="space-y-6">
          {caseData.simulation?.competencyAreas?.map((competency, index) => (
            <div key={index} className="space-y-0">
              <DataRow 
                label="Domain" 
                value={
                  <div className="flex items-center">
                    <span className="mr-2">
                      {competency.domain === 'Assessment' && '🔍'}
                      {competency.domain === 'Communication' && '💬'}
                      {competency.domain === 'Clinical Reasoning' && '🧠'}
                      {competency.domain === 'Technical Skills' && '🛠️'}
                      {competency.domain === 'Teamwork' && '👥'}
                    </span>
                    <span className="font-medium text-gray-900">{competency.domain}</span>
                  </div>
                }
              />
              
              <DataRow 
                label="Specific Skills" 
                value={
                  competency.specificSkills && competency.specificSkills.length > 0 ? (
                    <ul className="space-y-1">
                      {competency.specificSkills.map((skill, skillIndex) => (
                        <li key={skillIndex} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-gray-900 text-sm leading-relaxed">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 italic text-sm">No specific skills listed</span>
                  )
                }
              />
              
              <DataRow 
                label="Assessment Criteria" 
                value={
                  competency.assessmentCriteria && competency.assessmentCriteria.length > 0 ? (
                    <ul className="space-y-1">
                      {competency.assessmentCriteria.map((criteria, criteriaIndex) => (
                        <li key={criteriaIndex} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-900 text-sm leading-relaxed">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 italic text-sm">No assessment criteria listed</span>
                  )
                }
              />
              
              {index < (caseData.simulation?.competencyAreas?.length || 0) - 1 && (
                <div className="border-b border-gray-200 my-6"></div>
              )}
            </div>
          )) || (
            <p className="text-gray-500 italic">No competency areas specified</p>
          )}
        </div>
      </InfoCard>

      {/* Core Assessment */}
      <InfoCard title="Core Assessment">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Actions */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <span className="mr-2">⚡</span>
              Critical Actions
            </h4>
            <ul className="space-y-2">
              {caseData.simulation?.coreAssessment?.criticalActions?.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-red-700 text-sm font-medium leading-relaxed">{action}</span>
                </li>
              )) || (
                <li className="text-red-600 italic text-sm">No critical actions specified</li>
              )}
            </ul>
          </div>

          {/* Performance Indicators */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Performance Indicators
            </h4>
            <ul className="space-y-2">
              {caseData.simulation?.coreAssessment?.performanceIndicators?.map((indicator, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-blue-700 text-sm leading-relaxed">{indicator}</span>
                </li>
              )) || (
                <li className="text-blue-600 italic text-sm">No performance indicators specified</li>
              )}
            </ul>
          </div>

          {/* Safety Considerations */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">🛡️</span>
              Safety Considerations
            </h4>
            <ul className="space-y-2">
              {caseData.simulation?.coreAssessment?.safetyConsiderations?.map((safety, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-yellow-700 text-sm font-medium leading-relaxed">{safety}</span>
                </li>
              )) || (
                <li className="text-yellow-600 italic text-sm">No safety considerations specified</li>
              )}
            </ul>
          </div>
        </div>
      </InfoCard>

      {/* On-Demand Content Sections */}
      <div className="space-y-6">
        <OnDemandSection
          id="teaching-plan"
          title="Teaching Plan"
          description="Detailed instructor facilitation guide and timing"
          content={onDemandContent['teaching-plan']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate a detailed teaching plan with instructor facilitation guide, timing, and key teaching points"
        />

        <OnDemandSection
          id="assessment-rubric"
          title="Assessment Rubric"
          description="Detailed scoring criteria and performance benchmarks"
          content={onDemandContent['assessment-rubric']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate a comprehensive assessment rubric with scoring criteria, performance levels, and benchmarks"
        />

        <DebriefingQuestionsSection
          caseData={caseData}
          onContentGenerated={handleDebriefingQuestionsGenerated}
        />

        <OnDemandSection
          id="equipment-list"
          title="Equipment List"
          description="Required materials, setup instructions, and props"
          content={onDemandContent['equipment-list']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate a comprehensive equipment list with setup instructions and required materials"
        />

        <OnDemandSection
          id="actor-instructions"
          title="Actor Instructions"
          description="Standardized patient guidance and role-playing notes"
          content={onDemandContent['actor-instructions']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate detailed instructions for standardized patients or actors including role-playing guidance"
        />

        <CommonMistakesSection
          caseData={caseData}
          onContentGenerated={handleCommonMistakesGenerated}
        />
      </div>
    </div>
  );
};

export default SimulationTab; 