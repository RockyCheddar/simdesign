'use client';

import React from 'react';
import { useLearningContext, useCaseCreationStore, useFormErrors } from '@/stores/caseCreationStore';

const LearningContextStep: React.FC = () => {
  const learningContext = useLearningContext();
  const errors = useFormErrors();
  const { updateLearningContext, clearError } = useCaseCreationStore();

  const handleInputChange = (field: keyof typeof learningContext, value: any) => {
    updateLearningContext({ [field]: value });
    if (errors[field]) {
      clearError(field);
    }
  };

  const addLearningObjective = () => {
    const currentObjectives = learningContext.learningObjectives || [];
    updateLearningContext({
      learningObjectives: [...currentObjectives, '']
    });
  };

  const updateLearningObjective = (index: number, value: string) => {
    const currentObjectives = learningContext.learningObjectives || [];
    const newObjectives = [...currentObjectives];
    newObjectives[index] = value;
    updateLearningContext({ learningObjectives: newObjectives });
  };

  const removeLearningObjective = (index: number) => {
    const currentObjectives = learningContext.learningObjectives || [];
    const newObjectives = currentObjectives.filter((_, i) => i !== index);
    updateLearningContext({ learningObjectives: newObjectives });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Learning Context & Objectives
          </h2>
          <p className="text-gray-600">
            Define the target audience, learning goals, and basic parameters for your simulation case.
          </p>
        </div>

        {/* Case Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Case Title
          </label>
          <input
            type="text"
            id="title"
            value={learningContext.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Acute Myocardial Infarction in the Emergency Department"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-600 text-sm">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={learningContext.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide a brief overview of the simulation case"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Target Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Learners */}
          <div className="space-y-2">
            <label htmlFor="targetLearners" className="block text-sm font-medium text-gray-700">
              Target Learners <span className="text-red-500">*</span>
            </label>
            <select
              id="targetLearners"
              value={learningContext.targetLearners || ''}
              onChange={(e) => handleInputChange('targetLearners', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.targetLearners ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select target learners</option>
              <option value="nursing-students">Nursing Students</option>
              <option value="medical-students">Medical Students</option>
              <option value="residents">Residents</option>
              <option value="practicing-nurses">Practicing Nurses</option>
              <option value="interdisciplinary-team">Interdisciplinary Team</option>
              <option value="other">Other</option>
            </select>
            {errors.targetLearners && (
              <p className="text-red-600 text-sm">{errors.targetLearners}</p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              id="experienceLevel"
              value={learningContext.experienceLevel || ''}
              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.experienceLevel ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select experience level</option>
              <option value="novice">Novice</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {errors.experienceLevel && (
              <p className="text-red-600 text-sm">{errors.experienceLevel}</p>
            )}
          </div>

          {/* Clinical Domain */}
          <div className="space-y-2">
            <label htmlFor="clinicalDomain" className="block text-sm font-medium text-gray-700">
              Clinical Domain <span className="text-red-500">*</span>
            </label>
            <select
              id="clinicalDomain"
              value={learningContext.clinicalDomain || ''}
              onChange={(e) => handleInputChange('clinicalDomain', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.clinicalDomain ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select clinical domain</option>
              <option value="emergency-department">Emergency Department</option>
              <option value="icu">ICU</option>
              <option value="medical-surgical">Medical-Surgical</option>
              <option value="operating-room">Operating Room</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="obstetrics">Obstetrics</option>
              <option value="mental-health">Mental Health</option>
              <option value="community-health">Community Health</option>
              <option value="other">Other</option>
            </select>
            {errors.clinicalDomain && (
              <p className="text-red-600 text-sm">{errors.clinicalDomain}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration <span className="text-red-500">*</span>
            </label>
            <select
              id="duration"
              value={learningContext.duration || ''}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.duration ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select duration</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
            {errors.duration && (
              <p className="text-red-600 text-sm">{errors.duration}</p>
            )}
          </div>

          {/* Participant Count */}
          <div className="space-y-2">
            <label htmlFor="participantCount" className="block text-sm font-medium text-gray-700">
              Number of Participants <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="participantCount"
              min="1"
              max="20"
              value={learningContext.participantCount || ''}
              onChange={(e) => handleInputChange('participantCount', parseInt(e.target.value) || 0)}
              placeholder="4"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                errors.participantCount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.participantCount && (
              <p className="text-red-600 text-sm">{errors.participantCount}</p>
            )}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Learning Objectives <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addLearningObjective}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Objective
            </button>
          </div>
          
          <div className="space-y-3">
            {(learningContext.learningObjectives || []).map((objective, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-2">
                  <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => updateLearningObjective(index, e.target.value)}
                    placeholder="Describe what learners should be able to do after completing this case"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLearningObjective(index)}
                  className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 mt-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            {(!learningContext.learningObjectives || learningContext.learningObjectives.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-2">No learning objectives added yet</p>
                <button
                  type="button"
                  onClick={addLearningObjective}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add your first learning objective
                </button>
              </div>
            )}
          </div>
          
          {errors.learningObjectives && (
            <p className="text-red-600 text-sm">{errors.learningObjectives}</p>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Tips for Learning Objectives</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use action verbs (analyze, demonstrate, evaluate, apply)</li>
                <li>• Be specific and measurable</li>
                <li>• Focus on what learners will DO, not what they will know</li>
                <li>• Consider different levels of learning (knowledge, skills, attitudes)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningContextStep; 