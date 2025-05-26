'use client';

import React from 'react';

interface VitalSignCardProps {
  label: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: string;
  colorCode: 'green' | 'yellow' | 'red';
  additionalInfo?: string;
}

const VitalSignCard: React.FC<VitalSignCardProps> = ({
  label,
  value,
  unit,
  normalRange,
  status,
  colorCode,
  additionalInfo
}) => {
  const getCardStyles = () => {
    switch (colorCode) {
      case 'green':
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          textColor: 'text-green-800',
          statusBg: 'bg-green-100',
          statusText: 'text-green-800'
        };
      case 'yellow':
        return {
          background: 'bg-yellow-50',
          border: 'border-yellow-200',
          textColor: 'text-yellow-800',
          statusBg: 'bg-yellow-100',
          statusText: 'text-yellow-800'
        };
      case 'red':
        return {
          background: 'bg-red-50',
          border: 'border-red-200',
          textColor: 'text-red-800',
          statusBg: 'bg-red-100',
          statusText: 'text-red-800'
        };
      default:
        return {
          background: 'bg-gray-50',
          border: 'border-gray-200',
          textColor: 'text-gray-800',
          statusBg: 'bg-gray-100',
          statusText: 'text-gray-800'
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={`
      ${styles.background} ${styles.border} border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-md
    `}>
      {/* Label */}
      <div className="text-sm font-medium text-gray-600 mb-2">
        {label}
      </div>

      {/* Large Value Display */}
      <div className="flex items-baseline space-x-2 mb-3">
        <span className={`text-3xl font-bold ${styles.textColor}`}>
          {value}
        </span>
        <span className={`text-lg font-medium ${styles.textColor}`}>
          {unit}
        </span>
      </div>

      {/* Normal Range */}
      <div className="text-xs text-gray-500 mb-2">
        Normal: {normalRange}
      </div>

      {/* Status Badge */}
      <div className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${styles.statusBg} ${styles.statusText}
      `}>
        {status.toUpperCase()}
      </div>

      {/* Additional Info */}
      {additionalInfo && (
        <div className="text-xs text-gray-600 mt-2">
          {additionalInfo}
        </div>
      )}
    </div>
  );
};

export default VitalSignCard; 