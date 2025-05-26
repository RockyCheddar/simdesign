'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SimulationCase } from '@/types';
import { loadAllCases, getStorageStats } from '@/utils/caseStorage';
import { initializeMockData } from '@/utils/mockData';
import CaseCard from './CaseCard';
import EmptyState from './EmptyState';
import UserMenu from '../auth/UserMenu';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [cases, setCases] = useState<SimulationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageStats, setStorageStats] = useState({ totalCases: 0, storageUsed: '0 KB' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'difficulty'>('date');

  // Load cases on component mount
  useEffect(() => {
    loadCases();
    // Initialize mock data if needed (for demo purposes)
    initializeMockData();
    setTimeout(() => loadCases(), 100); // Small delay to ensure mock data is saved
  }, []);

  // Reload cases when window regains focus (user returns from case creation)
  useEffect(() => {
    const handleFocus = () => {
      loadCases();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('simcase_')) {
        console.log('Storage change detected, refreshing cases...');
        loadCases();
      }
    };

    const handleCaseAdded = (e: CustomEvent) => {
      console.log('Case added event detected, refreshing cases...', e.detail);
      loadCases();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('caseAdded', handleCaseAdded as EventListener);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('caseAdded', handleCaseAdded as EventListener);
    };
  }, []);

  const loadCases = () => {
    setLoading(true);
    try {
      const loadedCases = loadAllCases();
      setCases(loadedCases);
      setStorageStats(getStorageStats());
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    setStorageStats(getStorageStats());
  };

  const handleViewCase = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  const handleCreateCase = () => {
    // Navigate to case creation page
    router.push('/create-case');
  };

  const handleUploadJSON = () => {
    // Placeholder for JSON upload - will be implemented later
    toast('JSON upload feature coming soon', { icon: 'ℹ️' });
    console.log('Upload JSON case');
  };

  // Filter and sort cases
  const filteredAndSortedCases = cases
    .filter(simulationCase => {
      const matchesSearch = simulationCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           simulationCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           simulationCase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = filterDifficulty === 'all' || simulationCase.difficulty === filterDifficulty;
      
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <svg
              className="w-8 h-8 text-white animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.5 3H4.5C3.12 3 2 4.12 2 5.5V18.5C2 19.88 3.12 21 4.5 21H19.5C20.88 21 22 19.88 22 18.5V5.5C22 4.12 20.88 3 19.5 3ZM12 13.5C10.62 13.5 9.5 12.38 9.5 11S10.62 8.5 12 8.5S14.5 9.62 14.5 11S13.38 13.5 12 13.5ZM16 18H8V16.5C8 15.12 9.12 14 10.5 14H13.5C14.88 14 16 15.12 16 16.5V18Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Retrieving your simulation cases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.5 3H4.5C3.12 3 2 4.12 2 5.5V18.5C2 19.88 3.12 21 4.5 21H19.5C20.88 21 22 19.88 22 18.5V5.5C22 4.12 20.88 3 19.5 3ZM12 13.5C10.62 13.5 9.5 12.38 9.5 11S10.62 8.5 12 8.5S14.5 9.62 14.5 11S13.38 13.5 12 13.5ZM16 18H8V16.5C8 15.12 9.12 14 10.5 14H13.5C14.88 14 16 15.12 16 16.5V18Z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">SimCase AI</h1>
                    <p className="text-xs text-gray-500">Healthcare Simulation Platform</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={loadCases}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh cases"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-600">
            Manage your simulation cases and create engaging medical education content.
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{storageStats.totalCases}</p>
                <p className="text-gray-500 text-sm">Total Cases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{storageStats.storageUsed}</p>
                <p className="text-gray-500 text-sm">Storage Used</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex space-x-4">
              <button
                onClick={handleCreateCase}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Case
              </button>
              <button
                onClick={handleUploadJSON}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload JSON
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        {cases.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Cases
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Difficulty
                </label>
                <select
                  id="difficulty"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Date Created</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Cases Grid or Empty State */}
        {filteredAndSortedCases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedCases.map((simulationCase) => (
              <CaseCard
                key={simulationCase.id}
                simulationCase={simulationCase}
                onDelete={handleDeleteCase}
                onView={handleViewCase}
              />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <EmptyState onCreateCase={handleCreateCase} />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDifficulty('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 