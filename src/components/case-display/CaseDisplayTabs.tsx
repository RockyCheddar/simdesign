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
    <div className="max-w-7xl mx-auto p-6">
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
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CaseDisplayTabs; 