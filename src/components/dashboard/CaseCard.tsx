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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete case');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleView = () => {
    onView(simulationCase.id);
  };

  // Get status based on case completeness
  const getStatus = () => {
    const hasComplete = simulationCase.patientInfo && 
                      simulationCase.scenario && 
                      simulationCase.learningObjectives.length > 0;
    return hasComplete ? 'Complete' : 'Draft';
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h3 
            className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleView}
          >
            {simulationCase.title}
          </h3>
          <div className="flex items-center space-x-2 ml-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(simulationCase.difficulty)}`}>
              {simulationCase.difficulty}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
              status === 'Complete' 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-orange-100 text-orange-800 border-orange-200'
            }`}>
              {status}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {simulationCase.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDate(simulationCase.createdAt)}</span>
          <span>{simulationCase.duration} min</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">Patient:</span>
            <span className="font-medium text-gray-900">{simulationCase.patientInfo.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">Age:</span>
            <span className="font-medium text-gray-900">{simulationCase.patientInfo.age}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">Gender:</span>
            <span className="font-medium text-gray-900 capitalize">{simulationCase.patientInfo.gender}</span>
          </div>
        </div>
        
        <div className="mt-2">
          <span className="text-gray-500 text-sm mr-1">Chief Complaint:</span>
          <span className="text-gray-900 text-sm font-medium line-clamp-1">
            {simulationCase.patientInfo.chiefComplaint}
          </span>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Objectives</h4>
        <ul className="space-y-1">
          {simulationCase.learningObjectives.slice(0, 3).map((objective, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <span className="line-clamp-1">{objective}</span>
            </li>
          ))}
          {simulationCase.learningObjectives.length > 3 && (
            <li className="text-sm text-gray-500 italic">
              +{simulationCase.learningObjectives.length - 3} more objectives
            </li>
          )}
        </ul>
      </div>

      {/* Tags */}
      {simulationCase.tags.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {simulationCase.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
              >
                {tag}
              </span>
            ))}
            {simulationCase.tags.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-200">
                +{simulationCase.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleView}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              View Case
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
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
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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