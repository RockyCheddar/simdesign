'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FileDropzone from '@/components/upload/FileDropzone';
import { useDocumentStore } from '@/stores/documentStore';
import { generateId } from '@/utils/helpers';
import { FileText, Loader2, ArrowLeft, Upload } from 'lucide-react';

const CreateFromDocumentPage: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isProcessing, error, setProcessing, setError, setProcessedData } = useDocumentStore();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const loadingToast = toast.loading('Processing document...');

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let browser set it automatically for FormData
      });

      clearTimeout(timeoutId);
      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to process document`);
      }

      const result = await response.json();
      
      if (!result.originalText || !result.parsedData) {
        throw new Error('Invalid response from server - missing required data');
      }
      
      // Generate a unique case ID for this session
      const caseId = generateId();
      
      // Store the processed data
      setProcessedData({
        originalText: result.originalText,
        parsedData: result.parsedData,
        caseId,
      });

      toast.success('Document processed successfully!');
      
      // Redirect to review page
      router.push(`/review-case/${caseId}`);
      
    } catch (err) {
      console.error('Error processing document:', err);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again with a smaller document.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create Case from Document
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Upload a medical case document to automatically extract and structure case data
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  How it works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Upload Document</h3>
                      <p className="text-gray-600 mt-1">
                        Select a medical case document in PDF or DOCX format
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI Processing</h3>
                      <p className="text-gray-600 mt-1">
                        Our AI extracts patient info, scenarios, and learning objectives
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Review & Save</h3>
                      <p className="text-gray-600 mt-1">
                        Review the extracted data and make any necessary adjustments
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Document
                </h2>
                <FileDropzone
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['.docx', '.pdf']}
                  maxSizeInMB={10}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Processing Error
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleProcessDocument}
                  disabled={!selectedFile || isProcessing}
                  className={`
                    inline-flex items-center px-6 py-3 rounded-lg font-medium text-white
                    transition-all duration-200 
                    ${!selectedFile || isProcessing
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Document...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Process Document
                    </>
                  )}
                </button>
              </div>

              {/* Additional Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Processing Information
                      </h3>
                      <div className="text-sm text-blue-700 mt-1">
                        <p>• Processing typically takes 30-60 seconds depending on document length</p>
                        <p>• The AI will extract patient information, vital signs, and examination findings</p>
                        <p>• You&apos;ll be able to review and edit all extracted data before saving</p>
                        <p>• Supported formats: PDF and Microsoft Word (.docx) files</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateFromDocumentPage; 