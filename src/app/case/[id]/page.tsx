'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SimulationCase } from '@/types';
import { loadCase } from '@/utils/caseStorage';
import { toast } from 'react-hot-toast';
import CaseDisplayTabs from '@/components/case-display/CaseDisplayTabs';

const CaseViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [simulationCase, setCase] = useState<SimulationCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caseId = params.id as string;
    if (caseId) {
      const loadedCase = loadCase(caseId);
      if (loadedCase) {
        setCase(loadedCase);
      } else {
        toast.error('Case not found');
        router.push('/');
      }
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!simulationCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h1>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                simulationCase.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                simulationCase.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {simulationCase.difficulty}
              </span>
              <span className="text-gray-500">{simulationCase.duration} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Display with Tabs */}
      <CaseDisplayTabs 
        caseData={simulationCase} 
        caseTitle={simulationCase.title}
        caseId={params.id as string}
        onCaseUpdate={setCase}
      />
    </div>
  );
};

export default CaseViewPage; 