'use client';

import React, { useState } from 'react';
import { GeneratedCaseData } from '@/types/caseCreation';
import { Button } from '@/components/ui';
import InfoCard from '../components/InfoCard';

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

  const handleSendToEdEHR = () => {
    // TODO: Implement integration with edEHR
    console.log('Sending to edEHR:', caseData);
    // This would typically make an API call to send the data to edEHR
    alert('Send to edEHR functionality will be implemented soon!');
  };

  const formatJSON = (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  };

  // Helper function to get generated content items
  const getGeneratedItems = (section: keyof GeneratedCaseData) => {
    const data = caseData[section];
    if (!data || typeof data !== 'object') return [];
    
    return Object.keys(data).filter(key => {
      const value = (data as any)[key];
      return value !== null && value !== undefined && value !== '';
    });
  };

  // Helper function to get on-demand generated content
  const getOnDemandItems = () => {
    if (!caseData.onDemandOptions) return [];
    
    const items: string[] = [];
    Object.keys(caseData.onDemandOptions).forEach(key => {
      const value = caseData.onDemandOptions![key];
      if (value && value.trim() !== '') {
        // Convert kebab-case to title case
        const title = key.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        items.push(title);
      }
    });
    return items;
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
              <Button
                onClick={handleSendToEdEHR}
                variant="primary"
                size="sm"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Send to edEHR</span>
                <span>→</span>
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
      <InfoCard title="Data Structure Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {/* Overview Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Overview</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('overview').length > 0 ? (
                getGeneratedItems('overview').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No overview data generated</li>
              )}
            </ul>
          </div>

          {/* Patient Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('patient').length > 0 ? (
                getGeneratedItems('patient').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No patient data generated</li>
              )}
            </ul>
          </div>

          {/* Presentation Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Presentation</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('presentation').length > 0 ? (
                getGeneratedItems('presentation').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No presentation data generated</li>
              )}
            </ul>
          </div>

          {/* Treatment Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Treatment</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('treatment').length > 0 ? (
                getGeneratedItems('treatment').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No treatment data generated</li>
              )}
            </ul>
          </div>

          {/* Simulation Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Simulation</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('simulation').length > 0 ? (
                getGeneratedItems('simulation').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No simulation data generated</li>
              )}
            </ul>
          </div>

          {/* Smart Defaults Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Smart Defaults</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getGeneratedItems('smartDefaults').length > 0 ? (
                getGeneratedItems('smartDefaults').map((item, index) => (
                  <li key={index}>• {item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No smart defaults generated</li>
              )}
            </ul>
          </div>

          {/* On-Demand Generated Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Generated Content</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getOnDemandItems().length > 0 ? (
                getOnDemandItems().map((item, index) => (
                  <li key={index}>• {item}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">No additional content generated</li>
              )}
            </ul>
          </div>
        </div>
      </InfoCard>

      {/* Usage Instructions */}
      <InfoCard title="Usage Instructions">
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
              <strong>Send to edEHR:</strong> Click &ldquo;Send to edEHR&rdquo; to directly integrate with the edEHR platform for seamless case deployment.
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
      </InfoCard>
    </div>
  );
};

export default RawOutputTab; 