'use client';

import React from 'react';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

interface DataRowProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

export const DataRow: React.FC<DataRowProps> = ({ label, value, className = '' }) => {
  return (
    <div className={`flex items-start py-3 border-b border-gray-100 last:border-b-0 ${className}`}>
      <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0 w-40 mr-8">
        {label}
      </span>
      <span className="text-sm text-gray-900 min-w-0 flex-1">
        {value}
      </span>
    </div>
  );
};

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header Section */}
      <div className="bg-white px-6 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default InfoCard; 