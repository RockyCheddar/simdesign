'use client';

import React, { useState } from 'react';
import { ProgressionScenario, ScenarioType } from '@/types/progression';
import TimelineSummary from './TimelineSummary';
import TimelineVisualization from './TimelineVisualization';

interface ProgressionScenarioCardProps {
  scenario: ProgressionScenario;
  onEdit: (updates: Partial<ProgressionScenario>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onViewTimeline: () => void;
  scenarioTypeConfig: ScenarioType;
}

/**
 * ProgressionScenarioCard - Display card for individual progression scenarios
 * Shows scenario details and provides action buttons for management
 */
const ProgressionScenarioCard: React.FC<ProgressionScenarioCardProps> = ({
  scenario,
  onEdit,
  onDelete,
  onDuplicate,
  onViewTimeline,
  scenarioTypeConfig
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(scenario.title);
  const [editDescription, setEditDescription] = useState(scenario.description);
  
  // Timeline expansion states
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [expandedMainTimeline, setExpandedMainTimeline] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<string[]>([]);

  /**
   * Handle inline title and description editing
   */
  const handleSaveEdit = () => {
    onEdit({
      title: editTitle,
      description: editDescription
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(scenario.title);
    setEditDescription(scenario.description);
    setIsEditing(false);
  };

  /**
   * Handle delete with confirmation
   */
  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  /**
   * Handle timeline toggle
   */
  const handleTimelineToggle = () => {
    setIsTimelineExpanded(!isTimelineExpanded);
    // Call the parent's onViewTimeline for any tracking purposes
    if (!isTimelineExpanded) {
      onViewTimeline();
    }
  };

  /**
   * Handle main timeline expansion
   */
  const handleExpandMainTimeline = () => {
    setExpandedMainTimeline(!expandedMainTimeline);
  };

  /**
   * Handle branch expansion
   */
  const handleExpandBranch = (branchId: string) => {
    setExpandedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  /**
   * Format creation date
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Get complexity badge styling
   */
  const getComplexityBadgeStyle = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complex':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with Type Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{scenarioTypeConfig.icon}</span>
            <div>
              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                {scenarioTypeConfig.label}
              </span>
              {scenario.isGenerated && (
                <span className="ml-2 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                  AI Generated
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getComplexityBadgeStyle(scenario.parameters.complexity)}`}>
            {scenario.parameters.complexity}
          </span>
        </div>
        
        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)}>
            {scenario.title}
          </h3>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {isEditing ? (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 w-full h-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
        ) : (
          <p className="text-gray-600 mb-4 hover:text-gray-800 cursor-pointer" onClick={() => setIsEditing(true)}>
            {scenario.description}
          </p>
        )}

        {/* Edit Controls */}
        {isEditing && (
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
            >
              Save
            </button>
          </div>
        )}

        {/* Learning Focus Tags */}
        {scenario.parameters.learningFocus && scenario.parameters.learningFocus.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {scenario.parameters.learningFocus.map((focus, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Info */}
        {scenario.timelineData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Timeline Duration:</span>
              <span className="font-medium text-gray-900">{scenario.timelineData.duration} minutes</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-medium text-gray-900">{scenario.timelineData.dataPoints.length}</span>
            </div>
            {scenario.timelineData.branches && scenario.timelineData.branches.length > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Branches:</span>
                <span className="font-medium text-gray-900">{scenario.timelineData.branches.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 mb-4">
          Created {formatDate(scenario.createdAt)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handleTimelineToggle}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isTimelineExpanded
                  ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
              title="Toggle Timeline"
            >
              <span className="mr-1">📈</span>
              {isTimelineExpanded ? 'Hide Timeline' : 'Timeline'}
            </button>
            <button
              onClick={onDuplicate}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Duplicate Scenario"
            >
              <span className="mr-1">📋</span>
              Duplicate
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Edit Scenario"
            >
              <span className="mr-1">✏️</span>
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                showDeleteConfirm
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
              title={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete Scenario'}
            >
              <span className="mr-1">🗑️</span>
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Inline Timeline Section */}
      {isTimelineExpanded && scenario.timelineData && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-6 py-4">
            {/* Timeline Summary */}
            <TimelineSummary
              timelineData={scenario.timelineData}
              type={scenario.type}
              onExpandTimeline={handleExpandMainTimeline}
              onExpandBranch={handleExpandBranch}
              expandedTimeline={expandedMainTimeline}
              expandedBranches={expandedBranches}
            />

            {/* Expanded Timeline Details */}
            {expandedMainTimeline && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Timeline Details</h5>
                  <button
                    onClick={handleExpandMainTimeline}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Collapse
                  </button>
                </div>
                <TimelineVisualization
                  timelineData={scenario.timelineData}
                  type={scenario.type}
                  title={scenario.title}
                />
              </div>
            )}

            {/* Expanded Branch Details */}
            {expandedBranches.map(branchId => {
              const branch = scenario.timelineData?.branches?.find(b => b.id === branchId);
              if (!branch) return null;

              return (
                <div key={branchId} className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">
                      Branch: {branch.conditionDisplay}
                    </h5>
                    <button
                      onClick={() => handleExpandBranch(branchId)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Collapse
                    </button>
                  </div>
                  {branch.timeline.length > 0 ? (
                    <TimelineVisualization
                      timelineData={{
                        duration: scenario.timelineData?.duration || 30,
                        dataPoints: branch.timeline,
                        branches: []
                      }}
                      type={scenario.type}
                      title={`${scenario.title} - ${branch.conditionDisplay}`}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📋</span>
                      <p className="text-sm">No timeline events configured for this branch</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Configure events to see the timeline visualization
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionScenarioCard; 