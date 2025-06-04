'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Clock, Activity, AlertTriangle } from 'lucide-react';
import { TimelineData, ConditionalBranch } from '@/types/progression';

interface TimelineSummaryProps {
  timelineData: TimelineData;
  type: 'conditional' | 'time-based' | 'complication';
  onExpandTimeline: () => void;
  onExpandBranch?: (branchId: string) => void;
  expandedTimeline?: boolean;
  expandedBranches?: string[];
}

/**
 * TimelineSummary - Condensed timeline view with expand controls
 * Shows summary info and provides expand buttons for detailed views
 */
const TimelineSummary: React.FC<TimelineSummaryProps> = ({
  timelineData,
  type,
  onExpandTimeline,
  onExpandBranch,
  expandedTimeline = false,
  expandedBranches = []
}) => {
  /**
   * Get timeline summary stats
   */
  const getTimelineStats = () => {
    const criticalEvents = timelineData.dataPoints.filter(point => point.significance === 'critical').length;
    const concerningEvents = timelineData.dataPoints.filter(point => point.significance === 'concerning').length;
    const normalEvents = timelineData.dataPoints.filter(point => point.significance === 'normal').length;

    return { criticalEvents, concerningEvents, normalEvents };
  };

  /**
   * Get branch summary stats
   */
  const getBranchStats = (branch: ConditionalBranch) => {
    const criticalEvents = branch.timeline.filter(point => point.significance === 'critical').length;
    const concerningEvents = branch.timeline.filter(point => point.significance === 'concerning').length;
    const normalEvents = branch.timeline.filter(point => point.significance === 'normal').length;

    return { criticalEvents, concerningEvents, normalEvents };
  };

  /**
   * Get outcome badge styling
   */
  const getOutcomeBadgeStyle = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const stats = getTimelineStats();

  return (
    <div className="space-y-3">
      {/* Main Timeline Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <h4 className="font-medium text-gray-900">Main Timeline</h4>
            <span className="text-xs text-gray-500">
              {timelineData.duration}min • {timelineData.dataPoints.length} events
            </span>
          </div>
          <button
            onClick={onExpandTimeline}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            {expandedTimeline ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                Expand Details
              </>
            )}
          </button>
        </div>

        {/* Event Summary */}
        <div className="flex items-center gap-4 text-xs">
          {stats.criticalEvents > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-red-700">{stats.criticalEvents} Critical</span>
            </div>
          )}
          {stats.concerningEvents > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-yellow-700">{stats.concerningEvents} Concerning</span>
            </div>
          )}
          {stats.normalEvents > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-700">{stats.normalEvents} Normal</span>
            </div>
          )}
        </div>

        {/* Critical Events Alert */}
        {stats.criticalEvents > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Contains critical events requiring immediate attention</span>
          </div>
        )}
      </div>

      {/* Conditional Branches */}
      {type === 'conditional' && timelineData.branches && timelineData.branches.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Scenario Branches ({timelineData.branches.length})
          </h5>
          
          {timelineData.branches.map((branch) => {
            const branchStats = getBranchStats(branch);
            const isExpanded = expandedBranches.includes(branch.id);
            
            return (
              <div key={branch.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {branch.conditionDisplay}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${getOutcomeBadgeStyle(branch.outcome)}`}>
                      {branch.outcome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {branch.probability}% • {branch.timeline.length} events
                    </span>
                    <button
                      onClick={() => onExpandBranch?.(branch.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          Expand
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Branch Event Summary */}
                {branch.timeline.length > 0 && (
                  <div className="flex items-center gap-3 text-xs">
                    {branchStats.criticalEvents > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-700">{branchStats.criticalEvents} Critical</span>
                      </div>
                    )}
                    {branchStats.concerningEvents > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-700">{branchStats.concerningEvents} Concerning</span>
                      </div>
                    )}
                    {branchStats.normalEvents > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-700">{branchStats.normalEvents} Normal</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty branch state */}
                {branch.timeline.length === 0 && (
                  <div className="text-xs text-gray-500 italic">
                    No timeline events configured for this branch
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimelineSummary; 