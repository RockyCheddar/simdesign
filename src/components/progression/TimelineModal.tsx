'use client';

import React from 'react';
import { ProgressionScenario } from '@/types/progression';
import TimelineVisualization from './TimelineVisualization';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProgressionScenario | null;
}

/**
 * TimelineModal - Modal wrapper for timeline visualization
 * Displays timeline data in a modal overlay
 */
const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  scenario
}) => {
  if (!isOpen || !scenario || !scenario.timelineData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Timeline: {scenario.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <TimelineVisualization
            timelineData={scenario.timelineData}
            type={scenario.type}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineModal; 