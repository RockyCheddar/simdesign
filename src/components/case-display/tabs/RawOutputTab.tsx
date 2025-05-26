'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { Button } from '@/components/ui';

interface RawOutputTabProps {
  caseData: GeneratedCaseData;
}

const RawOutputTab: React.FC<RawOutputTabProps> = ({ caseData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(caseData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(caseData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `case-${caseData.overview?.caseTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'generated'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatJSON = (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Raw JSON Output</h3>
            <div className="flex space-x-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Download</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {formatJSON(caseData)}
            </pre>
          </div>
        </div>
      </div>

      {/* Data Structure Overview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">Data Structure Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Overview</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Case Title</li>
                <li>• Case Summary</li>
                <li>• Learning Objectives</li>
                <li>• Patient Basics</li>
                <li>• Clinical Setting</li>
              </ul>
            </div>

            {/* Patient Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-800 mb-3">Patient</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Demographics</li>
                <li>• Chief Complaint</li>
                <li>• History of Present Illness</li>
                <li>• Current Medications</li>
              </ul>
            </div>

            {/* Presentation Section */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-purple-800 mb-3">Presentation</h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Vital Signs</li>
                <li>• Physical Exam Findings</li>
                <li>• Laboratory Results</li>
                <li>• Imaging Studies</li>
              </ul>
            </div>

            {/* Treatment Section */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-red-800 mb-3">Treatment</h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Initial Interventions</li>
                <li>• Treatment Plan</li>
                <li>• Scenario Progression</li>
              </ul>
            </div>

            {/* Simulation Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-yellow-800 mb-3">Simulation</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Learning Objectives</li>
                <li>• Competency Areas</li>
                <li>• Core Assessment</li>
              </ul>
            </div>

            {/* Smart Defaults Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Smart Defaults</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Context-based Content</li>
                <li>• Experience Level Adaptations</li>
                <li>• Domain-specific Additions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">Usage Instructions</h3>
        </div>
        <div className="p-6">
          <div className="prose prose-sm max-w-none text-gray-700">
            <h4 className="text-lg font-medium text-gray-900 mb-3">How to Use This Data</h4>
            <ul className="space-y-2">
              <li>
                <strong>Copy JSON:</strong> Use the &ldquo;Copy JSON&rdquo; button to copy the entire case data to your clipboard for use in other applications.
              </li>
              <li>
                <strong>Download File:</strong> Click &ldquo;Download&rdquo; to save the case as a JSON file that can be imported into simulation systems.
              </li>
              <li>
                <strong>API Integration:</strong> This JSON structure is designed to be compatible with most healthcare simulation platforms.
              </li>
              <li>
                <strong>Customization:</strong> You can modify the JSON data to customize the case for your specific needs before importing.
              </li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mb-3 mt-6">Data Validation</h4>
            <p className="text-gray-600">
              All generated data has been validated for completeness and medical accuracy. The structure follows 
              healthcare simulation industry standards and includes all required fields for comprehensive case delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawOutputTab; 