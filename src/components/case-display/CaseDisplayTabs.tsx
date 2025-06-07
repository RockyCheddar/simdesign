'use client';

import React, { useState } from 'react';
import { SimulationCase } from '@/types';
import { GeneratedCaseData } from '@/types/caseCreation';
import { saveCase } from '@/utils/caseStorage';
import OverviewTab from './tabs/OverviewTab';
import PatientTab from './tabs/PatientTab';
import PresentationTab from './tabs/PresentationTab';
import TreatmentTab from './tabs/TreatmentTab';
import ProgressionTab from './tabs/ProgressionTab';
import SimulationTab from './tabs/SimulationTab';
import RawOutputTab from './tabs/RawOutputTab';

interface CaseDisplayTabsProps {
  caseData: SimulationCase;
  caseTitle?: string;
  caseId?: string;
  onCaseUpdate?: (updatedCase: SimulationCase) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'patient', label: 'Patient', icon: '👤' },
  { id: 'presentation', label: 'Presentation', icon: '🩺' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'progression', label: 'Progression', icon: '📈' },
  { id: 'simulation', label: 'Simulation', icon: '🎯' },
  { id: 'raw', label: 'Raw Output', icon: '📄' },
];

// Fallback conversion for older cases without originalGeneratedData
const convertSimulationCaseToGenerated = (simCase: SimulationCase): GeneratedCaseData => {
  return {
    overview: {
      caseTitle: simCase.title,
      caseSummary: simCase.description,
      learningObjectives: simCase.learningObjectives,
      patientBasics: {
        name: simCase.patientInfo.name,
        age: simCase.patientInfo.age,
        gender: simCase.patientInfo.gender as 'male' | 'female' | 'other',
        race: 'Not specified'
      },
      clinicalSetting: {
        location: 'Hospital',
        timeOfDay: 'Not specified',
        acuity: 'medium' as const,
        environmentalFactors: 'Standard clinical environment'
      }
    },
    patient: {
      demographics: {
        fullName: simCase.patientInfo.name,
        age: simCase.patientInfo.age,
        gender: simCase.patientInfo.gender as 'male' | 'female' | 'other',
        weight: simCase.patientInfo.weight,
        height: simCase.patientInfo.height,
        BMI: Math.round((simCase.patientInfo.weight / Math.pow(simCase.patientInfo.height / 100, 2)) * 10) / 10
      },
      chiefComplaint: simCase.patientInfo.chiefComplaint,
      historyPresentIllness: {
        onset: 'Not specified',
        duration: 'Not specified', 
        severity: 'Not specified',
        associatedSymptoms: [],
        timeline: simCase.scenario.initialPresentation
      },
      currentMedications: simCase.patientInfo.medications.map(med => ({
        name: med,
        dose: 'Not specified',
        frequency: 'Not specified',
        indication: 'Not specified'
      }))
    },
    presentation: {
      vitalSigns: {
        bloodPressure: {
          systolic: simCase.scenario.vitalSigns.bloodPressure.systolic,
          diastolic: simCase.scenario.vitalSigns.bloodPressure.diastolic,
          unit: 'mmHg',
          normalRange: '90-140/60-90',
          status: 'normal',
          colorCode: 'green',
          displaySize: 'large bold numbers for card display'
        },
        heartRate: {
          value: simCase.scenario.vitalSigns.heartRate,
          unit: 'bpm',
          normalRange: '60-100',
          status: 'normal',
          colorCode: 'green',
          displaySize: 'large bold numbers for card display'
        },
        respiratoryRate: {
          value: simCase.scenario.vitalSigns.respiratoryRate,
          unit: 'breaths/min',
          normalRange: '12-20',
          status: 'normal', 
          colorCode: 'green',
          displaySize: 'large bold numbers for card display'
        },
        temperature: {
          value: simCase.scenario.vitalSigns.temperature,
          unit: '°F',
          normalRange: '97.0-99.5',
          status: 'normal',
          colorCode: 'green',
          displaySize: 'large bold numbers for card display'
        },
        oxygenSaturation: {
          value: simCase.scenario.vitalSigns.oxygenSaturation,
          unit: '%',
          normalRange: '95-100',
          status: 'normal',
          colorCode: 'green',
          displaySize: 'large bold numbers for card display',
          oxygenSupport: 'Room air'
        }
      },
      physicalExamFindings: {
        general: simCase.scenario.physicalExam.general,
        primarySystem: 'General assessment',
        keyAbnormalities: [],
        normalFindings: Object.entries(simCase.scenario.physicalExam).map(([key, value]) => `${key}: ${value}`)
      }
    },
    treatment: {
      initialInterventions: [],
      treatmentPlan: {
        immediate: [],
        shortTerm: [],
        monitoring: []
      },
      scenarioProgression: {
        phase1: 'Initial assessment',
        phase2: 'Intervention phase',
        phase3: 'Resolution phase',
        endPoint: 'Case completion'
      }
    },
    simulation: {
      learningObjectives: simCase.learningObjectives,
      competencyAreas: [],
      coreAssessment: {
        criticalActions: [],
        performanceIndicators: [],
        safetyConsiderations: []
      }
    },
    // Smart defaults and on-demand content
    smartDefaults: {},
    onDemandOptions: {}
  };
};

const CaseDisplayTabs: React.FC<CaseDisplayTabsProps> = ({ caseData, caseTitle, caseId, onCaseUpdate }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Make displayData stateful so it can be updated
  const [displayData, setDisplayData] = useState<GeneratedCaseData>(() => {
    return caseData.originalGeneratedData || convertSimulationCaseToGenerated(caseData);
  });

  // Handler to update the case data when on-demand content is generated
  const handleCaseDataUpdate = (updatedCaseData: GeneratedCaseData) => {
    setDisplayData(updatedCaseData);
    
    // If we have a caseId, persist the updated data to storage
    if (caseId && onCaseUpdate) {
      try {
        const updatedCase: SimulationCase = {
          ...caseData,
          originalGeneratedData: updatedCaseData,
          updatedAt: new Date()
        };
        
        const saved = saveCase(updatedCase);
        if (saved) {
          onCaseUpdate(updatedCase);
          console.log('✅ Case successfully persisted with generated content');
        } else {
          console.error('❌ Failed to persist case updates');
        }
      } catch (error) {
        console.error('❌ Error persisting case updates:', error);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab caseData={displayData} onCaseDataUpdate={handleCaseDataUpdate} />;
      case 'patient':
        return <PatientTab caseData={displayData} onCaseDataUpdate={handleCaseDataUpdate} />;
      case 'presentation':
        return <PresentationTab caseData={displayData} />;
      case 'treatment':
        return <TreatmentTab caseData={displayData} />;
      case 'progression':
        return <ProgressionTab caseData={displayData} />;
      case 'simulation':
        return <SimulationTab caseData={displayData} />;
      case 'raw':
        return <RawOutputTab caseData={displayData} />;
      default:
        return <OverviewTab caseData={displayData} onCaseDataUpdate={handleCaseDataUpdate} />;
    }
  };

  return (
    <div className="mx-auto p-6" style={{ maxWidth: '992px' }}>
      {/* Header with Case Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {caseTitle || displayData.overview?.caseTitle || 'Healthcare Simulation Case'}
        </h1>
        <p className="text-gray-600">
          {displayData.overview?.caseSummary || 'Generated healthcare simulation case for educational purposes'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative flex flex-col items-center py-4 px-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 hover:shadow-md
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="text-2xl mb-2">{tab.icon}</span>
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CaseDisplayTabs; 