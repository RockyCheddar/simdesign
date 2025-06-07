'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useDocumentStore } from '@/stores/documentStore';
import { saveCase } from '@/utils/caseStorage';
import { generateId } from '@/utils/helpers';
import { SimulationCase } from '@/types';
import { ArrowLeft, Save, FileText, User, Activity, Target, Stethoscope, TestTube, Image, FileCheck, Archive } from 'lucide-react';

interface TextSelectionPopup {
  show: boolean;
  x: number;
  y: number;
  selectedText: string;
}

type TabId = 'overview' | 'patient' | 'presentation' | 'vitals' | 'physical' | 'labs' | 'imaging' | 'assessment' | 'objectives' | 'bulk';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'patient', label: 'Patient Info', icon: User },
  { id: 'presentation', label: 'Presentation', icon: Activity },
  { id: 'vitals', label: 'Vital Signs', icon: Activity },
  { id: 'physical', label: 'Physical Exam', icon: Stethoscope },
  { id: 'labs', label: 'Lab Results', icon: TestTube },
  { id: 'imaging', label: 'Imaging', icon: Image },
  { id: 'assessment', label: 'Assessment', icon: FileCheck },
  { id: 'objectives', label: 'Objectives', icon: Target },
  { id: 'bulk', label: 'Input Bulk', icon: Archive },
];

const fieldMappings = [
  // Overview
  { path: 'title', label: 'Case Title', tab: 'overview' },
  { path: 'description', label: 'Case Description', tab: 'overview' },
  { path: 'difficulty', label: 'Difficulty Level', tab: 'overview' },
  { path: 'duration', label: 'Duration', tab: 'overview' },
  { path: 'tags', label: 'Tags', tab: 'overview' },
  
  // Patient Info
  { path: 'patientInfo.name', label: 'Patient Name', tab: 'patient' },
  { path: 'patientInfo.age', label: 'Age', tab: 'patient' },
  { path: 'patientInfo.gender', label: 'Gender', tab: 'patient' },
  { path: 'patientInfo.weight', label: 'Weight', tab: 'patient' },
  { path: 'patientInfo.height', label: 'Height', tab: 'patient' },
  { path: 'patientInfo.allergies', label: 'Allergies', tab: 'patient' },
  { path: 'patientInfo.medications', label: 'Medications', tab: 'patient' },
  { path: 'patientInfo.medicalHistory', label: 'Medical History', tab: 'patient' },
  { path: 'patientInfo.chiefComplaint', label: 'Chief Complaint', tab: 'patient' },
  
  // Presentation
  { path: 'scenario.initialPresentation', label: 'Initial Presentation', tab: 'presentation' },
  
  // Vital Signs
  { path: 'scenario.vitalSigns.heartRate', label: 'Heart Rate', tab: 'vitals' },
  { path: 'scenario.vitalSigns.respiratoryRate', label: 'Respiratory Rate', tab: 'vitals' },
  { path: 'scenario.vitalSigns.temperature', label: 'Temperature', tab: 'vitals' },
  { path: 'scenario.vitalSigns.oxygenSaturation', label: 'O2 Saturation', tab: 'vitals' },
  { path: 'scenario.vitalSigns.bloodPressure.systolic', label: 'Systolic BP', tab: 'vitals' },
  { path: 'scenario.vitalSigns.bloodPressure.diastolic', label: 'Diastolic BP', tab: 'vitals' },
  { path: 'scenario.vitalSigns.painLevel', label: 'Pain Level', tab: 'vitals' },
  
  // Physical Exam
  { path: 'scenario.physicalExam.general', label: 'General Appearance', tab: 'physical' },
  { path: 'scenario.physicalExam.cardiovascular', label: 'Cardiovascular', tab: 'physical' },
  { path: 'scenario.physicalExam.respiratory', label: 'Respiratory', tab: 'physical' },
  { path: 'scenario.physicalExam.abdominal', label: 'Abdominal', tab: 'physical' },
  { path: 'scenario.physicalExam.neurological', label: 'Neurological', tab: 'physical' },
  { path: 'scenario.physicalExam.musculoskeletal', label: 'Musculoskeletal', tab: 'physical' },
  { path: 'scenario.physicalExam.skin', label: 'Skin', tab: 'physical' },
  
  // Labs
  { path: 'scenario.labResults', label: 'Lab Results', tab: 'labs' },
  
  // Imaging
  { path: 'scenario.imagingResults', label: 'Imaging Results', tab: 'imaging' },
  
  // Assessment
  { path: 'scenario.progressNotes', label: 'Progress Notes', tab: 'assessment' },
  
  // Objectives
  { path: 'learningObjectives', label: 'Learning Objectives', tab: 'objectives' },
  
  // Bulk
  { path: 'inputBulk', label: 'Unmatched Content', tab: 'bulk' },
];

const ReviewCasePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;
  const { processedData, clearProcessedData } = useDocumentStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [originalText, setOriginalText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [caseData, setCaseData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [textSelection, setTextSelection] = useState<TextSelectionPopup>({
    show: false,
    x: 0,
    y: 0,
    selectedText: ''
  });
  
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip error check if we're in the middle of saving/redirecting
    if (isSaving || isRedirecting) return;
    
    if (!processedData || processedData.caseId !== caseId) {
      // Redirect back if no processed data or wrong case ID
      toast.error('No document data found. Please upload a document first.');
      router.push('/create-from-document');
      return;
    }

    setOriginalText(processedData.originalText);
    
    // Initialize case data with expanded structure including bulk field
    const initialCaseData = {
      ...processedData.parsedData,
      inputBulk: processedData.parsedData.inputBulk || '',
      scenario: {
        ...processedData.parsedData.scenario,
        labResults: processedData.parsedData.scenario?.labResults || [],
        imagingResults: processedData.parsedData.scenario?.imagingResults || [],
        progressNotes: processedData.parsedData.scenario?.progressNotes || [],
      }
    };
    
    setCaseData(initialCaseData);
  }, [processedData, caseId, router, isSaving, isRedirecting]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !textContainerRef.current) {
      setTextSelection(prev => ({ ...prev, show: false }));
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setTextSelection(prev => ({ ...prev, show: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setTextSelection({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      selectedText
    });
  };

  const handleAssignToField = (fieldPath: string) => {
    if (!textSelection.selectedText) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateNestedField = (obj: any, path: string, value: any) => {
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      const target = keys.reduce((curr, key) => curr[key], obj);
      
      if (Array.isArray(target[lastKey])) {
        // For array fields, add to the array if not already present
        if (!target[lastKey].includes(value)) {
          target[lastKey] = [...target[lastKey], value];
        }
      } else {
        target[lastKey] = value;
      }
    };

    const newCaseData = { ...caseData };
    updateNestedField(newCaseData, fieldPath, textSelection.selectedText);
    setCaseData(newCaseData);
    
    setTextSelection(prev => ({ ...prev, show: false }));
    toast.success(`Assigned text to ${fieldPath.split('.').pop()}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (fieldPath: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateNestedField = (obj: any, path: string, newValue: any) => {
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      const target = keys.reduce((curr, key) => curr[key], obj);
      target[lastKey] = newValue;
    };

    const newCaseData = { ...caseData };
    updateNestedField(newCaseData, fieldPath, value);
    setCaseData(newCaseData);
  };

  const handleSaveCase = async () => {
    if (!caseData) {
      toast.error('No case data to save');
      return;
    }

    setIsSaving(true);
    setIsRedirecting(true);

    try {
      const newCaseId = generateId();
      const now = new Date();

      const simulationCase: SimulationCase = {
        id: newCaseId,
        title: caseData.title || 'Untitled Case',
        description: caseData.description || '',
        difficulty: caseData.difficulty || 'intermediate',
        duration: caseData.duration || 45,
        tags: caseData.tags || [],
        learningObjectives: caseData.learningObjectives || [],
        patientInfo: {
          name: caseData.patientInfo?.name || 'Unknown Patient',
          age: caseData.patientInfo?.age || 0,
          gender: caseData.patientInfo?.gender || 'other',
          weight: caseData.patientInfo?.weight || 70,
          height: caseData.patientInfo?.height || 170,
          allergies: caseData.patientInfo?.allergies || [],
          medications: caseData.patientInfo?.medications || [],
          medicalHistory: caseData.patientInfo?.medicalHistory || [],
          chiefComplaint: caseData.patientInfo?.chiefComplaint || '',
        },
        scenario: {
          initialPresentation: caseData.scenario?.initialPresentation || '',
          vitalSigns: {
            bloodPressure: {
              systolic: caseData.scenario?.vitalSigns?.bloodPressure?.systolic || 120,
              diastolic: caseData.scenario?.vitalSigns?.bloodPressure?.diastolic || 80,
            },
            heartRate: caseData.scenario?.vitalSigns?.heartRate || 80,
            respiratoryRate: caseData.scenario?.vitalSigns?.respiratoryRate || 16,
            temperature: caseData.scenario?.vitalSigns?.temperature || 37.0,
            oxygenSaturation: caseData.scenario?.vitalSigns?.oxygenSaturation || 98,
            painLevel: caseData.scenario?.vitalSigns?.painLevel || 0,
          },
          physicalExam: {
            general: caseData.scenario?.physicalExam?.general || '',
            cardiovascular: caseData.scenario?.physicalExam?.cardiovascular || '',
            respiratory: caseData.scenario?.physicalExam?.respiratory || '',
            abdominal: caseData.scenario?.physicalExam?.abdominal || '',
            neurological: caseData.scenario?.physicalExam?.neurological || '',
            musculoskeletal: caseData.scenario?.physicalExam?.musculoskeletal || '',
            skin: caseData.scenario?.physicalExam?.skin || '',
          },
          labResults: caseData.scenario?.labResults || [],
          imagingResults: caseData.scenario?.imagingResults || [],
          progressNotes: caseData.scenario?.progressNotes || [],
        },
        createdBy: 'document-upload',
        createdAt: now,
        updatedAt: now,
        isPublic: false,
      };

      const saved = saveCase(simulationCase);
      
      if (saved) {
        toast.success('Case created successfully from document!');
        
        // Clear the processed data and redirect in a controlled way
        clearProcessedData();
        
        // Use router.replace to prevent going back to the review page
        setTimeout(() => {
          router.replace(`/case/${newCaseId}`);
        }, 500); // Small delay for UX
        
      } else {
        throw new Error('Failed to save case');
      }
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error('Failed to save case. Please try again.');
      setIsSaving(false);
      setIsRedirecting(false);
    }
  };

  const renderTabContent = () => {
    if (!caseData) return null;

    const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const textareaClassName = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[80px]";
    const labelClassName = "block text-xs font-medium text-gray-700 mb-1";

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Case Title</label>
              <input
                type="text"
                value={caseData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={inputClassName}
                placeholder="Enter case title"
              />
            </div>
            <div>
              <label className={labelClassName}>Description</label>
              <textarea
                value={caseData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={textareaClassName}
                placeholder="Brief case description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClassName}>Difficulty</label>
                <select
                  value={caseData.difficulty || 'intermediate'}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className={inputClassName}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Duration (minutes)</label>
                <input
                  type="number"
                  value={caseData.duration || ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className={labelClassName}>Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(caseData.tags) ? caseData.tags.join(', ') : ''}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                className={inputClassName}
                placeholder="cardiology, emergency, pediatric"
              />
            </div>
          </div>
        );

      case 'patient':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Patient Name</label>
                <input
                  type="text"
                  value={caseData.patientInfo?.name || ''}
                  onChange={(e) => handleInputChange('patientInfo.name', e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Age</label>
                <input
                  type="number"
                  value={caseData.patientInfo?.age || ''}
                  onChange={(e) => handleInputChange('patientInfo.age', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClassName}>Gender</label>
                <select
                  value={caseData.patientInfo?.gender || 'other'}
                  onChange={(e) => handleInputChange('patientInfo.gender', e.target.value)}
                  className={inputClassName}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Weight (kg)</label>
                <input
                  type="number"
                  value={caseData.patientInfo?.weight || ''}
                  onChange={(e) => handleInputChange('patientInfo.weight', parseFloat(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Height (cm)</label>
                <input
                  type="number"
                  value={caseData.patientInfo?.height || ''}
                  onChange={(e) => handleInputChange('patientInfo.height', parseFloat(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div>
              <label className={labelClassName}>Chief Complaint</label>
              <textarea
                value={caseData.patientInfo?.chiefComplaint || ''}
                onChange={(e) => handleInputChange('patientInfo.chiefComplaint', e.target.value)}
                className={textareaClassName}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClassName}>Allergies (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(caseData.patientInfo?.allergies) ? caseData.patientInfo.allergies.join(', ') : ''}
                onChange={(e) => handleInputChange('patientInfo.allergies', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                className={inputClassName}
                placeholder="penicillin, latex, shellfish"
              />
            </div>
            <div>
              <label className={labelClassName}>Current Medications (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(caseData.patientInfo?.medications) ? caseData.patientInfo.medications.join(', ') : ''}
                onChange={(e) => handleInputChange('patientInfo.medications', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                className={inputClassName}
                placeholder="aspirin 81mg daily, metformin 500mg BID"
              />
            </div>
            <div>
              <label className={labelClassName}>Medical History (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(caseData.patientInfo?.medicalHistory) ? caseData.patientInfo.medicalHistory.join(', ') : ''}
                onChange={(e) => handleInputChange('patientInfo.medicalHistory', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                className={inputClassName}
                placeholder="hypertension, diabetes type 2, COPD"
              />
            </div>
          </div>
        );

      case 'presentation':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Initial Presentation</label>
              <textarea
                value={caseData.scenario?.initialPresentation || ''}
                onChange={(e) => handleInputChange('scenario.initialPresentation', e.target.value)}
                className={textareaClassName}
                rows={6}
                placeholder="Describe how the patient initially presents, including symptoms, timeline, and circumstances"
              />
            </div>
          </div>
        );

      case 'vitals':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={caseData.scenario?.vitalSigns?.heartRate || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.heartRate', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Respiratory Rate (per min)</label>
                <input
                  type="number"
                  value={caseData.scenario?.vitalSigns?.respiratoryRate || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.respiratoryRate', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Systolic Blood Pressure</label>
                <input
                  type="number"
                  value={caseData.scenario?.vitalSigns?.bloodPressure?.systolic || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.bloodPressure.systolic', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Diastolic Blood Pressure</label>
                <input
                  type="number"
                  value={caseData.scenario?.vitalSigns?.bloodPressure?.diastolic || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.bloodPressure.diastolic', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClassName}>Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={caseData.scenario?.vitalSigns?.temperature || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.temperature', parseFloat(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>O2 Saturation (%)</label>
                <input
                  type="number"
                  value={caseData.scenario?.vitalSigns?.oxygenSaturation || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.oxygenSaturation', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Pain Level (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={caseData.scenario?.vitalSigns?.painLevel || ''}
                  onChange={(e) => handleInputChange('scenario.vitalSigns.painLevel', parseInt(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        );

      case 'physical':
        const physicalExamSections = [
          { key: 'general', label: 'General Appearance' },
          { key: 'cardiovascular', label: 'Cardiovascular' },
          { key: 'respiratory', label: 'Respiratory' },
          { key: 'abdominal', label: 'Abdominal' },
          { key: 'neurological', label: 'Neurological' },
          { key: 'musculoskeletal', label: 'Musculoskeletal' },
          { key: 'skin', label: 'Skin' },
        ];

        return (
          <div className="space-y-6">
            {physicalExamSections.map(({ key, label }) => (
              <div key={key}>
                <label className={labelClassName}>{label}</label>
                <textarea
                  value={caseData.scenario?.physicalExam?.[key] || ''}
                  onChange={(e) => handleInputChange(`scenario.physicalExam.${key}`, e.target.value)}
                  className={textareaClassName}
                  rows={3}
                />
              </div>
            ))}
          </div>
        );

      case 'labs':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Laboratory Results</label>
              <textarea
                value={JSON.stringify(caseData.scenario?.labResults || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('scenario.labResults', parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className={textareaClassName}
                rows={8}
                placeholder="Enter lab results in JSON format or as text"
              />
            </div>
          </div>
        );

      case 'imaging':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Imaging Results</label>
              <textarea
                value={JSON.stringify(caseData.scenario?.imagingResults || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('scenario.imagingResults', parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className={textareaClassName}
                rows={8}
                placeholder="Enter imaging results in JSON format or as text"
              />
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Progress Notes & Assessment</label>
              <textarea
                value={JSON.stringify(caseData.scenario?.progressNotes || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('scenario.progressNotes', parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className={textareaClassName}
                rows={8}
                placeholder="Enter progress notes and assessment in JSON format or as text"
              />
            </div>
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Learning Objectives (one per line)</label>
              <textarea
                value={Array.isArray(caseData.learningObjectives) ? caseData.learningObjectives.join('\n') : ''}
                onChange={(e) => handleInputChange('learningObjectives', e.target.value.split('\n').filter(Boolean))}
                className={textareaClassName}
                rows={6}
                placeholder="Enter learning objectives, one per line"
              />
            </div>
          </div>
        );

      case 'bulk':
        return (
          <div className="space-y-6">
            <div>
              <label className={labelClassName}>Unmatched Content</label>
              <p className="text-xs text-gray-600 mb-2">
                                 Content that couldn&apos;t be automatically matched to specific fields (e.g., debrief questions, special instructions, etc.)
              </p>
              <textarea
                value={caseData.inputBulk || ''}
                onChange={(e) => handleInputChange('inputBulk', e.target.value)}
                className={textareaClassName}
                rows={10}
                placeholder="Paste or type any content that doesn't fit into the specific categories above"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!caseData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/create-from-document')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Upload
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Review & Edit Case</h1>
                <p className="text-sm text-gray-600">Review the extracted information and make any necessary edits</p>
              </div>
            </div>
            <button
              onClick={handleSaveCase}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Case'}
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Document Reference - Sticky Sidebar */}
          <div className="w-1/3 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Original Document
              </h3>
              <p className="text-xs text-gray-600 mt-1">Select text to assign to form fields</p>
            </div>
            <div 
              ref={textContainerRef}
              className="flex-1 p-4 overflow-y-auto text-sm text-gray-700 leading-relaxed cursor-text select-text"
              onMouseUp={handleTextSelection}
            >
              <pre className="whitespace-pre-wrap font-sans">{originalText}</pre>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-6">
              <div className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Text Selection Popup */}
        {textSelection.show && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs"
            style={{
              left: Math.max(10, textSelection.x - 150),
              top: Math.max(10, textSelection.y - 10),
            }}
          >
            <div className="text-xs text-gray-600 mb-2 font-medium">
              Assign selected text to:
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {fieldMappings
                .filter(field => field.tab === activeTab)
                .map((field) => (
                <button
                  key={field.path}
                  onClick={() => handleAssignToField(field.path)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                  {field.label}
                </button>
              ))}
              {activeTab !== 'bulk' && (
                <button
                  onClick={() => handleAssignToField('inputBulk')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 hover:text-gray-700 rounded transition-colors border-t border-gray-100 mt-2 pt-2"
                >
                  Add to Input Bulk
                </button>
              )}
            </div>
            <button
              onClick={() => setTextSelection(prev => ({ ...prev, show: false }))}
              className="w-full mt-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ReviewCasePage; 