import { v4 as uuidv4 } from 'uuid';
import { type ClassValue, clsx } from 'clsx';
import { SimulationCase } from '@/types';
import { VITAL_SIGNS_NORMAL_RANGES } from './constants';

// Utility function for combining classes (useful with Tailwind)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate unique IDs
export const generateId = () => uuidv4();

// Format date utilities
export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Patient information formatters
export const formatPatientAge = (age: number) => {
  if (age < 1) return `${Math.round(age * 12)} months`;
  if (age < 2) return `${age} year${age === 1 ? '' : 's'} old`;
  return `${Math.round(age)} years old`;
};

export const formatHeight = (heightCm: number) => {
  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm / 2.54) % 12);
  return `${heightCm}cm (${feet}'${inches}")`;
};

export const formatWeight = (weightKg: number) => {
  const weightLbs = Math.round(weightKg * 2.20462);
  return `${weightKg}kg (${weightLbs}lbs)`;
};

// Vital signs validation and formatting
export const isVitalSignNormal = (
  vital: keyof typeof VITAL_SIGNS_NORMAL_RANGES,
  value: number
): boolean => {
  const range = VITAL_SIGNS_NORMAL_RANGES[vital];
  if ('min' in range && 'max' in range) {
    return value >= range.min && value <= range.max;
  }
  return true;
};

export const formatBloodPressure = (systolic: number, diastolic: number) => {
  return `${systolic}/${diastolic} mmHg`;
};

export const formatTemperature = (tempCelsius: number) => {
  const tempFahrenheit = (tempCelsius * 9/5) + 32;
  return `${tempCelsius.toFixed(1)}°C (${tempFahrenheit.toFixed(1)}°F)`;
};

// Case management utilities
export const calculateCaseDuration = (case_: SimulationCase): string => {
  const hours = Math.floor(case_.duration / 60);
  const minutes = case_.duration % 60;
  
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
};

export const getDifficultyColor = (difficulty: SimulationCase['difficulty']) => {
  const colors = {
    beginner: 'text-green-600 bg-green-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-red-600 bg-red-100',
  };
  return colors[difficulty];
};

// Text utilities
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return value != null;
};

// Array utilities
export const removeItem = <T>(array: T[], index: number): T[] => {
  return array.filter((_, i) => i !== index);
};

export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
};

// Form utilities
export const getFormErrorMessage = (error: unknown): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'An error occurred';
};

// Local storage utilities
export const setStorageItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// API utilities
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response as { data?: { message?: string } };
    if (response.data?.message) return response.data.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};

// Search and filter utilities
export const searchCases = (cases: SimulationCase[], query: string): SimulationCase[] => {
  if (!query.trim()) return cases;
  
  const searchTerm = query.toLowerCase();
  return cases.filter(case_ => 
    case_.title.toLowerCase().includes(searchTerm) ||
    case_.description.toLowerCase().includes(searchTerm) ||
    case_.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    case_.patientInfo.name.toLowerCase().includes(searchTerm)
  );
};

export const filterCasesByDifficulty = (
  cases: SimulationCase[], 
  difficulty: SimulationCase['difficulty'] | 'all'
): SimulationCase[] => {
  if (difficulty === 'all') return cases;
  return cases.filter(case_ => case_.difficulty === difficulty);
}; 