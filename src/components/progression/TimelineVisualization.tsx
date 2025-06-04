'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  User, 
  Clipboard, 
  Activity, 
  Stethoscope, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import { TimelineData, TimelinePoint, ConditionalBranch } from '@/types/progression';
import { VitalSigns } from '@/types';

interface TimelineVisualizationProps {
  timelineData: TimelineData;
  type: 'conditional' | 'time-based' | 'complication';
  title?: string;
  onPointClick?: (point: TimelinePoint) => void;
  onBranchClick?: (branch: ConditionalBranch) => void;
}

interface CollapsibleTimelineProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  accentColor?: string;
  children: React.ReactNode;
}

/**
 * CollapsibleTimeline - Wrapper component for collapsible timeline sections
 */
const CollapsibleTimeline: React.FC<CollapsibleTimelineProps> = ({
  title,
  subtitle,
  isExpanded,
  onToggle,
  accentColor = 'blue',
  children
}) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={onToggle}
        className={`w-full p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-left`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-${accentColor}-500`}></div>
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * TimelineVisualization - Medical timeline design with collapsible functionality
 * Shows timeline data points with proper medical timeline styling
 */
const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  timelineData,
  type,
  title,
  onPointClick,
  onBranchClick
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: false,
    ...timelineData.branches?.reduce((acc, branch) => ({ ...acc, [branch.id]: false }), {}) || {}
  });

  /**
   * Toggle section expansion
   */
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  /**
   * Get event icon based on significance and clinical events
   */
  const getEventIcon = (point: TimelinePoint) => {
    const events = point.clinicalEvents.join(' ').toLowerCase();
    
    if (events.includes('arrival') || events.includes('admission')) {
      return <User className="h-4 w-4" />;
    }
    if (events.includes('assessment') || events.includes('examination')) {
      return <Clipboard className="h-4 w-4" />;
    }
    if (events.includes('vital') || events.includes('monitoring')) {
      return <Activity className="h-4 w-4" />;
    }
    if (events.includes('intervention') || events.includes('medication') || events.includes('treatment')) {
      return <Stethoscope className="h-4 w-4" />;
    }
    if (point.significance === 'critical') {
      return <XCircle className="h-4 w-4" />;
    }
    if (events.includes('deterioration') || events.includes('worse')) {
      return <TrendingDown className="h-4 w-4" />;
    }
    if (events.includes('improvement') || events.includes('better')) {
      return <TrendingUp className="h-4 w-4" />;
    }
    
    return <Clock className="h-4 w-4" />;
  };

  /**
   * Get severity color classes
   */
  const getSeverityColor = (significance: string) => {
    switch (significance) {
      case 'normal':
        return {
          border: 'border-green-300',
          bg: 'bg-green-100',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'concerning':
        return {
          border: 'border-yellow-300',
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'critical':
        return {
          border: 'border-red-300',
          bg: 'bg-red-100',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  /**
   * Format time from minutes to HH:MM
   */
  const formatTime = (minutes: number) => {
    const baseHour = 9; // Start time 09:00
    const totalMinutes = baseHour * 60 + minutes;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate severity score based on vital signs
   */
  const calculateSeverityScore = (vitals: VitalSigns) => {
    let score = 0;
    
    // Heart rate scoring
    if (vitals.heartRate < 51 || vitals.heartRate > 100) score += 1;
    if (vitals.heartRate < 41 || vitals.heartRate > 130) score += 2;
    
    // Blood pressure scoring  
    if (vitals.bloodPressure.systolic < 101 || vitals.bloodPressure.systolic > 179) score += 1;
    if (vitals.bloodPressure.systolic < 91 || vitals.bloodPressure.systolic > 199) score += 2;
    
    // Respiratory rate scoring
    if (vitals.respiratoryRate < 12 || vitals.respiratoryRate > 20) score += 1;
    if (vitals.respiratoryRate < 9 || vitals.respiratoryRate > 24) score += 2;
    
    // Oxygen saturation scoring
    if (vitals.oxygenSaturation < 96) score += 1;
    if (vitals.oxygenSaturation < 92) score += 2;
    
    return score;
  };

  /**
   * Get score color
   */
  const getScoreColor = (score: number) => {
    if (score <= 2) return "bg-green-100 text-green-800";
    if (score <= 4) return "bg-yellow-100 text-yellow-800";
    if (score <= 6) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  /**
   * Render timeline content
   */
  const renderTimeline = (points: TimelinePoint[], prefix = '') => {
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {points.map((point, index) => {
            const severityColors = getSeverityColor(point.significance);
            const severityScore = calculateSeverityScore(point.vitalSigns);
            
            return (
              <div key={`${prefix}${index}`} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white ${severityColors.border}`}
                >
                  <div className={`p-2 rounded-full ${severityColors.bg}`}>
                    {getEventIcon(point)}
                  </div>
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div 
                    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => onPointClick?.(point)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border">
                          {formatTime(point.timeMinutes)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getScoreColor(severityScore)}`}>
                          Score: {severityScore}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${severityColors.badge}`}>
                        {point.significance.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">
                      {point.clinicalEvents.length > 0 ? point.clinicalEvents[0] : 'Clinical Event'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{point.patientResponse}</p>

                    {/* Physical Findings */}
                    {point.physicalFindings.length > 0 && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Findings:</strong> {point.physicalFindings.join(', ')}
                      </p>
                    )}

                    {/* Vital signs */}
                    <div className="bg-gray-50 rounded-md p-3 mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">VITAL SIGNS</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">BP:</span>{' '}
                          <span className="font-medium">
                            {point.vitalSigns.bloodPressure.systolic}/{point.vitalSigns.bloodPressure.diastolic}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">HR:</span>{' '}
                          <span className="font-medium">{point.vitalSigns.heartRate} bpm</span>
                        </div>
                        <div>
                          <span className="text-gray-500">RR:</span>{' '}
                          <span className="font-medium">{point.vitalSigns.respiratoryRate}/min</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Temp:</span>{' '}
                          <span className="font-medium">{point.vitalSigns.temperature}°F</span>
                        </div>
                        <div>
                          <span className="text-gray-500">SpO2:</span>{' '}
                          <span className="font-medium">{point.vitalSigns.oxygenSaturation}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pain:</span>{' '}
                          <span className="font-medium">{point.vitalSigns.painLevel}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor Notes */}
                    {point.instructorNotes && (
                      <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-300 rounded">
                        <p className="text-xs text-blue-700">
                          <strong>Instructor Notes:</strong> {point.instructorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Get scenario type configuration
   */
  const getScenarioConfig = () => {
    switch (type) {
      case 'conditional':
        return {
          icon: '⚡',
          color: 'blue',
          title: title || 'Conditional Branching Scenario',
          subtitle: 'Multiple pathways based on decisions and interventions'
        };
      case 'time-based':
        return {
          icon: '⏰',
          color: 'green',
          title: title || 'Time-Based Evolution Scenario',
          subtitle: 'Natural progression of patient condition over time'
        };
      case 'complication':
        return {
          icon: '⚠️',
          color: 'orange',
          title: title || 'Complication Scenario',
          subtitle: 'Unexpected complications and their management'
        };
      default:
        return {
          icon: '📈',
          color: 'gray',
          title: title || 'Progression Scenario',
          subtitle: 'Clinical progression timeline'
        };
    }
  };

  const config = getScenarioConfig();

  return (
    <div className="space-y-4">
      {/* Main Timeline */}
      <CollapsibleTimeline
        title={`${config.icon} ${config.title}`}
        subtitle={`${config.subtitle} • Duration: ${timelineData.duration} minutes • ${timelineData.dataPoints.length} events`}
        isExpanded={expandedSections.main}
        onToggle={() => toggleSection('main')}
        accentColor={config.color}
      >
        {renderTimeline(timelineData.dataPoints)}
      </CollapsibleTimeline>

      {/* Conditional Branches */}
      {type === 'conditional' && timelineData.branches && timelineData.branches.length > 0 && (
        <div className="space-y-4">
          {timelineData.branches.map((branch) => (
            <CollapsibleTimeline
              key={branch.id}
              title={`Branch: ${branch.conditionDisplay}`}
              subtitle={`${branch.outcome.charAt(0).toUpperCase() + branch.outcome.slice(1)} outcome • ${branch.probability}% probability • ${branch.timeline.length} events`}
              isExpanded={expandedSections[branch.id]}
              onToggle={() => toggleSection(branch.id)}
              accentColor={branch.outcome === 'positive' ? 'green' : branch.outcome === 'negative' ? 'red' : 'gray'}
            >
              <div 
                className="cursor-pointer"
                onClick={() => onBranchClick?.(branch)}
              >
                {branch.timeline.length > 0 ? (
                  renderTimeline(branch.timeline, `branch-${branch.id}-`)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No timeline events configured for this branch</p>
                    <p className="text-sm">Click to configure events for this scenario path</p>
                  </div>
                )}
              </div>
            </CollapsibleTimeline>
          ))}
        </div>
      )}

      {/* Summary Card for Critical Events */}
      {timelineData.dataPoints.some(point => point.significance === 'critical') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">Critical Events Identified</h3>
              <p className="text-sm text-red-700">
                This scenario contains critical events that require immediate attention and intervention. 
                Review the timeline carefully to understand the progression and appropriate responses.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineVisualization; 