'use client';

import React from 'react';

interface ViewToggleProps {
  isTableView: boolean;
  onToggle: (isTableView: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isTableView, onToggle }) => {
  const handleCardView = () => {
    onToggle(false);
  };

  const handleTableView = () => {
    onToggle(true);
  };

  return (
    <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
      <button
        onClick={handleCardView}
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          !isTableView
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Card View"
        title="Card View"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          <path d="M2 4h4v4H2zm0 6h4v4H2zm0 6h4v4H2z" />
        </svg>
        <span className="ml-2 hidden sm:inline">Cards</span>
      </button>
      
      <button
        onClick={handleTableView}
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isTableView
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Table View"
        title="Table View"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
        </svg>
        <span className="ml-2 hidden sm:inline">Table</span>
      </button>
    </div>
  );
};

export default ViewToggle; 