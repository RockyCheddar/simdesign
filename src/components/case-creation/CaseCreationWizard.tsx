'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStep, useCaseCreationStore } from '@/stores/caseCreationStore';
import ProgressStepper from './ProgressStepper';
import FormNavigation from './FormNavigation';
import LearningContextStep from './steps/LearningContextStep';
import ObjectivesRefinementStep from './steps/ObjectivesRefinementStep';
import ParameterQuestionsStep from './steps/ParameterQuestionsStep';
import CasePreviewStep from './steps/CasePreviewStep';
import CaseGenerationStep from './steps/CaseGenerationStep';
import { toast } from 'react-hot-toast';

const CaseCreationWizard: React.FC = () => {
  const router = useRouter();
  const currentStep = useCurrentStep();
  const { resetForm } = useCaseCreationStore();

  const handleCancel = () => {
    resetForm();
    router.push('/');
  };

  const handleComplete = async () => {
    // This will be called when the case generation is complete
    // Navigate to the case details page if we have a saved case ID
    const state = useCaseCreationStore.getState();
    const { savedCaseId } = state;
    
    console.log('handleComplete called');
    console.log('Full store state:', state);
    console.log('savedCaseId:', savedCaseId);
    
    if (savedCaseId) {
      console.log('Navigating to case:', savedCaseId);
      toast.success('Case created and saved successfully!');
      router.push(`/case/${savedCaseId}`);
    } else {
      console.log('No savedCaseId found, checking localStorage...');
      // Fallback: try to find the latest case from localStorage
      const { loadAllCases } = await import('@/utils/caseStorage');
      const cases = loadAllCases();
      console.log('Cases found in localStorage:', cases.length);
      if (cases.length > 0) {
        console.log('All cases:', cases.map(c => ({ id: c.id, title: c.title, createdAt: c.createdAt })));
      }
      const latestCase = cases[0]; // Most recent case
      if (latestCase) {
        console.log('Using latest case:', latestCase.id, latestCase.title);
        toast.success('Case created and saved successfully!');
        router.push(`/case/${latestCase.id}`);
      } else {
        console.log('No cases found, redirecting to dashboard');
        toast.success('Case created successfully!');
        router.push('/');
      }
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <LearningContextStep />;
      case 2:
        return <ObjectivesRefinementStep />;
      case 3:
        return <ParameterQuestionsStep />;
      case 4:
        return <CasePreviewStep />;
      case 5:
        return <CaseGenerationStep />;
      default:
        return <LearningContextStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Case</h1>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <ProgressStepper />

      {/* Main Content */}
      <div className="flex-1">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <FormNavigation 
        onCancel={handleCancel}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default CaseCreationWizard; 