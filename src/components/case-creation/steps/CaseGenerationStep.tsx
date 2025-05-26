'use client';

import React from 'react';
import { useGenerationProgress, useCaseCreationStore } from '@/stores/caseCreationStore';

const CaseGenerationStep: React.FC = () => {
  const generationProgress = useGenerationProgress();
  const { updateGenerationProgress } = useCaseCreationStore();

  // Mock generation phases for demonstration
  const generationPhases = [
    { name: 'Analyzing learning objectives', duration: 10 },
    { name: 'Creating patient profile', duration: 15 },
    { name: 'Developing clinical scenario', duration: 25 },
    { name: 'Generating assessment criteria', duration: 20 },
    { name: 'Finalizing case materials', duration: 30 }
  ];

  React.useEffect(() => {
    if (generationProgress.status === 'idle') {
      // Auto-start generation when this step is reached
      startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    updateGenerationProgress({
      status: 'generating',
      currentPhase: generationPhases[0].name,
      progress: 0
    });

    // Mock generation process
    let totalProgress = 0;
    const totalDuration = generationPhases.reduce((sum, phase) => sum + phase.duration, 0);

    for (let i = 0; i < generationPhases.length; i++) {
      const phase = generationPhases[i];
      
      updateGenerationProgress({
        currentPhase: phase.name,
        estimatedTimeRemaining: Math.round((totalDuration - totalProgress) * 0.1)
      });

      // Simulate phase progress
      for (let j = 0; j <= phase.duration; j++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const phaseProgress = totalProgress + j;
        const percentComplete = Math.round((phaseProgress / totalDuration) * 100);
        
        updateGenerationProgress({
          progress: percentComplete,
          estimatedTimeRemaining: Math.max(0, Math.round((totalDuration - phaseProgress) * 0.1))
        });
      }
      
      totalProgress += phase.duration;
    }

    // Complete generation
    updateGenerationProgress({
      status: 'completed',
      currentPhase: 'Generation complete',
      progress: 100,
      estimatedTimeRemaining: 0
    });
  };

  const getStatusIcon = () => {
    switch (generationProgress.status) {
      case 'generating':
        return (
          <svg className="w-16 h-16 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getStatusMessage = () => {
    switch (generationProgress.status) {
      case 'generating':
        return {
          title: 'Generating Your Case...',
          subtitle: 'Our AI is creating a comprehensive simulation case tailored to your specifications.',
          color: 'text-blue-600'
        };
      case 'completed':
        return {
          title: 'Case Generated Successfully!',
          subtitle: 'Your simulation case is ready. Review the generated content and make any final adjustments.',
          color: 'text-green-600'
        };
      case 'error':
        return {
          title: 'Generation Failed',
          subtitle: 'There was an error generating your case. Please try again or contact support.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Ready to Generate',
          subtitle: 'Click the generate button to create your simulation case.',
          color: 'text-gray-600'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center space-y-8">
        {/* Status Icon and Message */}
        <div className="space-y-4">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold ${statusMessage.color}`}>
              {statusMessage.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {statusMessage.subtitle}
            </p>
          </div>
        </div>

        {/* Progress Information */}
        {generationProgress.status === 'generating' && (
          <div className="space-y-6">
            {/* Current Phase */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-blue-800">
                  {generationProgress.currentPhase}
                </h3>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Progress</span>
                  <span>{generationProgress.progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${generationProgress.progress}%` }}
                  />
                </div>
                {generationProgress.estimatedTimeRemaining && generationProgress.estimatedTimeRemaining > 0 && (
                  <p className="text-sm text-blue-600 text-center">
                    Estimated time remaining: {generationProgress.estimatedTimeRemaining} seconds
                  </p>
                )}
              </div>
            </div>

            {/* Generation Steps */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Process</h3>
              <div className="space-y-4">
                {generationPhases.map((phase, index) => {
                  const isCurrentPhase = generationProgress.currentPhase === phase.name;
                  const isCompleted = generationPhases.findIndex(p => p.name === generationProgress.currentPhase) > index;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : isCurrentPhase 
                            ? 'bg-blue-100 border-2 border-blue-500' 
                            : 'bg-gray-100 border-2 border-gray-300'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : isCurrentPhase ? (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        ) : (
                          <span className="text-gray-400 text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`${
                        isCurrentPhase ? 'text-blue-600 font-medium' : 
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {phase.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {generationProgress.status === 'completed' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Your Case Has Been Generated!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Generated Content:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ Patient demographics and history</li>
                    <li>✓ Clinical presentation scenario</li>
                    <li>✓ Progressive case timeline</li>
                    <li>✓ Decision points and interventions</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800">Educational Materials:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ Assessment rubrics</li>
                    <li>✓ Instructor guidelines</li>
                    <li>✓ Debrief questions</li>
                    <li>✓ Learning resources</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Review Generated Case</h4>
                    <p className="text-sm text-blue-700">Examine all components and ensure they meet your requirements</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Customize if Needed</h4>
                    <p className="text-sm text-blue-700">Make any adjustments to better fit your specific needs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Save and Use</h4>
                    <p className="text-sm text-blue-700">Export or save your case to your library for immediate use</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {generationProgress.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Generation Error
            </h3>
            <p className="text-red-700 mb-4">
              {generationProgress.error || 'An unexpected error occurred during case generation.'}
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-red-800">Possible Solutions:</h4>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Check your internet connection and try again</li>
                <li>• Simplify your case parameters and retry</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        )}

        {/* Idle State */}
        {generationProgress.status === 'idle' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Ready to generate your simulation case. This process typically takes 1-3 minutes 
              depending on the complexity of your requirements.
            </p>
            <button
              onClick={startGeneration}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Generation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseGenerationStep; 