'use client';

import React from 'react';
import { 
  useLearningContext, 
  useRefinedObjectives, 
  useParameterAnswers,
  useCaseCreationStore
} from '@/stores/caseCreationStore';

const CasePreviewStep: React.FC = () => {
  const learningContext = useLearningContext();
  const refinedObjectives = useRefinedObjectives();
  const parameterAnswers = useParameterAnswers();
  const { updateCasePreview } = useCaseCreationStore();

  // Calculate complexity score based on parameters
  const calculateComplexityScore = () => {
    let score = 0;
    
    // Base complexity from experience level
    switch (learningContext.experienceLevel) {
      case 'beginner': score += 1; break;
      case 'intermediate': score += 2; break;
      case 'advanced': score += 3; break;
    }
    
    // Add complexity from parameters
    if (parameterAnswers.complexity_factors?.length > 2) score += 1;
    if (parameterAnswers.critical_thinking > 3) score += 1;
    if (parameterAnswers.team_dynamics === true) score += 1;
    
    return Math.min(score, 5);
  };

  // Estimate generation time
  const estimateGenerationTime = () => {
    const complexityScore = calculateComplexityScore();
    const baseTime = 60; // seconds
    const durationMultiplier = (learningContext.duration || 30) / 30;
    const objectivesMultiplier = (refinedObjectives.selectedObjectives?.length || 1) / 3;
    
    return Math.round(baseTime * complexityScore * durationMultiplier * objectivesMultiplier);
  };

  React.useEffect(() => {
    const complexityScore = calculateComplexityScore();
    const estimatedTime = estimateGenerationTime();
    
    updateCasePreview({
      learningContext: learningContext as any,
      refinedObjectives: refinedObjectives as any,
      parameterAnswers,
      complexityScore,
      estimatedGenerationTime: estimatedTime
    });
  }, [learningContext, refinedObjectives, parameterAnswers]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getComplexityLabel = (score: number) => {
    if (score <= 2) return { label: 'Low', color: 'text-green-600 bg-green-100' };
    if (score <= 3) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'High', color: 'text-red-600 bg-red-100' };
  };

  const complexityInfo = getComplexityLabel(calculateComplexityScore());

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Case Preview
          </h2>
          <p className="text-gray-600">
            Review all parameters before generating your simulation case. You can go back to make changes if needed.
          </p>
        </div>

        {/* Generation Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {estimateGenerationTime()}s
            </div>
            <div className="text-sm text-blue-800">Estimated Generation Time</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${complexityInfo.color}`}>
              {complexityInfo.label} Complexity
            </div>
            <div className="text-sm text-purple-800 mt-2">Based on your parameters</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {refinedObjectives.selectedObjectives?.length || 0}
            </div>
            <div className="text-sm text-green-800">Learning Objectives</div>
          </div>
        </div>

        {/* Case Information */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-gray-900 font-medium">{learningContext.title}</p>
            </div>
            
            {learningContext.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{learningContext.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Experience Level</label>
                <p className="text-gray-900 capitalize">{learningContext.experienceLevel}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Clinical Domain</label>
                <p className="text-gray-900">{learningContext.clinicalDomain}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="text-gray-900">{formatDuration(learningContext.duration || 0)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Participants</label>
                <p className="text-gray-900">{learningContext.participantCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Selected Learning Objectives</h3>
          </div>
          
          <div className="p-6">
            {refinedObjectives.selectedObjectives && refinedObjectives.selectedObjectives.length > 0 ? (
              <div className="space-y-3">
                {refinedObjectives.selectedObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-900">{objective}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No learning objectives selected</p>
            )}
          </div>
        </div>

        {/* Parameter Answers */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Case Parameters</h3>
          </div>
          
          <div className="p-6">
            {Object.keys(parameterAnswers).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(parameterAnswers).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <div className="mt-1">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : typeof value === 'boolean' ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Yes' : 'No'}
                        </span>
                      ) : typeof value === 'number' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{value}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-24">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No parameters configured</p>
            )}
          </div>
        </div>

        {/* Generation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h4 className="text-lg font-medium text-blue-800 mb-2">Ready to Generate</h4>
              <p className="text-blue-700 mb-4">
                Your case will be generated using advanced AI that creates realistic patient scenarios, 
                detailed clinical information, assessment criteria, and educational resources tailored 
                to your specifications.
              </p>
              
              <div className="bg-blue-100 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-800 mb-2">What will be generated:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Detailed patient demographics and medical history</li>
                  <li>• Realistic clinical presentation and symptoms</li>
                  <li>• Progressive scenarios with decision points</li>
                  <li>• Assessment rubrics aligned with learning objectives</li>
                  <li>• Instructor notes and facilitation guidelines</li>
                  <li>• Post-simulation debrief questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modification Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Want to make changes?</h4>
              <p className="text-sm text-yellow-700">
                Use the stepper navigation above to go back and modify any section. 
                All your progress will be saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasePreviewStep; 