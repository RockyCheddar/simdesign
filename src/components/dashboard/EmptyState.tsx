'use client';

import React from 'react';

interface EmptyStateProps {
  onCreateCase: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCase }) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
          <svg
            className="h-10 w-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No simulation cases yet
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Start building your medical education library by creating your first simulation case. 
          Design realistic patient scenarios to enhance clinical learning and decision-making skills.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onCreateCase}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Your First Case
          </button>

          <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Case JSON
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Getting Started</h4>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">Create a Case</h5>
                <p className="text-sm text-gray-600">Define patient demographics, symptoms, and clinical scenarios</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">Set Learning Objectives</h5>
                <p className="text-sm text-gray-600">Define clear educational goals and assessment criteria</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">3</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">Share & Collaborate</h5>
                <p className="text-sm text-gray-600">Export cases or share with your teaching team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState; 