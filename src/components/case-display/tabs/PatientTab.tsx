'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import SocialHistorySection from '../components/SocialHistorySection';
import InfoCard, { DataRow } from '../components/InfoCard';

interface PatientTabProps {
  caseData: GeneratedCaseData;
  onCaseDataUpdate?: (updatedCaseData: GeneratedCaseData) => void;
}

const PatientTab: React.FC<PatientTabProps> = ({ caseData, onCaseDataUpdate }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
  };

  const handleSocialHistoryGenerated = (socialHistoryData: any) => {
    // Update the case data with the new social history information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'detailed-social-history': JSON.stringify(socialHistoryData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { status: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { status: 'Overweight', color: 'text-yellow-600' };
    return { status: 'Obese', color: 'text-red-600' };
  };

  const demographics = caseData.patient?.demographics;
  const bmi = calculateBMI(demographics?.weight, demographics?.height);
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <div className="space-y-8">
      {/* Demographics Card */}
      <InfoCard 
        title="Patient Demographics" 
        subtitle="Physical characteristics and basic measurements."
      >
        <div className="space-y-0">
          <DataRow 
            label="Full Name" 
            value={demographics?.fullName || 'Not specified'} 
          />
          <DataRow 
            label="Age" 
            value={demographics?.age ? `${demographics.age} years old` : 'Not specified'} 
          />
          <DataRow 
            label="Gender" 
            value={demographics?.gender ? 
              demographics.gender.charAt(0).toUpperCase() + demographics.gender.slice(1) : 'Not specified'} 
          />
          <DataRow 
            label="Weight" 
            value={demographics?.weight ? `${demographics.weight} kg` : 'Not specified'} 
          />
          <DataRow 
            label="Height" 
            value={demographics?.height ? `${demographics.height} cm` : 'Not specified'} 
          />
          <DataRow 
            label="BMI" 
            value={bmi ? (
              <span className="flex items-center space-x-2">
                <span>{bmi}</span>
                {bmiStatus && (
                  <span className={`text-xs font-medium ${bmiStatus.color}`}>
                    ({bmiStatus.status})
                  </span>
                )}
              </span>
            ) : 'Not calculated'} 
          />
        </div>
      </InfoCard>

      {/* Chief Complaint Card */}
      <InfoCard 
        title="Chief Complaint" 
        subtitle="Patient's primary concern in their own words."
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.002 8.002 0 01-7.455-5.26L2 15l1.455 1.74C4.96 18.355 8.282 20 12 20c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453L4 18l-1.455-1.74C2.045 15.645 1.5 13.878 1.5 12" />
            </svg>
            <div>
              <p className="text-blue-900 font-medium text-sm">Patient states:</p>
              <p className="text-blue-800 text-sm mt-1 italic">
                "{caseData.patient?.chiefComplaint || 'Chief complaint not documented'}"
              </p>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* History of Present Illness Card */}
      <InfoCard 
        title="History of Present Illness" 
        subtitle="Timeline and details of the current condition."
      >
        <div className="space-y-0">
          <DataRow 
            label="Onset" 
            value={caseData.patient?.historyPresentIllness?.onset || 'Not specified'} 
          />
          <DataRow 
            label="Duration" 
            value={caseData.patient?.historyPresentIllness?.duration || 'Not specified'} 
          />
          <DataRow 
            label="Severity" 
            value={caseData.patient?.historyPresentIllness?.severity || 'Not specified'} 
          />
          <DataRow 
            label="Timeline" 
            value={caseData.patient?.historyPresentIllness?.timeline || 'Not specified'} 
          />
          {caseData.patient?.historyPresentIllness?.associatedSymptoms && caseData.patient.historyPresentIllness.associatedSymptoms.length > 0 && (
            <DataRow 
              label="Associated Symptoms" 
              value={
                <ul className="space-y-1">
                  {caseData.patient.historyPresentIllness.associatedSymptoms.map((symptom, index) => (
                    <li key={index} className="flex items-center text-gray-900">
                      <span className="text-blue-500 mr-2">•</span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              } 
            />
          )}
        </div>
      </InfoCard>

      {/* Current Medications Card */}
      <InfoCard title="Current Medications">
        {caseData.patient?.currentMedications && caseData.patient.currentMedications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indication
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caseData.patient.currentMedications.map((medication, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medication.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medication.dose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medication.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medication.indication}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No current medications recorded</p>
        )}
      </InfoCard>

      {/* On-Demand Content Sections */}
      <div className="space-y-6">
        <SocialHistorySection caseData={caseData} onContentGenerated={handleSocialHistoryGenerated} />

        <OnDemandSection
          id="past-medical-history"
          title="Past Medical History"
          description="Complete medical timeline and previous conditions"
          content={onDemandContent['past-medical-history']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate comprehensive past medical history including previous conditions, surgeries, and hospitalizations"
        />

        <OnDemandSection
          id="family-history"
          title="Family History"
          description="Genetic and familial risk factors"
          content={onDemandContent['family-history']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate family history including genetic predispositions and familial risk factors relevant to this case"
        />

        <OnDemandSection
          id="review-of-systems"
          title="Review of Systems"
          description="Comprehensive symptom assessment by body system"
          content={onDemandContent['review-of-systems']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate comprehensive review of systems assessment organized by body systems"
        />
      </div>
    </div>
  );
};

export default PatientTab; 