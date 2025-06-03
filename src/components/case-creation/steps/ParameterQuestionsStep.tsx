'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParameterQuestions, useParameterAnswers, useCaseCreationStore, useRefinedObjectives, useGenerationProgress } from '@/stores/caseCreationStore';

const ParameterQuestionsStep: React.FC = () => {
  const parameterQuestions = useParameterQuestions();
  const parameterAnswers = useParameterAnswers();
  const refinedObjectives = useRefinedObjectives();
  const generationProgress = useGenerationProgress();
  const { updateParameterAnswer, generateParameterQuestions } = useCaseCreationStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateQuestions = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateParameterQuestions();
      setHasGenerated(true);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateParameterQuestions]);

  // Generate questions when component mounts if not already generated
  useEffect(() => {
    if (!hasGenerated && parameterQuestions.length === 0 && refinedObjectives.selectedObjectives?.length) {
      handleGenerateQuestions();
    }
  }, [refinedObjectives.selectedObjectives, hasGenerated, parameterQuestions.length, handleGenerateQuestions]);

  const handleAnswerChange = (questionId: string, value: string) => {
    updateParameterAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < parameterQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    // Clear the answer for current question and move to next
    if (parameterQuestions[currentQuestionIndex]) {
      updateParameterAnswer(parameterQuestions[currentQuestionIndex].id, '');
    }
    handleNext();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clinical_scenario':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'simulation_resources':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'complexity_fidelity':
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'assessment_methods':
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'facilitation_style':
        return (
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'clinical_scenario':
        return 'Clinical Scenario';
      case 'simulation_resources':
        return 'Simulation Resources';
      case 'complexity_fidelity':
        return 'Complexity & Fidelity';
      case 'assessment_methods':
        return 'Assessment Methods';
      case 'facilitation_style':
        return 'Facilitation Style';
      default:
        return category;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'clinical_scenario':
        return 'Patient demographics, condition, presentation, and clinical setting';
      case 'simulation_resources':
        return 'Equipment type, fidelity level, and available props';
      case 'complexity_fidelity':
        return 'Case severity, psychological realism, and distractors';
      case 'assessment_methods':
        return 'Evaluation approach, performance measures, and feedback type';
      case 'facilitation_style':
        return 'Instructor involvement, cuing strategy, and debriefing focus';
      default:
        return '';
    }
  };

  // Show loading state while generating questions
  if (isGenerating || generationProgress.status === 'generating') {
    return (
      <div className="p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Parameter Questions
            </h2>
            <p className="text-gray-600 mb-4">
              Our AI is creating customized questions based on your learning context and objectives...
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                {generationProgress.currentPhase || 'Analyzing your requirements...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if generation failed
  if (generationProgress.status === 'error') {
    return (
      <div className="p-8">
        <div className="text-center space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Failed to Generate Questions
            </h2>
            <p className="text-red-700 mb-4">
              {generationProgress.error || 'An error occurred while generating your parameter questions.'}
            </p>
            <button
              onClick={handleGenerateQuestions}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no questions generated yet
  if (parameterQuestions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generate Parameter Questions
          </h2>
          <p className="text-gray-600 mb-6">
            Click below to generate AI-powered questions based on your learning context and objectives.
          </p>
          <button
            onClick={handleGenerateQuestions}
            disabled={!refinedObjectives.selectedObjectives?.length}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate Questions
          </button>
          {!refinedObjectives.selectedObjectives?.length && (
            <p className="text-sm text-red-600">
              Please complete the previous steps to generate questions.
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = parameterQuestions[currentQuestionIndex];
  const currentAnswer = parameterAnswers[currentQuestion?.id] as string;
  const answeredCount = Object.keys(parameterAnswers).length;
  const progressPercentage = (answeredCount / parameterQuestions.length) * 100;

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Case Parameter Questions
          </h2>
          <p className="text-gray-600">
            Answer these AI-generated questions to customize your simulation case
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <span className="text-lg font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {parameterQuestions.length}
            </span>
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(currentQuestion.category)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getCategoryTitle(currentQuestion.category)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentQuestion.focusArea || getCategoryDescription(currentQuestion.category)}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h4>
                  
                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          currentAnswer === option
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={currentAnswer === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Why This Matters Box */}
                {currentQuestion.whyThisMatters && (
                  <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-base font-semibold text-blue-900 mb-1">Why This Matters</h4>
                        <p className="text-sm text-blue-800">
                          {currentQuestion.whyThisMatters}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex space-x-3">
                    {currentQuestionIndex < parameterQuestions.length - 1 && (
                      <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                    
                    {currentQuestionIndex < parameterQuestions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All questions completed!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterQuestionsStep; 