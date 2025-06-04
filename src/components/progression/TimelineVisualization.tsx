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
  TrendingDown,
  Heart,
  Pill,
  TestTube,
  Thermometer,
  Zap,
  Eye,
  Scissors,
  Monitor,
  ShieldAlert,
  Plus
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
   * COMPREHENSIVE MEDICAL EVENT ICON SYSTEM
   */
  const getEventIcon = (point: TimelinePoint) => {
    const events = point.clinicalEvents.join(' ').toLowerCase();
    const findings = point.physicalFindings.join(' ').toLowerCase();
    const combined = `${events} ${findings}`.toLowerCase();
    
    // Vital Signs & Monitoring
    if (combined.includes('vital') || combined.includes('monitoring') || combined.includes('observation')) {
      return <Activity className="h-4 w-4 text-black" />;
    }
    
    // Cardiac/ECG Related
    if (combined.includes('ecg') || combined.includes('cardiac') || combined.includes('heart') || combined.includes('rhythm')) {
      return <Heart className="h-4 w-4 text-black" />;
    }
    
    // Medication Administration
    if (combined.includes('medication') || combined.includes('drug') || combined.includes('administered') || 
        combined.includes('dose') || combined.includes('injection') || combined.includes('pill')) {
      return <Pill className="h-4 w-4 text-black" />;
    }
    
    // Lab Work & Tests
    if (combined.includes('blood') || combined.includes('lab') || combined.includes('test') || 
        combined.includes('sample') || combined.includes('culture') || combined.includes('biopsy')) {
      return <TestTube className="h-4 w-4 text-black" />;
    }
    
    // Physical Assessment/Examination
    if (combined.includes('assessment') || combined.includes('examination') || combined.includes('auscultation') ||
        combined.includes('palpation') || combined.includes('inspection')) {
      return <Stethoscope className="h-4 w-4 text-black" />;
    }
    
    // Temperature/Fever Related
    if (combined.includes('temperature') || combined.includes('fever') || combined.includes('hypothermia') ||
        combined.includes('thermal')) {
      return <Thermometer className="h-4 w-4 text-black" />;
    }
    
    // Emergency/Resuscitation
    if (combined.includes('emergency') || combined.includes('resuscitation') || combined.includes('code') ||
        combined.includes('crash') || combined.includes('arrest')) {
      return <Zap className="h-4 w-4 text-black" />;
    }
    
    // Neurological Assessment
    if (combined.includes('neurological') || combined.includes('consciousness') || combined.includes('pupils') ||
        combined.includes('glasgow') || combined.includes('cognitive')) {
      return <Eye className="h-4 w-4 text-black" />;
    }
    
    // Procedures/Surgery
    if (combined.includes('procedure') || combined.includes('surgery') || combined.includes('incision') ||
        combined.includes('suture') || combined.includes('catheter')) {
      return <Scissors className="h-4 w-4 text-black" />;
    }
    
    // Patient Deterioration
    if (combined.includes('deterioration') || combined.includes('worse') || combined.includes('decline') ||
        combined.includes('unstable')) {
      return <TrendingDown className="h-4 w-4 text-black" />;
    }
    
    // Patient Improvement
    if (combined.includes('improvement') || combined.includes('better') || combined.includes('stable') ||
        combined.includes('recovery') || combined.includes('responding')) {
      return <TrendingUp className="h-4 w-4 text-black" />;
    }
    
    // Monitoring Equipment
    if (combined.includes('monitor') || combined.includes('telemetry') || combined.includes('equipment')) {
      return <Monitor className="h-4 w-4 text-black" />;
    }
    
    // Critical Alerts
    if (combined.includes('alert') || combined.includes('alarm') || combined.includes('warning')) {
      return <ShieldAlert className="h-4 w-4 text-black" />;
    }
    
    // Critical Significance Override
    if (point.significance === 'critical') {
      return <ShieldAlert className="h-4 w-4 text-black" />;
    }
    
    // Admission/Arrival
    if (combined.includes('arrival') || combined.includes('admission') || combined.includes('transfer')) {
      return <User className="h-4 w-4 text-black" />;
    }
    
    // Medical Intervention
    if (combined.includes('intervention') || combined.includes('treatment') || combined.includes('therapy')) {
      return <Plus className="h-4 w-4 text-black" />;
    }
    
    // Default - General Clinical Event
    return <Clipboard className="h-4 w-4 text-black" />;
  };

  /**
   * GREEN TO RED SEVERITY SPECTRUM - LIGHT SHADES WITH MATCHING CIRCLES
   */
  const getSeverityColor = (significance: string) => {
    switch (significance) {
      case 'normal':
        return {
          // Light green spectrum
          border: 'border-green-300',
          bg: 'bg-green-50',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800 border-green-300 rounded-full',
          circle: 'bg-green-300',  // Same as border
          ringColor: 'ring-green-300'
        };
      case 'concerning':
        return {
          // Light yellow-orange spectrum  
          border: 'border-yellow-400',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-400 rounded-full',
          circle: 'bg-yellow-400',  // Same as border
          ringColor: 'ring-yellow-400'
        };
      case 'critical':
        return {
          // Light red spectrum
          border: 'border-red-400',
          bg: 'bg-red-50',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800 border-red-400 rounded-full',
          circle: 'bg-red-400',  // Same as border
          ringColor: 'ring-red-400'
        };
      default:
        return {
          // Neutral gray
          border: 'border-slate-300',
          bg: 'bg-slate-50',
          text: 'text-slate-800',
          badge: 'bg-slate-100 text-slate-800 border-slate-300 rounded-full',
          circle: 'bg-slate-300',  // Same as border
          ringColor: 'ring-slate-300'
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
   * Get score color - GREEN TO RED SPECTRUM FOR MEDICAL SCORING
   */
  const getScoreColor = (score: number) => {
    if (score <= 2) return "bg-green-100 text-green-800 border-green-300 rounded-full";
    if (score <= 4) return "bg-yellow-100 text-yellow-800 border-yellow-400 rounded-full";
    if (score <= 6) return "bg-orange-100 text-orange-800 border-orange-400 rounded-full";
    return "bg-red-100 text-red-800 border-red-400 rounded-full";
  };

  /**
   * Determine event type for smart content display
   */
  const getEventType = (point: TimelinePoint) => {
    const events = point.clinicalEvents.join(' ').toLowerCase();
    
    if (events.includes('blood') || events.includes('lab') || events.includes('test') || events.includes('ordered')) {
      return 'lab_work';
    }
    if (events.includes('medication') || events.includes('drug') || events.includes('administered')) {
      return 'medication';
    }
    if (events.includes('assessment') || events.includes('examination') || events.includes('evaluation')) {
      return 'assessment';
    }
    if (events.includes('procedure') || events.includes('intervention') || events.includes('treatment')) {
      return 'procedure';
    }
    if (events.includes('monitoring') || events.includes('vital') || events.includes('observation')) {
      return 'monitoring';
    }
    return 'clinical_event';
  };

  /**
   * Check if event should show medical score
   */
  const shouldShowMedicalScore = (point: TimelinePoint) => {
    const eventType = getEventType(point);
    const score = calculateSeverityScore(point.vitalSigns);
    
    // Only show scores for assessments and monitoring with actual vital signs
    return (eventType === 'assessment' || eventType === 'monitoring') && score > 0;
  };

  /**
   * Check if event should show vital signs
   */
  const shouldShowVitalSigns = (point: TimelinePoint) => {
    const eventType = getEventType(point);
    
    // Show vital signs for assessments, monitoring, and clinical events
    // Hide for lab work and procedures unless critical
    return eventType === 'assessment' || 
           eventType === 'monitoring' || 
           eventType === 'clinical_event' ||
           (point.significance === 'critical');
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
                {/* Timeline dot - MATCHING INNER/OUTER SEVERITY COLORS */}
                <div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white ${severityColors.border}`}
                >
                  <div className={`p-2.5 rounded-full ${severityColors.circle}`}>
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
                        {/* BLACK BOLD TIMING PILL - LARGER SIZE */}
                        <span className="text-sm font-bold bg-black text-white px-3 py-1 rounded-full">
                          {formatTime(point.timeMinutes)}
                        </span>
                        {/* CONDITIONAL MEDICAL SCORE - ONLY FOR RELEVANT EVENTS */}
                        {shouldShowMedicalScore(point) && (
                          <span className={`text-xs font-medium px-2 py-1 border ${getScoreColor(severityScore)}`}>
                            NEWS2: {severityScore}
                          </span>
                        )}
                      </div>
                      {/* CIRCULAR SEVERITY PILL */}
                      <span className={`text-xs font-medium px-3 py-1 border ${severityColors.badge}`}>
                        {point.significance.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">
                      {point.clinicalEvents.length > 0 ? point.clinicalEvents[0] : 'Clinical Event'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{point.patientResponse}</p>

                    {/* Smart Content Display Based on Event Type */}
                    {getEventType(point) === 'lab_work' ? (
                      /* Lab Work - Show findings inline, no vital signs */
                      point.physicalFindings.length > 0 && (
                        <div className="bg-blue-50 rounded-md p-3 mt-3">
                          <h4 className="text-xs font-medium text-blue-800 mb-2">LAB RESULTS</h4>
                          <p className="text-sm text-gray-800">
                            {point.physicalFindings.join(', ')}
                          </p>
                        </div>
                      )
                    ) : getEventType(point) === 'medication' ? (
                      /* Medication - Show response and minimal details */
                      <>
                        {point.physicalFindings.length > 0 && (
                          <p className="text-sm text-gray-800 mb-3">
                            <strong>Administration Notes:</strong> {point.physicalFindings.join(', ')}
                          </p>
                        )}
                        {point.significance === 'critical' && shouldShowVitalSigns(point) && (
                          <div className="bg-red-50 rounded-md p-3 mt-3">
                            <h4 className="text-xs font-medium text-red-800 mb-2">⚠️ CRITICAL VITAL SIGNS</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-800 font-medium">BP:</span>{' '}
                                <span className="font-bold text-gray-900">
                                  {point.vitalSigns.bloodPressure.systolic}/{point.vitalSigns.bloodPressure.diastolic}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">HR:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.heartRate} bpm</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">SpO2:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.oxygenSaturation}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Assessment/Monitoring/Clinical Events - Full display */
                      <>
                        {point.physicalFindings.length > 0 && (
                          <p className="text-sm text-gray-800 mb-3">
                            <strong>Findings:</strong> {point.physicalFindings.join(', ')}
                          </p>
                        )}

                        {shouldShowVitalSigns(point) && (
                          <div className="bg-gray-50 rounded-md p-3 mt-3">
                            <h4 className="text-xs font-medium text-gray-800 mb-2">VITAL SIGNS</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-800 font-medium">BP:</span>{' '}
                                <span className="font-bold text-gray-900">
                                  {point.vitalSigns.bloodPressure.systolic}/{point.vitalSigns.bloodPressure.diastolic}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">HR:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.heartRate} bpm</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">RR:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.respiratoryRate}/min</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">Temp:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.temperature}°F</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">SpO2:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.oxygenSaturation}%</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">Pain:</span>{' '}
                                <span className="font-bold text-gray-900">{point.vitalSigns.painLevel}/10</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

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