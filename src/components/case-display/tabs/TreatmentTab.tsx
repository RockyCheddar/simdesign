'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import ComplicationScenariosSection from '../components/ComplicationScenariosSection';
import InfoCard from '../components/InfoCard';

interface TreatmentTabProps {
  caseData: GeneratedCaseData;
  onCaseDataUpdate?: (updatedCaseData: GeneratedCaseData) => void;
}

const TreatmentTab: React.FC<TreatmentTabProps> = ({ caseData, onCaseDataUpdate }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
  };

  const handleComplicationScenariosGenerated = (complicationData: any) => {
    // Update the case data with the new complication scenarios information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'complication-scenarios': JSON.stringify(complicationData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  return (
    <div className="space-y-8">
      {/* Initial Interventions */}
      <InfoCard title="Initial Interventions">
        <div className="space-y-6">
          {caseData.treatment?.initialInterventions?.map((intervention, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {intervention.intervention}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Rationale:</span>
                  <p className="text-gray-600 mt-1">{intervention.rationale}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Timing:</span>
                  <p className="text-gray-600 mt-1">{intervention.timing}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expected Outcome:</span>
                  <p className="text-gray-600 mt-1">{intervention.expectedOutcome}</p>
                </div>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 italic">No initial interventions specified</p>
          )}
        </div>
      </InfoCard>

      {/* Treatment Plan - Three Column Grid */}
      <InfoCard title="Treatment Plan">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Immediate Actions */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <span className="mr-2">🚨</span>
              Immediate (0-10 min)
            </h4>
            <ul className="space-y-2">
              {caseData.treatment?.treatmentPlan?.immediate?.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-red-700 text-sm leading-relaxed">{action}</span>
                </li>
              )) || (
                <li className="text-red-600 italic text-sm">No immediate actions specified</li>
              )}
            </ul>
          </div>

          {/* Short-term Actions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">⏱️</span>
              Short-term (10-60 min)
            </h4>
            <ul className="space-y-2">
              {caseData.treatment?.treatmentPlan?.shortTerm?.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-yellow-700 text-sm leading-relaxed">{action}</span>
                </li>
              )) || (
                <li className="text-yellow-600 italic text-sm">No short-term actions specified</li>
              )}
            </ul>
          </div>

          {/* Monitoring */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Monitoring
            </h4>
            <ul className="space-y-2">
              {caseData.treatment?.treatmentPlan?.monitoring?.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-green-700 text-sm leading-relaxed">{item}</span>
                </li>
              )) || (
                <li className="text-green-600 italic text-sm">No monitoring parameters specified</li>
              )}
            </ul>
          </div>
        </div>
      </InfoCard>



      {/* On-Demand Content Sections */}
      <div className="space-y-6">
        <OnDemandSection
          id="alternative-treatments"
          title="Alternative Treatments"
          description="Different clinical approaches and decision pathways"
          content={onDemandContent['alternative-treatments']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate alternative treatment approaches and clinical decision pathways for this case"
        />

        <ComplicationScenariosSection
          caseData={caseData}
          onContentGenerated={handleComplicationScenariosGenerated}
        />

        <OnDemandSection
          id="medication-details"
          title="Medication Details"
          description="Detailed dosing, interactions, and monitoring requirements"
          content={onDemandContent['medication-details']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate detailed medication information including dosing, drug interactions, and monitoring requirements"
        />

        <OnDemandSection
          id="discharge-planning"
          title="Discharge Planning"
          description="Post-acute care coordination and follow-up needs"
          content={onDemandContent['discharge-planning']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate discharge planning considerations including post-acute care coordination and follow-up requirements"
        />

        <OnDemandSection
          id="follow-up-care"
          title="Follow-up Care"
          description="Long-term management and monitoring plans"
          content={onDemandContent['follow-up-care']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate long-term follow-up care plans and ongoing management strategies for this patient"
        />
      </div>
    </div>
  );
};

export default TreatmentTab; 