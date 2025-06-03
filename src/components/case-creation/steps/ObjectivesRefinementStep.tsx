'use client';

import React, { useState, useEffect } from 'react';
import { 
  useLearningContext, 
  useRefinedObjectives, 
  useCaseCreationStore,
  useFormErrors 
} from '@/stores/caseCreationStore';
import { refineObjectives, validateAIConfiguration } from '@/utils/aiService';
import { RefinedObjective } from '@/types/caseCreation';

const ObjectivesRefinementStep: React.FC = () => {
  const learningContext = useLearningContext();
  const refinedObjectives = useRefinedObjectives();
  const errors = useFormErrors();
  const { updateRefinedObjectives, clearError } = useCaseCreationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [hasRefined, setHasRefined] = useState(false);

  // Check AI configuration on mount
  useEffect(() => {
    validateAIConfiguration().then(setAiConfigured);
  }, []);

  // Initialize with original objectives if not already done
  useEffect(() => {
    if (learningContext.learningObjectives && !refinedObjectives.originalObjectives?.length) {
      updateRefinedObjectives({
        originalObjectives: learningContext.learningObjectives,
        aiImprovedObjectives: [],
        selectedObjectives: [],
        feedback: '',
        isLoading: false,
        error: undefined
      });
    }
  }, [learningContext.learningObjectives, refinedObjectives.originalObjectives, updateRefinedObjectives]);

  const handleRefineObjectives = async () => {
    if (!learningContext.learningObjectives?.length) {
      return;
    }

    setIsLoading(true);
    updateRefinedObjectives({ isLoading: true, error: undefined });

    try {
      const result = await refineObjectives(
        learningContext,
        learningContext.learningObjectives
      );

      if (result.success && result.data) {
        updateRefinedObjectives({
          aiImprovedObjectives: result.data.refinedObjectives,
          feedback: result.data.generalFeedback,
          isLoading: false,
          error: undefined
        });
        setHasRefined(true);
      } else {
        updateRefinedObjectives({
          isLoading: false,
          error: result.error || 'Failed to refine objectives'
        });
      }
    } catch (error) {
      console.error('Error refining objectives:', error);
      updateRefinedObjectives({
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptObjective = (index: number, accepted: boolean) => {
    const updatedObjectives = [...(refinedObjectives.aiImprovedObjectives || [])];
    if (updatedObjectives[index]) {
      updatedObjectives[index] = { ...updatedObjectives[index], accepted };
      updateRefinedObjectives({ aiImprovedObjectives: updatedObjectives });
      updateSelectedObjectives(updatedObjectives);
    }
  };

  const handleAcceptAll = () => {
    const updatedObjectives = (refinedObjectives.aiImprovedObjectives || []).map(obj => ({
      ...obj,
      accepted: true
    }));
    updateRefinedObjectives({ aiImprovedObjectives: updatedObjectives });
    updateSelectedObjectives(updatedObjectives);
  };

  const handleRejectAll = () => {
    const updatedObjectives = (refinedObjectives.aiImprovedObjectives || []).map(obj => ({
      ...obj,
      accepted: false
    }));
    updateRefinedObjectives({ aiImprovedObjectives: updatedObjectives });
    updateSelectedObjectives(updatedObjectives);
  };

  const updateSelectedObjectives = (objectives: RefinedObjective[]) => {
    const selected = objectives
      .filter(obj => obj.accepted)
      .map(obj => obj.refined);
    
    // If no refined objectives are accepted, use original objectives
    const finalSelected = selected.length > 0 ? selected : (refinedObjectives.originalObjectives || []);
    
    updateRefinedObjectives({ selectedObjectives: finalSelected });
    
    // Clear validation error if we have selected objectives
    if (finalSelected.length > 0 && errors.selectedObjectives) {
      clearError('selectedObjectives');
    }
  };

  const getAcceptedCount = () => {
    return (refinedObjectives.aiImprovedObjectives || []).filter(obj => obj.accepted).length;
  };

  // AI Configuration Error
  if (aiConfigured === false) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Objectives Refinement
          </h2>
          <p className="text-gray-600 mb-8">
            Let AI help improve your learning objectives for better educational outcomes.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800 mb-2">AI Service Not Available</h3>
              <p className="text-red-700 mb-4">
                The AI refinement service is not properly configured. Please contact your administrator 
                to set up the Anthropic API key.
              </p>
              <p className="text-sm text-red-600">
                You can continue with your original objectives for now.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Objectives Refinement
          </h2>
          <p className="text-gray-600">
            Let AI help improve your learning objectives for better educational outcomes.
          </p>
        </div>

        {/* Context Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Simulation Context</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Target:</span>
              <p className="text-blue-800">{learningContext.targetLearners?.replace('-', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Level:</span>
              <p className="text-blue-800 capitalize">{learningContext.experienceLevel || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Domain:</span>
              <p className="text-blue-800">{learningContext.clinicalDomain?.replace('-', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Duration:</span>
              <p className="text-blue-800">{learningContext.duration || 0} minutes</p>
            </div>
          </div>
        </div>

        {/* Original Objectives */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Original Objectives</h3>
              {!hasRefined && (
                <button
                  onClick={handleRefineObjectives}
                  disabled={isLoading || !learningContext.learningObjectives?.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Refining...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Refine with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {refinedObjectives.originalObjectives?.length ? (
              <div className="space-y-3">
                {refinedObjectives.originalObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-900">{objective}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No objectives available from previous step</p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {refinedObjectives.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Refinement Failed</h4>
                <p className="text-sm text-red-700">{refinedObjectives.error}</p>
                <button
                  onClick={handleRefineObjectives}
                  className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Refined Objectives */}
                 {(refinedObjectives.aiImprovedObjectives?.length || 0) > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">AI-Refined Objectives</h3>
                                     <p className="text-sm text-green-700">
                     {getAcceptedCount()} of {refinedObjectives.aiImprovedObjectives?.length || 0} objectives accepted
                   </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAcceptAll}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleRefineObjectives}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Refine Again
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                                 {(refinedObjectives.aiImprovedObjectives || []).map((objective, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">Objective {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAcceptObjective(index, !objective.accepted)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                              objective.accepted
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {objective.accepted ? 'Accepted' : 'Accept'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Original */}
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</label>
                          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                            {objective.original}
                          </p>
                        </div>
                        
                        {/* Refined */}
                        <div>
                          <label className="text-xs font-medium text-green-600 uppercase tracking-wide">AI Refined</label>
                          <p className="mt-1 text-sm text-gray-900 bg-green-50 p-3 rounded border border-green-200">
                            {objective.refined}
                          </p>
                        </div>
                      </div>
                      
                      {/* Explanation */}
                      <div className="mt-4">
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Explanation</label>
                        <p className="mt-1 text-sm text-blue-800 bg-blue-50 p-3 rounded border border-blue-200">
                          {objective.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* General Feedback */}
        {refinedObjectives.feedback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h4 className="text-lg font-medium text-blue-800 mb-2">AI Feedback</h4>
                <p className="text-blue-700">{refinedObjectives.feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {errors.selectedObjectives && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.selectedObjectives}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">How AI Refinement Works</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI analyzes your objectives against simulation-based learning best practices</li>
                <li>• Suggestions focus on measurable outcomes and appropriate action verbs</li>
                <li>• Context from your simulation parameters guides the refinements</li>
                <li>• You can accept individual suggestions or keep your original objectives</li>
                <li>• Final objectives will be used for case generation in the next steps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesRefinementStep; 