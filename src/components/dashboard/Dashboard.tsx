'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SimulationCase } from '@/types';
import { loadAllCases, getStorageStats } from '@/utils/caseStorage';
import { initializeMockData } from '@/utils/mockData';
import { debugCaseCreation } from '@/utils/debugCaseCreation';
import CaseCard from './CaseCard';
import CaseTable from './CaseTable';
import ViewToggle from './ViewToggle';
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
  const [isTableView, setIsTableView] = useState<boolean>(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('healthcaresim-view-preference');
      return saved === 'table';
    }
    return false;
  });

  // Load cases on component mount
  useEffect(() => {
    loadCases();
    
    // Initialize mock data only if absolutely no cases exist (including user-created ones)
    // This prevents demo cases from interfering with the case creation flow
    const existingCases = loadAllCases();
    if (existingCases.length === 0) {
      console.log('No cases found, initializing demo data...');
      initializeMockData();
      setTimeout(() => {
        console.log('Reloading cases after demo data initialization...');
        loadCases();
      }, 100); // Small delay to ensure mock data is saved
    } else {
      console.log('Existing cases found:', existingCases.length, 'skipping demo data initialization');
    }
    
    // Make debug utility available in browser console
    if (typeof window !== 'undefined') {
      (window as typeof window & { debugCaseCreation: typeof debugCaseCreation }).debugCaseCreation = debugCaseCreation;
      console.log('Debug utility available: call debugCaseCreation() in console');
    }
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

  const handleCreateFromDocument = () => {
    router.push('/create-from-document');
  };

  const handleViewToggle = (newIsTableView: boolean) => {
    setIsTableView(newIsTableView);
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthcaresim-view-preference', newIsTableView ? 'table' : 'card');
    }
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
        {/* Welcome Section with Stats */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
            <p className="text-gray-600">
              Manage your simulation cases and create engaging medical education content.
            </p>
          </div>
          
          {/* Compact Stats Widget */}
          <div className="hidden md:flex items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{storageStats.totalCases}</p>
                <p className="text-xs text-gray-500">Cases</p>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{storageStats.storageUsed}</p>
                <p className="text-xs text-gray-500">Storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {/* Primary Action - Generate Case */}
            <button
              onClick={handleCreateCase}
              className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-7 h-7 text-white group-hover:text-emerald-100 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.39 8.42L20 9L13.39 9.58L12 16L10.61 9.58L4 9L10.61 8.42L12 2Z"/>
                  <path d="M19 15L19.94 17.06L22 18L19.94 18.94L19 21L18.06 18.94L16 18L18.06 17.06L19 15Z"/>
                  <path d="M5 7L5.94 9.06L8 10L5.94 10.94L5 13L4.06 10.94L2 10L4.06 9.06L5 7Z"/>
                </svg>
                <span className="text-lg">Generate Case</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors"></div>
            </button>

            {/* Secondary Action - Upload & Enhance */}
            <button
              onClick={handleCreateFromDocument}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                  </svg>
                </div>
                <span className="text-lg">Upload & Enhance</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors"></div>
            </button>

            {/* Tertiary Action - Upload JSON */}
            <button
              onClick={handleUploadJSON}
              className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <span className="text-lg">Upload JSON</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors"></div>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        {cases.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                >
                  <option value="date">Date Created</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Type
                </label>
                <ViewToggle isTableView={isTableView} onToggle={handleViewToggle} />
              </div>
            </div>
          </div>
        )}

        {/* Cases Display - Grid/Table or Empty State */}
        {filteredAndSortedCases.length > 0 ? (
          isTableView ? (
            <CaseTable
              cases={filteredAndSortedCases}
              onDelete={handleDeleteCase}
              onView={handleViewCase}
            />
          ) : (
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
          )
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