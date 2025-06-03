'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OverviewTab from './tabs/OverviewTab';
import PatientTab from './tabs/PatientTab';
import PresentationTab from './tabs/PresentationTab';
import TreatmentTab from './tabs/TreatmentTab';
import SimulationTab from './tabs/SimulationTab';
import RawOutputTab from './tabs/RawOutputTab';

interface CaseDisplayTabsProps {
  caseData: GeneratedCaseData;
  caseTitle?: string;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'patient', label: 'Patient', icon: '👤' },
  { id: 'presentation', label: 'Presentation', icon: '🩺' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'simulation', label: 'Simulation', icon: '🎯' },
  { id: 'raw', label: 'Raw Output', icon: '📄' },
];

const CaseDisplayTabs: React.FC<CaseDisplayTabsProps> = ({ caseData, caseTitle }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab caseData={caseData} />;
      case 'patient':
        return <PatientTab caseData={caseData} />;
      case 'presentation':
        return <PresentationTab caseData={caseData} />;
      case 'treatment':
        return <TreatmentTab caseData={caseData} />;
      case 'simulation':
        return <SimulationTab caseData={caseData} />;
      case 'raw':
        return <RawOutputTab caseData={caseData} />;
      default:
        return <OverviewTab caseData={caseData} />;
    }
  };

  return (
    <div className="mx-auto p-6" style={{ maxWidth: '992px' }}>
      {/* Header with Case Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {caseTitle || caseData.overview?.caseTitle || 'Healthcare Simulation Case'}
        </h1>
        <p className="text-gray-600">
          {caseData.overview?.caseSummary || 'Generated healthcare simulation case for educational purposes'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="grid grid-cols-6 gap-2">
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