'use client';

import React from 'react';
import { FORM_STEPS } from '@/types/caseCreation';
import { useCurrentStep, useCaseCreationStore } from '@/stores/caseCreationStore';

interface ProgressStepperProps {
  allowClickNavigation?: boolean;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ 
  allowClickNavigation = true 
}) => {
  const currentStep = useCurrentStep();
  const { goToStep } = useCaseCreationStore();

  const handleStepClick = (stepNumber: number) => {
    if (!allowClickNavigation) return;
    
    // Only allow navigation to previous steps or current step
    if (stepNumber <= currentStep) {
      goToStep(stepNumber);
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    
    if (status === 'completed') {
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    
    return <span className="text-sm font-medium">{stepNumber}</span>;
  };

  const getStepClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200";
    
    if (status === 'completed') {
      return `${baseClasses} bg-blue-600 text-white shadow-sm`;
    }
    
    if (status === 'current') {
      return `${baseClasses} bg-blue-600 text-white shadow-md ring-4 ring-blue-100`;
    }
    
    return `${baseClasses} bg-gray-200 text-gray-500`;
  };

  const getConnectorClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber + 1);
    const baseClasses = "flex-1 h-0.5 transition-all duration-200";
    
    if (status === 'completed' || (status === 'current' && stepNumber + 1 <= currentStep)) {
      return `${baseClasses} bg-blue-600`;
    }
    
    return `${baseClasses} bg-gray-200`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {FORM_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!allowClickNavigation || step.id > currentStep}
                  className={`${getStepClasses(step.id)} ${
                    allowClickNavigation && step.id <= currentStep
                      ? 'cursor-pointer hover:shadow-lg' 
                      : step.id > currentStep 
                        ? 'cursor-not-allowed' 
                        : ''
                  }`}
                >
                  {getStepIcon(step.id)}
                </button>
                
                <div className="mt-2 text-center max-w-24">
                  <p className={`text-xs font-medium ${
                    step.id === currentStep 
                      ? 'text-blue-600' 
                      : step.id < currentStep 
                        ? 'text-gray-600'
                        : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    step.id === currentStep 
                      ? 'text-blue-500' 
                      : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connector line */}
              {index < FORM_STEPS.length - 1 && (
                <div className={getConnectorClasses(step.id)} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Step {currentStep}: {FORM_STEPS[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {FORM_STEPS[currentStep - 1]?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((currentStep / FORM_STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / FORM_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStepper; 