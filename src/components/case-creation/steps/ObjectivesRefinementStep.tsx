'use client';

import React from 'react';
import { useRefinedObjectives, useLearningContext, useCaseCreationStore } from '@/stores/caseCreationStore';

const ObjectivesRefinementStep: React.FC = () => {
  const learningContext = useLearningContext();
  const refinedObjectives = useRefinedObjectives();
  const { updateRefinedObjectives } = useCaseCreationStore();

  // Placeholder: This will be populated by AI in a future implementation
  const mockImprovedObjectives = [
    "Demonstrate rapid assessment and triage skills for patients presenting with acute cardiac symptoms",
    "Apply evidence-based diagnostic criteria to differentiate between cardiac emergencies and other conditions",
    "Execute appropriate emergency interventions following established protocols for myocardial infarction",
    "Communicate effectively with patients and healthcare team members during high-stress cardiac emergencies"
  ];

  const handleObjectiveSelection = (objective: string, isSelected: boolean) => {
    const currentSelected = refinedObjectives.selectedObjectives || [];
    const newSelected = isSelected 
      ? [...currentSelected, objective]
      : currentSelected.filter(obj => obj !== objective);
    
    updateRefinedObjectives({ selectedObjectives: newSelected });
  };

  const isObjectiveSelected = (objective: string) => {
    return refinedObjectives.selectedObjectives?.includes(objective) || false;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Enhanced Learning Objectives
          </h2>
          <p className="text-gray-600">
            Review and select from AI-improved learning objectives based on best practices and educational standards.
          </p>
        </div>

        {/* Original Objectives */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Original Objectives</h3>
          <div className="space-y-2">
            {(learningContext.learningObjectives || []).map((objective, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                  <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Enhancement Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">AI Enhancement</h4>
              <p className="text-sm text-blue-700">
                Our AI has analyzed your objectives and enhanced them using educational best practices, 
                Bloom's taxonomy, and medical education standards. Select the objectives you'd like to use.
              </p>
            </div>
          </div>
        </div>

        {/* AI-Improved Objectives */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Enhanced Objectives</h3>
          <div className="space-y-4">
            {mockImprovedObjectives.map((objective, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={`objective-${index}`}
                    checked={isObjectiveSelected(objective)}
                    onChange={(e) => handleObjectiveSelection(objective, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor={`objective-${index}`} className="text-gray-900 cursor-pointer">
                      {objective}
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Bloom's: Apply
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Measurable
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Action-oriented
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {refinedObjectives.selectedObjectives && refinedObjectives.selectedObjectives.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Selected Objectives ({refinedObjectives.selectedObjectives.length})
            </h4>
            <div className="space-y-2">
              {refinedObjectives.selectedObjectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Objective Option */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Want to add a custom objective?
          </h4>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Add Custom Objective
          </button>
        </div>

        {/* AI Feedback Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">AI Recommendation</h4>
              <p className="text-sm text-yellow-700">
                For optimal learning outcomes, we recommend selecting 3-5 objectives that cover 
                different cognitive levels and align with your case duration and participant experience level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesRefinementStep; 