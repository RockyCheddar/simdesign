'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  useGenerationProgress, 
  useCaseCreationStore, 
  useGeneratedCase,
  useLearningContext,
  useParameterAnswers,
  useSavedCaseId
} from '@/stores/caseCreationStore';
import { determineSmartDefaults } from '@/lib/smartDefaults';
import CaseDisplayTabs from '@/components/case-display/CaseDisplayTabs';

const CaseGenerationStep: React.FC = () => {
  const router = useRouter();
  const generationProgress = useGenerationProgress();
  const generatedCase = useGeneratedCase();
  const learningContext = useLearningContext();
  const parameterAnswers = useParameterAnswers();
  const savedCaseId = useSavedCaseId();
  const { generateComprehensiveCase, updateGenerationProgress } = useCaseCreationStore();

  const startGeneration = React.useCallback(async () => {
    console.log('=== STARTING GENERATION ===');
    console.log('About to call generateComprehensiveCase...');
    await generateComprehensiveCase();
  }, [generateComprehensiveCase]);

  // Auto-start generation when this step is reached
  React.useEffect(() => {
    console.log('=== CASE GENERATION STEP MOUNTED ===');
    console.log('Current generation status:', generationProgress.status);
    console.log('Generation progress object:', generationProgress);
    
    if (generationProgress.status === 'idle') {
      console.log('✅ Status is idle, starting generation...');
      startGeneration();
    } else {
      console.log('❌ Status is not idle, not starting generation. Status:', generationProgress.status);
    }
  }, [generationProgress.status, startGeneration]);

  const retryGeneration = async () => {
    updateGenerationProgress({
      status: 'idle',
      currentPhase: '',
      progress: 0,
      error: undefined
    });
    await generateComprehensiveCase();
  };

  const getStatusIcon = () => {
    switch (generationProgress.status) {
      case 'generating':
        return (
          <div className="relative">
            <svg className="w-16 h-16 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
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
          title: 'Generating Your Comprehensive Case...',
          subtitle: 'Our AI is creating a detailed simulation case with smart defaults tailored to your specifications.',
          color: 'text-blue-600'
        };
      case 'completed':
        return {
          title: 'Case Generated Successfully!',
          subtitle: 'Your comprehensive simulation case is ready with all components and smart defaults applied.',
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
          subtitle: 'Click the generate button to create your comprehensive simulation case.',
          color: 'text-gray-600'
        };
    }
  };

  // Get smart defaults for display
  const smartDefaults = React.useMemo(() => {
    return determineSmartDefaults(learningContext, parameterAnswers);
  }, [learningContext, parameterAnswers]);

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

        {/* Smart Defaults Preview */}
        {generationProgress.status === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Smart Defaults Applied</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {smartDefaults.expanded.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Advanced Content:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {smartDefaults.expanded.map((item, index) => (
                      <li key={index}>✓ {item.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {smartDefaults.acuteCare.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Acute Care Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {smartDefaults.acuteCare.map((item, index) => (
                      <li key={index}>✓ {item.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {smartDefaults.procedural.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Procedural Elements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {smartDefaults.procedural.map((item, index) => (
                      <li key={index}>✓ {item.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {smartDefaults.minimal.length === 0 && smartDefaults.expanded.length === 0 && 
               smartDefaults.acuteCare.length === 0 && smartDefaults.procedural.length === 0 && (
                <div className="col-span-2">
                  <p className="text-blue-700">Core content will be generated based on your specifications.</p>
                </div>
              )}
            </div>
          </div>
        )}

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

            {/* Generation Phases */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Process</h3>
              <div className="space-y-4">
                {[
                  { name: 'Analyzing learning context...', progress: 0 },
                  { name: 'Creating patient profile...', progress: 20 },
                  { name: 'Generating clinical scenario...', progress: 60 },
                  { name: 'Finalizing case materials...', progress: 90 },
                  { name: 'Case generated successfully!', progress: 100 }
                ].map((phase, index) => {
                  const isCurrentPhase = generationProgress.currentPhase === phase.name;
                  const isCompleted = generationProgress.progress > phase.progress;
                  
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

        {/* Success State - Comprehensive Case Display */}
        {generationProgress.status === 'completed' && generatedCase && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-green-800">
                  Case Generated Successfully!
                </h3>
              </div>
              <p className="text-green-700 text-center mb-4">
                Your comprehensive simulation case is ready with all components and smart defaults applied.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">6</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(generatedCase.smartDefaults || {}).length}
                  </div>
                  <div className="text-sm text-gray-600">Smart Defaults</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedCase.simulation?.learningObjectives?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Learning Objectives</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">∞</div>
                  <div className="text-sm text-gray-600">On-Demand Content</div>
                </div>
              </div>
            </div>

            {/* Comprehensive Case Display */}
            <CaseDisplayTabs 
              caseData={generatedCase} 
              caseTitle={generatedCase.overview?.caseTitle}
            />

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={async () => {
                  if (savedCaseId) {
                    router.push(`/case/${savedCaseId}`);
                  } else {
                    // Fallback: try to find the latest case from localStorage
                    const { loadAllCases } = await import('@/utils/caseStorage');
                    const cases = loadAllCases();
                    const latestCase = cases[0]; // Most recent case
                    if (latestCase) {
                      router.push(`/case/${latestCase.id}`);
                    } else {
                      router.push('/');
                    }
                  }
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Case Details</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                </svg>
                <span>Go to Dashboard</span>
              </button>
              
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(generatedCase, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `${generatedCase.overview?.caseTitle?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated_case'}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export JSON</span>
              </button>
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
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-red-800">Possible Solutions:</h4>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Check your internet connection and try again</li>
                <li>• Verify all required fields are completed in previous steps</li>
                <li>• Simplify your case parameters and retry</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
            <button
              onClick={retryGeneration}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry Generation</span>
            </button>
          </div>
        )}

        {/* Idle State */}
        {generationProgress.status === 'idle' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Ready to generate your comprehensive simulation case. This process typically takes 1-2 minutes 
              and will create a detailed case with smart defaults based on your specifications.
            </p>
            <button
              onClick={startGeneration}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Comprehensive Case</span>
            </button>
          </div>
        )}

        {/* Wrong Status State - Manual Reset Option */}
        {generationProgress.status === 'completed' && generationProgress.currentPhase === 'Questions generated successfully' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-yellow-800">Generation Status Issue Detected</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              The generation status is stuck from a previous step. Click the button below to reset and start case generation.
            </p>
            <button
              onClick={async () => {
                console.log('Manual reset triggered');
                updateGenerationProgress({
                  status: 'idle',
                  currentPhase: '',
                  progress: 0,
                  error: undefined
                });
                // Small delay to ensure state is updated
                setTimeout(() => {
                  startGeneration();
                }, 100);
              }}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset & Generate Case</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseGenerationStep; 