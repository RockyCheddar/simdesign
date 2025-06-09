'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import OnDemandSection from '../components/OnDemandSection';
import CompletePhysicalExamSection from '../components/CompletePhysicalExamSection';
import ClinicalNarrativeSection from '../ClinicalNarrativeSection';
import LaboratoryResultsSection from '../components/LaboratoryResultsSection';
import ImagingStudiesSection from '../components/ImagingStudiesSection';
import InfoCard, { DataRow } from '../components/InfoCard';
import VitalSignCard from '../components/VitalSignCard';

interface PresentationTabProps {
  caseData: GeneratedCaseData;
  onCaseDataUpdate?: (updatedCaseData: GeneratedCaseData) => void;
}

const PresentationTab: React.FC<PresentationTabProps> = ({ caseData, onCaseDataUpdate }) => {
  const [onDemandContent, setOnDemandContent] = useState<Record<string, string>>({});
  const [isGeneratingClinicalNarrative, setIsGeneratingClinicalNarrative] = useState(false);

  const handleContentGenerated = (sectionId: string, content: string) => {
    setOnDemandContent(prev => ({ ...prev, [sectionId]: content }));
  };

  const handleCompletePhysicalExamGenerated = (completePhysicalExamData: any) => {
    // Update the case data with the new complete physical exam information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'complete-physical-exam': JSON.stringify(completePhysicalExamData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  const handleClinicalNarrativeGenerated = (clinicalNarrativeData: any) => {
    // Update the case data with the new clinical narrative information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'clinical-narrative': JSON.stringify(clinicalNarrativeData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  const handleLaboratoryResultsGenerated = (laboratoryResultsData: any) => {
    // Update the case data with the new laboratory results information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'laboratory-results': JSON.stringify(laboratoryResultsData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  const handleImagingStudiesGenerated = (imagingStudiesData: any) => {
    // Update the case data with the new imaging studies information
    const updatedCaseData = {
      ...caseData,
      onDemandOptions: {
        ...caseData.onDemandOptions,
        'imaging-studies': JSON.stringify(imagingStudiesData)
      }
    };
    
    // Call the parent callback if available
    if (onCaseDataUpdate) {
      onCaseDataUpdate(updatedCaseData);
    }
  };

  const vitalSigns = caseData.presentation?.vitalSigns;

  return (
    <div className="space-y-8">
      {/* Vital Signs Grid */}
      <InfoCard title="Vital Signs">
        <div className="grid grid-cols-5 gap-4">
          {vitalSigns?.temperature && (
            <VitalSignCard
              label="Temperature"
              value={vitalSigns.temperature.value}
              unit={vitalSigns.temperature.unit}
              normalRange={vitalSigns.temperature.normalRange}
              status={vitalSigns.temperature.status}
              colorCode={vitalSigns.temperature.colorCode}
            />
          )}
          
          {vitalSigns?.heartRate && (
            <VitalSignCard
              label="Heart Rate"
              value={vitalSigns.heartRate.value}
              unit={vitalSigns.heartRate.unit}
              normalRange={vitalSigns.heartRate.normalRange}
              status={vitalSigns.heartRate.status}
              colorCode={vitalSigns.heartRate.colorCode}
            />
          )}
          
          {vitalSigns?.bloodPressure && (
            <VitalSignCard
              label="Blood Pressure"
              value={`${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`}
              unit={vitalSigns.bloodPressure.unit}
              normalRange={vitalSigns.bloodPressure.normalRange}
              status={vitalSigns.bloodPressure.status}
              colorCode={vitalSigns.bloodPressure.colorCode}
            />
          )}
          
          {vitalSigns?.respiratoryRate && (
            <VitalSignCard
              label="Respiratory Rate"
              value={vitalSigns.respiratoryRate.value}
              unit={vitalSigns.respiratoryRate.unit}
              normalRange={vitalSigns.respiratoryRate.normalRange}
              status={vitalSigns.respiratoryRate.status}
              colorCode={vitalSigns.respiratoryRate.colorCode}
            />
          )}
          
          {vitalSigns?.oxygenSaturation && (
            <VitalSignCard
              label="Oxygen Saturation"
              value={vitalSigns.oxygenSaturation.value}
              unit={vitalSigns.oxygenSaturation.unit}
              normalRange={vitalSigns.oxygenSaturation.normalRange}
              status={vitalSigns.oxygenSaturation.status}
              colorCode={vitalSigns.oxygenSaturation.colorCode}
              additionalInfo={vitalSigns.oxygenSaturation.oxygenSupport}
            />
          )}
        </div>
      </InfoCard>

      {/* Physical Examination Findings */}
      <InfoCard 
        title="Physical Examination Findings"
        subtitle="Systematic physical assessment findings"
      >
        <div className="space-y-0">
          {caseData.presentation?.physicalExamFindings?.general && (
            <DataRow 
              label="General Appearance" 
              value={caseData.presentation.physicalExamFindings.general} 
            />
          )}

          {caseData.presentation?.physicalExamFindings?.primarySystem && (
            <DataRow 
              label="Primary System" 
              value={caseData.presentation.physicalExamFindings.primarySystem} 
            />
          )}

          {caseData.presentation?.physicalExamFindings?.keyAbnormalities && caseData.presentation.physicalExamFindings.keyAbnormalities.length > 0 && (
            <DataRow 
              label="Key Abnormalities" 
              value={
                <ul className="space-y-1">
                  {caseData.presentation.physicalExamFindings.keyAbnormalities.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
                      <span className="text-red-700 font-medium">{finding}</span>
                    </li>
                  ))}
                </ul>
              } 
            />
          )}

          {caseData.presentation?.physicalExamFindings?.normalFindings && caseData.presentation.physicalExamFindings.normalFindings.length > 0 && (
            <DataRow 
              label="Normal Findings" 
              value={
                <ul className="space-y-1">
                  {caseData.presentation.physicalExamFindings.normalFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              } 
            />
          )}
        </div>
      </InfoCard>

      {/* Laboratory Results (if available) */}
      {caseData.smartDefaults?.laboratoryResults && (
        <InfoCard title="Laboratory Results">
          <div 
            className="overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: caseData.smartDefaults.laboratoryResults }}
          />
        </InfoCard>
      )}

      {/* On-Demand Content Sections */}
      <div className="space-y-6">
        <CompletePhysicalExamSection caseData={caseData} onContentGenerated={handleCompletePhysicalExamGenerated} />

        <ClinicalNarrativeSection 
          data={caseData.onDemandOptions?.['clinical-narrative'] ? JSON.parse(caseData.onDemandOptions['clinical-narrative']) : undefined}
          isGenerating={isGeneratingClinicalNarrative}
          onGenerate={async () => {
            setIsGeneratingClinicalNarrative(true);
            try {
              const response = await fetch('/api/ai/generate-clinical-narrative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseData })
              });
              if (response.ok) {
                const { clinicalNarrativeData } = await response.json();
                handleClinicalNarrativeGenerated(clinicalNarrativeData);
              }
            } catch (error) {
              console.error('Error generating clinical narrative:', error);
            } finally {
              setIsGeneratingClinicalNarrative(false);
            }
          }}
          onDataUpdate={handleClinicalNarrativeGenerated}
        />

        <LaboratoryResultsSection caseData={caseData} onContentGenerated={handleLaboratoryResultsGenerated} />

        <ImagingStudiesSection caseData={caseData} onContentGenerated={handleImagingStudiesGenerated} />

        <OnDemandSection
          id="additional-diagnostics"
          title="Additional Diagnostics"
          description="EKG, Echo, specialized tests and results"
          content={onDemandContent['additional-diagnostics']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate additional diagnostic tests such as EKG, echocardiogram, or specialized tests with detailed results and interpretations"
        />

        <OnDemandSection
          id="trending-data"
          title="Trending Data"
          description="How findings change over time"
          content={onDemandContent['trending-data']}
          onContentGenerated={handleContentGenerated}
          prompt="Generate trending data showing how vital signs, lab values, and clinical findings change over the course of the simulation"
        />
      </div>
    </div>
  );
};

export default PresentationTab; 