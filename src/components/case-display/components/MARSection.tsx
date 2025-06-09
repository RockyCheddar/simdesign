'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard from './InfoCard';

interface MARData {
  currentTime: string;
  timeWindow: string[];
  scheduledMedications: Array<{
    name: string;
    dose: string;
    route: string;
    frequency: string;
    indication: string;
    administrations: Array<{
      time: string;
      status: 'given' | 'due' | 'overdue' | 'held';
      actualTime?: string;
      reason?: string;
    }>;
  }>;
  prnMedications: Array<{
    name: string;
    dose: string;
    route: string;
    indication: string;
    lastGiven?: string;
    nextAvailable?: string;
    recentAdministrations: Array<{
      time: string;
      reason: string;
    }>;
  }>;
}

interface MARSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (marData: MARData) => void;
}

const MARSection: React.FC<MARSectionProps> = ({ 
  caseData, 
  onContentGenerated 
}) => {
  // Check if MAR data already exists in the case
  const existingMARData = caseData.onDemandOptions?.['medication-mar'] 
    ? JSON.parse(caseData.onDemandOptions['medication-mar']) as MARData
    : null;
    
  const [marData, setMarData] = useState<MARData | null>(existingMARData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-mar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate MAR');
      }

      const { marData: generatedData } = await response.json();
      setMarData(generatedData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(generatedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate MAR');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonState = () => {
    if (isGenerating) {
      return {
        text: 'Generating...',
        className: 'bg-gray-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (marData) {
      return {
        text: 'Generated ✓',
        className: 'bg-green-600 cursor-default',
        disabled: true,
      };
    }
    return {
      text: 'Generate',
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false,
    };
  };

  const getStatusBadge = (status: 'given' | 'due' | 'overdue' | 'held', actualTime?: string) => {
    const statusStyles = {
      given: 'bg-gray-100 text-gray-600 border-gray-200',
      due: 'bg-blue-100 text-blue-800 border-blue-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      held: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const statusLabels = {
      given: actualTime ? `Given ${actualTime}` : 'Given',
      due: 'DUE',
      overdue: 'OVERDUE',
      held: 'HELD'
    };

    const statusIcons = {
      given: '✓',
      due: '⏰',
      overdue: '⚠️',
      held: '⏸️'
    };

    return (
      <div className={`px-2 py-1 rounded text-xs font-medium border text-center ${statusStyles[status]}`}>
        <div className="flex items-center justify-center space-x-1">
          <span>{statusIcons[status]}</span>
          <span>{statusLabels[status]}</span>
        </div>
      </div>
    );
  };

  const isCurrentTimeColumn = (time: string) => {
    if (!marData?.currentTime) return false;
    return time === marData.currentTime.split(':')[0] + ':00';
  };

  const buttonState = getButtonState();

  if (!marData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Medication Administration Record (MAR)</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate medication administration timeline with current status and PRN medications
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={buttonState.disabled}
              className={`
                px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2
                ${buttonState.className}
              `}
            >
              {isGenerating && <LoadingSpinner size="sm" />}
              <span>{buttonState.text}</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <InfoCard 
      title="Medication Administration Record (MAR)" 
      subtitle={`Current Simulation Time: ${marData.currentTime} | 8-Hour Window`}
    >
      <div className="space-y-6">
        {/* Scheduled Medications Table */}
        <div>
          <h5 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Scheduled Medications
          </h5>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              {/* Header */}
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Medication Order
                  </th>
                  {marData.timeWindow.map((time) => (
                    <th 
                      key={time} 
                      className={`border border-gray-300 px-2 py-2 text-center text-sm font-medium min-w-[80px] ${
                        isCurrentTimeColumn(time) 
                          ? 'bg-blue-200 text-blue-900' 
                          : 'text-gray-700'
                      }`}
                    >
                      {time}
                      {isCurrentTimeColumn(time) && (
                        <div className="text-xs font-normal mt-1">NOW</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Body */}
              <tbody>
                {marData.scheduledMedications.map((medication, medIndex) => (
                  <tr key={medIndex} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {medication.name} {medication.dose} {medication.route} {medication.frequency}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        → {medication.indication}
                      </div>
                    </td>
                    {marData.timeWindow.map((time) => {
                      const administration = medication.administrations.find(admin => admin.time === time);
                      return (
                        <td 
                          key={time} 
                          className={`border border-gray-300 px-2 py-3 text-center ${
                            isCurrentTimeColumn(time) ? 'bg-blue-50' : ''
                          }`}
                        >
                          {administration ? (
                            <div 
                              className="cursor-pointer"
                              title={administration.reason || `${administration.status} at ${administration.actualTime || time}`}
                            >
                              {getStatusBadge(administration.status, administration.actualTime)}
                            </div>
                          ) : (
                            <div className="text-gray-300">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRN Medications Table */}
        {marData.prnMedications.length > 0 && (
          <div>
            <h5 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🆘</span>
              PRN (As Needed) Medications
            </h5>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Medication
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Indication
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Last Given
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Next Available
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Recent Use
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marData.prnMedications.map((medication, index) => (
                    <tr key={index} className="hover:bg-orange-25">
                      <td className="border border-gray-300 px-3 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {medication.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {medication.dose} {medication.route}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-3 text-sm text-gray-700">
                        {medication.indication}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 text-sm text-center">
                        {medication.lastGiven ? (
                          <span className="text-gray-600">{medication.lastGiven}</span>
                        ) : (
                          <span className="text-gray-400">Not given</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 text-sm text-center">
                        {medication.nextAvailable ? (
                          <span className={`font-medium ${
                            new Date(`2024-01-01 ${medication.nextAvailable}`) <= new Date(`2024-01-01 ${marData.currentTime}`)
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}>
                            {medication.nextAvailable}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Available now</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 text-sm">
                        {medication.recentAdministrations.length > 0 ? (
                          <div className="space-y-1">
                            {medication.recentAdministrations.slice(0, 2).map((admin, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium text-gray-600">{admin.time}</span>
                                <span className="text-gray-500"> - {admin.reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No recent use</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h6 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              {getStatusBadge('given')}
              <span className="text-gray-600">Already administered</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge('due')}
              <span className="text-gray-600">Due now</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge('overdue')}
              <span className="text-gray-600">Missed/Late</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge('held')}
              <span className="text-gray-600">Intentionally held</span>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  );
};

export default MARSection; 