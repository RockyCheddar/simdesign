'use client';

import React, { useState } from 'react';
import { ProgressionScenario, ScenarioType } from '@/types/progression';
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
  
  // Timeline expansion state
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

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
      {/* Condensed Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0 mt-0.5">{scenarioTypeConfig.icon}</span>
            <div className="flex-1 min-w-0">
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
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate" onClick={() => setIsEditing(true)}>
                  {scenario.title}
                </h3>
              )}
              
              {/* Badges */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {scenarioTypeConfig.label}
                </span>
                {scenario.isGenerated && (
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    AI Generated
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getComplexityBadgeStyle(scenario.parameters.complexity)}`}>
                  {scenario.parameters.complexity}
                </span>
              </div>
            </div>
          </div>
          
          {/* Timeline Toggle Button - Prominent Position */}
          <button
            onClick={handleTimelineToggle}
            className={`ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
              isTimelineExpanded
                ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md'
                : 'text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300'
            }`}
            title="Toggle Timeline View"
          >
            <span className="mr-1.5">{isTimelineExpanded ? '📊' : '📈'}</span>
            {isTimelineExpanded ? 'Hide Timeline' : 'View Timeline'}
          </button>
        </div>
      </div>

      {/* Condensed Content */}
      <div className="px-4 py-3">
        {/* Description */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 w-full h-16 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm mb-3 hover:text-gray-800 cursor-pointer" 
             style={{
               display: '-webkit-box',
               WebkitBoxOrient: 'vertical',
               WebkitLineClamp: 2,
               overflow: 'hidden'
             }}
             onClick={() => setIsEditing(true)}>
            {scenario.description}
          </p>
        )}

        {/* Condensed Metrics Row - SEVERITY-BASED COLORS */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            {scenario.timelineData && (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                  {scenario.timelineData.duration}min
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {scenario.timelineData.dataPoints.length} events
                </span>
                {scenario.timelineData.branches && scenario.timelineData.branches.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                    {scenario.timelineData.branches.length} branches
                  </span>
                )}
              </>
            )}
          </div>
          <span>{formatDate(scenario.createdAt)}</span>
        </div>

        {/* Learning Focus Tags - Condensed */}
        {scenario.parameters.learningFocus && scenario.parameters.learningFocus.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {scenario.parameters.learningFocus.slice(0, 3).map((focus, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {focus}
              </span>
            ))}
            {scenario.parameters.learningFocus.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-0.5">
                +{scenario.parameters.learningFocus.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Condensed Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-1">
            <button
              onClick={onDuplicate}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
              title="Duplicate Scenario"
            >
              <span className="mr-1">📋</span>
              Duplicate
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
              title="Edit Scenario"
            >
              <span className="mr-1">✏️</span>
              Edit
            </button>
          </div>
          <button
            onClick={handleDeleteClick}
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
              showDeleteConfirm
                ? 'text-white bg-red-600 hover:bg-red-700'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
            title={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete Scenario'}
          >
            <span className="mr-1">🗑️</span>
            {showDeleteConfirm ? 'Confirm' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Streamlined Timeline Section */}
      {isTimelineExpanded && scenario.timelineData && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-4">
            {/* Direct Timeline Visualization - No additional clicks needed */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-lg">{scenarioTypeConfig.icon}</span>
                  Timeline: {scenario.title}
                </h4>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                   <span className="flex items-center gap-1">
                     <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                     {scenario.timelineData.duration}min
                   </span>
                   <span className="flex items-center gap-1">
                     <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                     {scenario.timelineData.dataPoints.length} events
                   </span>
                   {scenario.timelineData.branches && scenario.timelineData.branches.length > 0 && (
                     <span className="flex items-center gap-1">
                       <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                       {scenario.timelineData.branches.length} branches
                     </span>
                   )}
                 </div>
              </div>
              
              {/* Main Timeline - Always Visible When Timeline is Expanded */}
              <TimelineVisualization
                timelineData={scenario.timelineData}
                type={scenario.type}
                title={scenario.title}
              />

              {/* Conditional Branches - Auto-expanded if they exist */}
              {scenario.type === 'conditional' && scenario.timelineData.branches && scenario.timelineData.branches.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Scenario Branches ({scenario.timelineData.branches.length})
                  </h5>
                  {scenario.timelineData.branches.map((branch) => (
                    <div key={branch.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-800">
                          {branch.conditionDisplay}
                        </h6>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full border ${
                            branch.outcome === 'positive' ? 'bg-green-100 text-green-800 border-green-200' :
                            branch.outcome === 'negative' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {branch.outcome}
                          </span>
                          <span className="text-gray-500">{branch.probability}%</span>
                        </div>
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
                        <div className="text-center py-6 text-gray-500">
                          <span className="text-2xl mb-2 block">📋</span>
                          <p className="text-sm">No timeline events configured for this branch</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionScenarioCard; 