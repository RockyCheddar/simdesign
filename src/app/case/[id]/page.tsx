'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SimulationCase } from '@/types';
import { GeneratedCaseData } from '@/types/caseCreation';
import { loadCase } from '@/utils/caseStorage';
import { toast } from 'react-hot-toast';
import CaseDisplayTabs from '@/components/case-display/CaseDisplayTabs';

const CaseViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [simulationCase, setCase] = useState<SimulationCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caseId = params.id as string;
    if (caseId) {
      const loadedCase = loadCase(caseId);
      if (loadedCase) {
        setCase(loadedCase);
      } else {
        toast.error('Case not found');
        router.push('/');
      }
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!simulationCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h1>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Convert SimulationCase to GeneratedCaseData format for CaseDisplayTabs
  const convertToGeneratedCaseData = (simCase: SimulationCase): GeneratedCaseData => {
    return {
      overview: {
        caseTitle: simCase.title,
        caseSummary: simCase.description,
        learningObjectives: simCase.learningObjectives || [],
        patientBasics: {
          name: simCase.patientInfo.name,
          age: simCase.patientInfo.age,
          gender: simCase.patientInfo.gender,
          race: 'Not specified',
        },
        clinicalSetting: {
          location: 'Clinical Setting',
          timeOfDay: 'Not specified',
          acuity: 'medium',
          environmentalFactors: 'Standard healthcare environment',
        },
      },
      patient: {
        demographics: {
          fullName: simCase.patientInfo.name,
          age: simCase.patientInfo.age,
          gender: simCase.patientInfo.gender,
          weight: simCase.patientInfo.weight,
          height: simCase.patientInfo.height,
          BMI: Math.round((simCase.patientInfo.weight / Math.pow(simCase.patientInfo.height / 100, 2)) * 10) / 10,
        },
        chiefComplaint: simCase.patientInfo.chiefComplaint || 'Chief complaint not specified',
        historyPresentIllness: {
          onset: 'Not specified',
          duration: 'Not specified',
          severity: 'Not specified',
          timeline: 'Not specified',
          associatedSymptoms: [],
        },
        currentMedications: simCase.patientInfo.medications.map(med => ({
          name: med,
          dose: 'As prescribed',
          frequency: 'As prescribed',
          indication: 'As prescribed',
        })),
      },
      presentation: {
        vitalSigns: {
          temperature: {
            value: simCase.scenario?.vitalSigns?.temperature || 98.6,
            unit: '°F',
            normalRange: '97.0-99.5°F',
            status: 'normal',
            colorCode: 'green',
            displaySize: 'large bold numbers for card display',
          },
          heartRate: {
            value: simCase.scenario?.vitalSigns?.heartRate || 80,
            unit: 'bpm',
            normalRange: '60-100 bpm',
            status: 'normal',
            colorCode: 'green',
            displaySize: 'large bold numbers for card display',
          },
          bloodPressure: {
            systolic: simCase.scenario?.vitalSigns?.bloodPressure?.systolic || 120,
            diastolic: simCase.scenario?.vitalSigns?.bloodPressure?.diastolic || 80,
            unit: 'mmHg',
            normalRange: '<120/80 mmHg',
            status: 'normal',
            colorCode: 'green',
            displaySize: 'large bold numbers for card display',
          },
          respiratoryRate: {
            value: simCase.scenario?.vitalSigns?.respiratoryRate || 16,
            unit: '/min',
            normalRange: '12-20/min',
            status: 'normal',
            colorCode: 'green',
            displaySize: 'large bold numbers for card display',
          },
          oxygenSaturation: {
            value: simCase.scenario?.vitalSigns?.oxygenSaturation || 98,
            unit: '%',
            normalRange: '95-100%',
            status: 'normal',
            colorCode: 'green',
            displaySize: 'large bold numbers for card display',
            oxygenSupport: 'Room air',
          },
        },
        physicalExamFindings: {
          general: simCase.scenario?.physicalExam?.general || 'Patient appears comfortable',
          primarySystem: 'Cardiovascular',
          keyAbnormalities: [],
          normalFindings: [
            simCase.scenario?.physicalExam?.cardiovascular || 'Regular rate and rhythm',
            simCase.scenario?.physicalExam?.respiratory || 'Clear to auscultation bilaterally',
            simCase.scenario?.physicalExam?.neurological || 'Alert and oriented',
          ],
        },
      },
      treatment: {
        initialInterventions: [
          {
            intervention: 'Initial Assessment',
            rationale: 'Establish baseline and identify immediate concerns',
            timing: 'Immediate',
            expectedOutcome: 'Complete initial evaluation',
          },
        ],
        treatmentPlan: {
          immediate: ['Monitor vital signs', 'Assess patient comfort'],
          shortTerm: ['Continue monitoring', 'Reassess as needed'],
          monitoring: ['Continuous vital sign monitoring', 'Patient response assessment'],
        },
        scenarioProgression: {
          phase1: 'Initial presentation and assessment',
          phase2: 'Intervention and monitoring',
          phase3: 'Evaluation and follow-up',
          endPoint: 'Case resolution',
        },
      },
      simulation: {
        learningObjectives: simCase.learningObjectives || [],
        competencyAreas: [
          {
            domain: 'Assessment',
            specificSkills: ['Patient evaluation', 'Clinical reasoning'],
            assessmentCriteria: ['Accurate assessment', 'Appropriate prioritization'],
          },
          {
            domain: 'Communication',
            specificSkills: ['Patient interaction', 'Team communication'],
            assessmentCriteria: ['Clear communication', 'Professional demeanor'],
          },
        ],
        coreAssessment: {
          criticalActions: ['Complete initial assessment', 'Monitor patient status'],
          performanceIndicators: ['Timely assessment', 'Appropriate interventions'],
          safetyConsiderations: ['Patient safety', 'Infection control'],
        },
      },
      smartDefaults: {},
      onDemandOptions: {},
    };
  };

  const generatedCaseData = convertToGeneratedCaseData(simulationCase);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                simulationCase.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                simulationCase.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {simulationCase.difficulty}
              </span>
              <span className="text-gray-500">{simulationCase.duration} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Display with Tabs */}
      <CaseDisplayTabs 
        caseData={generatedCaseData} 
        caseTitle={simulationCase.title}
      />
    </div>
  );
};

export default CaseViewPage; 