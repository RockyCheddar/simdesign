'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import InfoCard from '../components/InfoCard';

interface SimulationTabProps {
  caseData: GeneratedCaseData;
}

const SimulationTab: React.FC<SimulationTabProps> = ({ caseData }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
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
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">
                  {competency.domain === 'Assessment' && '🔍'}
                  {competency.domain === 'Communication' && '💬'}
                  {competency.domain === 'Clinical Reasoning' && '🧠'}
                  {competency.domain === 'Technical Skills' && '🛠️'}
                  {competency.domain === 'Teamwork' && '👥'}
                </span>
                {competency.domain}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-2">Specific Skills</h5>
                  <ul className="space-y-1">
                    {competency.specificSkills?.map((skill, skillIndex) => (
                      <li key={skillIndex} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{skill}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 italic text-sm">No specific skills listed</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-2">Assessment Criteria</h5>
                  <ul className="space-y-1">
                    {competency.assessmentCriteria?.map((criteria, criteriaIndex) => (
                      <li key={criteriaIndex} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700 text-sm">{criteria}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 italic text-sm">No assessment criteria listed</li>
                    )}
                  </ul>
                </div>
              </div>
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
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  <span className="text-red-700 text-sm font-medium">{action}</span>
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
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span className="text-blue-700 text-sm">{indicator}</span>
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
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span className="text-yellow-700 text-sm font-medium">{safety}</span>
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

        <OnDemandSection
          id="debriefing-questions"
          title="Debriefing Questions"
          description="Post-simulation discussion prompts and reflection guides"
          content={onDemandContent['debriefing-questions']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate structured debriefing questions for post-simulation discussion and reflection"
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

        <OnDemandSection
          id="common-mistakes"
          title="Common Mistakes"
          description="Typical errors and correction strategies for instructors"
          content={onDemandContent['common-mistakes']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate common mistakes learners make in this scenario and strategies for instructors to address them"
        />
      </div>
    </div>
  );
};

export default SimulationTab; 