'use client';

import React from 'react';
import { FORM_STEPS } from '@/types/caseCreation';
import { useCurrentStep, useCaseCreationStore, useFormValid } from '@/stores/caseCreationStore';

interface FormNavigationProps {
  onCancel?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  onCancel,
  onComplete,
  isLoading = false
}) => {
  const currentStep = useCurrentStep();
  const isValid = useFormValid();
  const { 
    nextStep, 
    previousStep, 
    validateCurrentStep,
    resetForm,
    generationProgress
  } = useCaseCreationStore();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;
  const isGenerationStep = currentStep === 5;
  const isGenerating = generationProgress.status === 'generating';

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep && isGenerationStep && generationProgress.status === 'completed') {
        // For completed generation, just show success message - don't redirect
        if (onComplete) {
          onComplete();
        }
      } else if (isLastStep && onComplete) {
        onComplete();
      } else {
        nextStep();
      }
    }
  };

  const handlePrevious = () => {
    if (!isGenerating) {
      previousStep();
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      resetForm();
      if (onCancel) {
        onCancel();
      }
    }
  };

  const getNextButtonText = () => {
    if (isGenerationStep) {
      if (isGenerating) {
        return 'Generating...';
      }
      if (generationProgress.status === 'completed') {
        return 'View Generated Case';
      }
      return 'Start Generation';
    }
    
    if (currentStep === 4) { // Case Preview step
      return 'Generate Case';
    }
    
    return 'Next';
  };

  const getNextButtonIcon = () => {
    if (isGenerationStep && isGenerating) {
      return (
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    if (isGenerationStep) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left side - Cancel button */}
        <button
          onClick={handleCancel}
          disabled={isGenerating}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        {/* Center - Step indicator */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Step {currentStep} of {FORM_STEPS.length}</span>
          {isGenerating && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                {generationProgress.currentPhase}
              </span>
              {generationProgress.progress > 0 && (
                <span>({generationProgress.progress}%)</span>
              )}
            </>
          )}
        </div>

        {/* Right side - Navigation buttons */}
        <div className="flex items-center space-x-3">
          {/* Previous button */}
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
          )}

          {/* Next/Complete button */}
          <button
            onClick={handleNext}
            disabled={isLoading || (isGenerationStep && isGenerating)}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              isGenerationStep
                ? isGenerating
                  ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                  : generationProgress.status === 'completed'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                : isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{getNextButtonText()}</span>
            {getNextButtonIcon()}
          </button>
        </div>
      </div>

      {/* Generation Progress Bar */}
      {isGenerationStep && generationProgress.status === 'generating' && (
        <div className="max-w-4xl mx-auto mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                {generationProgress.currentPhase}
              </span>
              {generationProgress.estimatedTimeRemaining && (
                <span className="text-sm text-blue-600">
                  ~{generationProgress.estimatedTimeRemaining}s remaining
                </span>
              )}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${generationProgress.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {generationProgress.status === 'error' && generationProgress.error && (
        <div className="max-w-4xl mx-auto mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">Generation Failed</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{generationProgress.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormNavigation; 