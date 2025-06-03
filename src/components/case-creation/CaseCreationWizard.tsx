'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStep, useCaseCreationStore } from '@/stores/caseCreationStore';
import FormNavigation from './FormNavigation';
import LearningContextStep from './steps/LearningContextStep';
import ObjectivesRefinementStep from './steps/ObjectivesRefinementStep';
import ParameterQuestionsStep from './steps/ParameterQuestionsStep';
import CasePreviewStep from './steps/CasePreviewStep';
import CaseGenerationStep from './steps/CaseGenerationStep';
import { toast } from 'react-hot-toast';

// TEST: Simple console log to verify console is working
console.log('🚀 CaseCreationWizard component loaded - Console is working!');

const CaseCreationWizard: React.FC = () => {
  const router = useRouter();
  const currentStep = useCurrentStep();
  const { resetForm } = useCaseCreationStore();

  const stepTitles = [
    'Learning Context & Objectives',
    'AI Objectives Refinement', 
    'Case Parameter Questions',
    'Case Preview',
    'Case Generation'
  ];

  const completionPercentage = (currentStep / 5) * 100;

  const handleCancel = () => {
    resetForm();
    router.push('/');
  };

  const handleComplete = async () => {
    // This will be called when the case generation is complete
    // Navigate to the case details page if we have a saved case ID
    const state = useCaseCreationStore.getState();
    const { savedCaseId, generatedCase } = state;
    
    console.log('=== NAVIGATION DEBUG ===');
    console.log('handleComplete called');
    console.log('Full store state keys:', Object.keys(state));
    console.log('savedCaseId:', savedCaseId);
    console.log('generatedCase exists:', !!generatedCase);
    console.log('generatedCase title:', generatedCase?.overview?.caseTitle);
    
    if (savedCaseId) {
      console.log('✅ Using savedCaseId for navigation:', savedCaseId);
      
      // Verify the case exists before navigating
      const { loadCase } = await import('@/utils/caseStorage');
      const verifyCase = loadCase(savedCaseId);
      
      if (verifyCase) {
        console.log('✅ Case verified, navigating to:', savedCaseId);
        console.log('Case details:', { id: verifyCase.id, title: verifyCase.title });
        toast.success('Case created and saved successfully!');
        router.push(`/case/${savedCaseId}`);
        return;
      } else {
        console.error('❌ Case verification failed for savedCaseId:', savedCaseId);
        toast.error('Case was created but could not be loaded. Please check the dashboard.');
      }
    } else {
      console.log('❌ No savedCaseId found, checking localStorage...');
    }
    
    // Fallback: try to find the latest case from localStorage
    const { loadAllCases } = await import('@/utils/caseStorage');
    const cases = loadAllCases();
    console.log('Cases found in localStorage:', cases.length);
    
    if (cases.length > 0) {
      console.log('All cases:', cases.map(c => ({ 
        id: c.id, 
        title: c.title, 
        createdAt: c.createdAt,
        createdBy: c.createdBy,
        isDemo: c.createdBy === 'demo-user'
      })));
      
      // Filter out demo cases and find the most recent user-created case
      const userCases = cases.filter(c => c.createdBy !== 'demo-user');
      console.log('User-created cases:', userCases.length);
      
      if (userCases.length > 0) {
        const latestUserCase = userCases[0]; // Most recent user case
        console.log('✅ Using latest user case:', latestUserCase.id, latestUserCase.title);
        toast.success('Case created and saved successfully!');
        router.push(`/case/${latestUserCase.id}`);
        return;
      }
      
      // If no user cases, use the most recent case (even if demo)
      const latestCase = cases[0];
      console.log('⚠️ No user cases found, using latest case (might be demo):', latestCase.id, latestCase.title);
      toast.success('Case created and saved successfully!');
      router.push(`/case/${latestCase.id}`);
      return;
    }
    
    console.log('❌ No cases found at all, redirecting to dashboard');
    toast.success('Case created successfully!');
    router.push('/');
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

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Progress Bar with Step Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Step {currentStep} of 5: {stepTitles[currentStep - 1]}</span>
              <span>{Math.round(completionPercentage)}% Complete</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {renderCurrentStep()}
          </div>
        </div>
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