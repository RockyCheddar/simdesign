'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import InfoCard from '../components/InfoCard';

interface PatientTabProps {
  caseData: GeneratedCaseData;
}

const PatientTab: React.FC<PatientTabProps> = ({ caseData }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
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
      <InfoCard title="Patient Demographics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name:</span>
              <span className="font-semibold text-gray-900">
                {demographics?.fullName || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Age:</span>
              <span className="font-medium text-gray-900">
                {demographics?.age ? `${demographics.age} years old` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gender:</span>
              <span className="font-medium text-gray-900 capitalize">
                {demographics?.gender || 'Not specified'}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Weight:</span>
              <span className="font-medium text-gray-900">
                {demographics?.weight ? `${demographics.weight} kg` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Height:</span>
              <span className="font-medium text-gray-900">
                {demographics?.height ? `${demographics.height} cm` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">BMI:</span>
              <span className={`font-medium ${bmiStatus?.color || 'text-gray-900'}`}>
                {bmi ? `${bmi} - ${bmiStatus?.status}` : 'Not calculated'}
              </span>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Chief Complaint Card */}
      <InfoCard title="Chief Complaint">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-gray-900 italic text-lg">
            &ldquo;{caseData.patient?.chiefComplaint || 'No chief complaint recorded'}&rdquo;
          </p>
        </div>
      </InfoCard>

      {/* History of Present Illness Card */}
      <InfoCard title="History of Present Illness">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Onset:</span>
              <p className="font-medium text-gray-900">
                {caseData.patient?.historyPresentIllness?.onset || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Duration:</span>
              <p className="font-medium text-gray-900">
                {caseData.patient?.historyPresentIllness?.duration || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Severity:</span>
              <p className="font-medium text-gray-900">
                {caseData.patient?.historyPresentIllness?.severity || 'Not specified'}
              </p>
            </div>
          </div>
          
          {caseData.patient?.historyPresentIllness?.timeline && (
            <div>
              <span className="text-gray-500 text-sm">Timeline:</span>
              <p className="text-gray-900 mt-1">
                {caseData.patient.historyPresentIllness.timeline}
              </p>
            </div>
          )}

          {caseData.patient?.historyPresentIllness?.associatedSymptoms && (
            <div>
              <span className="text-gray-500 text-sm">Associated Symptoms:</span>
              <ul className="mt-2 space-y-1">
                {caseData.patient.historyPresentIllness.associatedSymptoms.map((symptom, index) => (
                  <li key={index} className="flex items-center text-gray-900">
                    <span className="text-blue-500 mr-2">•</span>
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
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
        <OnDemandSection
          id="detailed-social-history"
          title="Detailed Social History"
          description="Family dynamics, work environment, lifestyle factors"
          content={onDemandContent['detailed-social-history']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate detailed social history including family dynamics, work environment, and lifestyle factors for this patient"
        />

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