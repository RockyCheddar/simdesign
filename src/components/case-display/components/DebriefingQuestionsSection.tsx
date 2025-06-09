'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { LoadingSpinner } from '@/components/ui';
import InfoCard, { DataRow } from './InfoCard';

interface DebriefingQuestion {
  category: 'assessment' | 'clinical_reasoning' | 'communication' | 'reflection' | 'learning';
  question: string;
  followUp?: string;
  purpose: string;
}

interface DebriefingQuestionsData {
  assessmentQuestions: DebriefingQuestion[];
  clinicalReasoningQuestions: DebriefingQuestion[];
  communicationQuestions: DebriefingQuestion[];
  reflectionQuestions: DebriefingQuestion[];
  learningQuestions: DebriefingQuestion[];
}

interface DebriefingQuestionsSectionProps {
  caseData: GeneratedCaseData;
  onContentGenerated?: (debriefingData: DebriefingQuestionsData) => void;
}

const DebriefingQuestionsSection: React.FC<DebriefingQuestionsSectionProps> = ({ 
  caseData, 
  onContentGenerated 
}) => {
  // Check if debriefing questions data already exists in the case
  const existingDebriefingData = caseData.onDemandOptions?.['debriefing-questions'] 
    ? JSON.parse(caseData.onDemandOptions['debriefing-questions']) as DebriefingQuestionsData
    : null;
    
  const [debriefingData, setDebriefingData] = useState<DebriefingQuestionsData | null>(existingDebriefingData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-debriefing-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate debriefing questions');
      }

      const { debriefingQuestionsData } = await response.json();
      setDebriefingData(debriefingQuestionsData);
      
      // Call the callback to persist the data
      if (onContentGenerated) {
        onContentGenerated(debriefingQuestionsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate debriefing questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonState = () => {
    if (isGenerating) {
      return {
        text: 'Generating...',
        className: 'bg-gray-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (debriefingData) {
      return {
        text: 'Generated ✓',
        className: 'bg-green-600 cursor-default',
        disabled: true,
      };
    }
    return {
      text: 'Generate',
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assessment': return '🔍';
      case 'clinical_reasoning': return '🧠';
      case 'communication': return '💬';
      case 'reflection': return '🪞';
      case 'learning': return '📚';
      default: return '❓';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'assessment': return 'Assessment & Recognition';
      case 'clinical_reasoning': return 'Clinical Reasoning';
      case 'communication': return 'Communication & Teamwork';
      case 'reflection': return 'Self-Reflection';
      case 'learning': return 'Learning & Application';
      default: return 'General';
    }
  };

  const renderQuestionCategory = (questions: DebriefingQuestion[], categoryKey: string) => {
    if (!questions || questions.length === 0) return null;

    return (
      <div className="space-y-4">
        <h5 className="text-md font-semibold text-gray-900 flex items-center">
          <span className="mr-2">{getCategoryIcon(categoryKey)}</span>
          {getCategoryName(categoryKey)}
        </h5>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 flex-1">
                  <span className="text-blue-600 mr-2">Q{index + 1}:</span>
                  {q.question}
                </p>
              </div>
              
              {q.followUp && (
                <div className="mt-2 ml-6">
                  <p className="text-xs text-gray-700 italic">
                    <span className="font-medium">Follow-up:</span> {q.followUp}
                  </p>
                </div>
              )}
              
              <div className="mt-2 ml-6">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Purpose:</span> {q.purpose}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!debriefingData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Debriefing Questions</h4>
              <p className="text-sm text-gray-600 mt-1">
                Generate structured debriefing questions for post-simulation discussion and reflection
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={buttonState.disabled}
              className={`
                px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2
                ${buttonState.className}
              `}
            >
              {isGenerating && <LoadingSpinner size="sm" />}
              <span>{buttonState.text}</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <InfoCard 
      title="Debriefing Questions" 
      subtitle="Structured post-simulation discussion prompts and reflection guides"
    >
      <div className="space-y-6">
        {renderQuestionCategory(debriefingData.assessmentQuestions, 'assessment')}
        {renderQuestionCategory(debriefingData.clinicalReasoningQuestions, 'clinical_reasoning')}
        {renderQuestionCategory(debriefingData.communicationQuestions, 'communication')}
        {renderQuestionCategory(debriefingData.reflectionQuestions, 'reflection')}
        {renderQuestionCategory(debriefingData.learningQuestions, 'learning')}
      </div>
    </InfoCard>
  );
};

export default DebriefingQuestionsSection; 