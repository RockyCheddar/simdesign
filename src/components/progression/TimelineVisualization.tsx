'use client';

import React, { useState } from 'react';
import { TimelineData, TimelinePoint, ConditionalBranch } from '@/types/progression';
import { VitalSigns } from '@/types';

interface TimelineVisualizationProps {
  timelineData: TimelineData;
  type: 'conditional' | 'time-based' | 'complication';
  onPointClick?: (point: TimelinePoint) => void;
  onBranchClick?: (branch: ConditionalBranch) => void;
}

/**
 * TimelineVisualization - Visual representation of progression scenarios
 * Shows timeline data points and conditional branches
 */
const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  timelineData,
  type,
  onPointClick,
  onBranchClick
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TimelinePoint | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<ConditionalBranch | null>(null);

  /**
   * Get significance color for timeline points
   */
  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'normal':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'concerning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'critical':
        return 'bg-red-100 border-red-400 text-red-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  /**
   * Get outcome color for branches
   */
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'bg-green-50 border-green-300 text-green-700';
      case 'negative':
        return 'bg-red-50 border-red-300 text-red-700';
      case 'neutral':
        return 'bg-gray-50 border-gray-300 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  /**
   * Format vital signs for display
   */
  const formatVitalSigns = (vitalSigns: VitalSigns) => {
    return [
      `BP: ${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`,
      `HR: ${vitalSigns.heartRate}`,
      `RR: ${vitalSigns.respiratoryRate}`,
      `Temp: ${vitalSigns.temperature}°F`,
      `SpO2: ${vitalSigns.oxygenSaturation}%`
    ].join(' | ');
  };

  /**
   * Handle point selection
   */
  const handlePointClick = (point: TimelinePoint) => {
    setSelectedPoint(point);
    onPointClick?.(point);
  };

  /**
   * Handle branch selection
   */
  const handleBranchClick = (branch: ConditionalBranch) => {
    setSelectedBranch(branch);
    onBranchClick?.(branch);
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {type === 'conditional' && '⚡ Conditional Timeline'}
          {type === 'time-based' && '⏰ Time-Based Progression'}
          {type === 'complication' && '⚠️ Complication Timeline'}
        </h3>
        <div className="text-sm text-gray-600">
          Duration: {timelineData.duration} minutes
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Timeline Points */}
        <div className="space-y-6">
          {timelineData.dataPoints.map((point, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline Marker */}
              <div 
                className={`relative z-10 w-4 h-4 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-125 ${getSignificanceColor(point.significance)}`}
                onClick={() => handlePointClick(point)}
              >
                {selectedPoint === point && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-75"></div>
                )}
              </div>

              {/* Timeline Content */}
              <div className="ml-6 flex-1">
                <div 
                  className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                    selectedPoint === point ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePointClick(point)}
                >
                  {/* Time and Significance */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {point.timeMinutes} minutes
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getSignificanceColor(point.significance)}`}>
                      {point.significance}
                    </span>
                  </div>

                  {/* Vital Signs */}
                  <div className="text-xs text-gray-600 mb-2 font-mono">
                    {formatVitalSigns(point.vitalSigns)}
                  </div>

                  {/* Patient Response */}
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Patient: </span>
                    <span className="text-sm text-gray-600">{point.patientResponse}</span>
                  </div>

                  {/* Physical Findings */}
                  {point.physicalFindings.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Findings: </span>
                      <span className="text-sm text-gray-600">
                        {point.physicalFindings.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Clinical Events */}
                  {point.clinicalEvents.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Events: </span>
                      <span className="text-sm text-gray-600">
                        {point.clinicalEvents.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conditional Branches */}
      {type === 'conditional' && timelineData.branches && timelineData.branches.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Conditional Branches</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timelineData.branches.map((branch) => (
              <div
                key={branch.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedBranch === branch ? 'ring-2 ring-blue-500' : ''
                } ${getOutcomeColor(branch.outcome)}`}
                onClick={() => handleBranchClick(branch)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">
                    {branch.conditionDisplay}
                  </h5>
                  <span className="text-xs px-2 py-1 rounded-full bg-white border">
                    {branch.probability}%
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Outcome: <span className="font-medium">{branch.outcome}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {branch.timeline.length} timeline points
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Timeline Point Details - {selectedPoint.timeMinutes} minutes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-800">Vital Signs:</strong>
              <ul className="mt-1 text-blue-700">
                <li>Blood Pressure: {selectedPoint.vitalSigns.bloodPressure.systolic}/{selectedPoint.vitalSigns.bloodPressure.diastolic} mmHg</li>
                <li>Heart Rate: {selectedPoint.vitalSigns.heartRate} bpm</li>
                <li>Respiratory Rate: {selectedPoint.vitalSigns.respiratoryRate} breaths/min</li>
                <li>Temperature: {selectedPoint.vitalSigns.temperature}°F</li>
                <li>O2 Saturation: {selectedPoint.vitalSigns.oxygenSaturation}%</li>
                <li>Pain Level: {selectedPoint.vitalSigns.painLevel}/10</li>
              </ul>
            </div>
            <div>
              <strong className="text-blue-800">Clinical Information:</strong>
              <div className="mt-1 text-blue-700">
                <p><strong>Patient Response:</strong> {selectedPoint.patientResponse}</p>
                {selectedPoint.physicalFindings.length > 0 && (
                  <p><strong>Physical Findings:</strong> {selectedPoint.physicalFindings.join(', ')}</p>
                )}
                {selectedPoint.clinicalEvents.length > 0 && (
                  <p><strong>Clinical Events:</strong> {selectedPoint.clinicalEvents.join(', ')}</p>
                )}
                {selectedPoint.instructorNotes && (
                  <p><strong>Instructor Notes:</strong> {selectedPoint.instructorNotes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Branch Details */}
      {selectedBranch && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">
            Branch Details: {selectedBranch.conditionDisplay}
          </h4>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>Condition:</strong> {selectedBranch.condition}</p>
            <p><strong>Outcome:</strong> {selectedBranch.outcome}</p>
            <p><strong>Probability:</strong> {selectedBranch.probability}%</p>
            <p><strong>Timeline Points:</strong> {selectedBranch.timeline.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineVisualization; 