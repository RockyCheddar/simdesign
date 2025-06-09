'use client';

import React, { useState } from 'react';
import { SimulationCase } from '@/types';
import { exportCaseAsJSON, deleteCase } from '@/utils/caseStorage';
import { toast } from 'react-hot-toast';

interface CaseCardProps {
  simulationCase: SimulationCase;
  onDelete: (caseId: string) => void;
  onView: (caseId: string) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ simulationCase, onDelete, onView }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      exportCaseAsJSON(simulationCase);
      toast.success('Case exported successfully');
    } catch {
      toast.error('Failed to export case');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      const success = deleteCase(simulationCase.id);
      if (success) {
        toast.success('Case deleted successfully');
        onDelete(simulationCase.id);
      } else {
        toast.error('Failed to delete case');
      }
    } catch {
      toast.error('Failed to delete case');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleView = () => {
    onView(simulationCase.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header with Title */}
      <div className="p-5 border-b border-gray-100">
        <div className="mb-3">
          {/* Title */}
          <div className="mb-3">
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors leading-tight mb-3"
              onClick={handleView}
            >
              {simulationCase.title}
            </h3>
          </div>
          
          {/* Difficulty Badge with Date and Duration */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(simulationCase.difficulty)}`}>
                {simulationCase.difficulty}
              </span>
              <span className="text-xs text-gray-500">{formatDate(simulationCase.createdAt)}</span>
              <span className="text-xs font-medium text-gray-600">
                {simulationCase.duration} min
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {simulationCase.description}
        </p>

        {/* Patient Info - Condensed */}
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium text-gray-900">{simulationCase.patientInfo.name}</span>
          <span className="mx-2">•</span>
          <span>{simulationCase.patientInfo.age} years</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{simulationCase.patientInfo.gender}</span>
        </div>
      </div>

      {/* Learning Objectives - Condensed */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Objectives</h4>
        <div className="space-y-1">
          {simulationCase.learningObjectives.slice(0, 2).map((objective, index) => (
            <div key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-blue-500 mr-2 mt-1 text-xs">•</span>
              <span className="line-clamp-1">{objective}</span>
            </div>
          ))}
          {simulationCase.learningObjectives.length > 2 && (
            <div className="text-xs text-gray-500 italic">
              +{simulationCase.learningObjectives.length - 2} more objectives
            </div>
          )}
        </div>
      </div>

      {/* Actions - Wider Buttons */}
      <div className="px-5 py-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={handleView}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              View Case
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Export JSON
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {simulationCase.isPublic && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                Public
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(!showDeleteConfirm);
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-red-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 mb-2">
              Are you sure you want to delete this case? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseCard; 