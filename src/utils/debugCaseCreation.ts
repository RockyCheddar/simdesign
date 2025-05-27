/**
 * Debug utility for case creation troubleshooting
 */

import { loadAllCases, loadCase } from './caseStorage';

export const debugCaseCreation = () => {
  console.log('=== CASE CREATION DEBUG UTILITY ===');
  
  // Check localStorage contents
  console.log('1. Checking localStorage contents...');
  const caseIndex = localStorage.getItem('simcase_index');
  console.log('Case index:', caseIndex);
  
  if (caseIndex) {
    try {
      const parsedIndex = JSON.parse(caseIndex);
      console.log('Parsed case index:', parsedIndex);
      
      // Check each case in the index
      parsedIndex.forEach((caseId: string, index: number) => {
        console.log(`Checking case ${index + 1}/${parsedIndex.length}: ${caseId}`);
        const caseKey = `simcase_${caseId}`;
        const caseData = localStorage.getItem(caseKey);
        
        if (caseData) {
          try {
            const parsedCase = JSON.parse(caseData);
            console.log(`  ✅ Case found:`, {
              id: parsedCase.id,
              title: parsedCase.title,
              createdBy: parsedCase.createdBy,
              createdAt: parsedCase.createdAt
            });
          } catch (error) {
            console.log(`  ❌ Case data corrupted:`, error);
          }
        } else {
          console.log(`  ❌ Case data missing for ID: ${caseId}`);
        }
      });
    } catch (error) {
      console.log('❌ Failed to parse case index:', error);
    }
  } else {
    console.log('❌ No case index found in localStorage');
  }
  
  // Load all cases using the utility function
  console.log('\n2. Loading cases using loadAllCases...');
  const allCases = loadAllCases();
  console.log('Cases loaded:', allCases.length);
  
  allCases.forEach((case_, index) => {
    console.log(`Case ${index + 1}:`, {
      id: case_.id,
      title: case_.title,
      createdBy: case_.createdBy,
      createdAt: case_.createdAt,
      isDemo: case_.createdBy === 'demo-user'
    });
  });
  
  // Check for user-created cases specifically
  console.log('\n3. Filtering user-created cases...');
  const userCases = allCases.filter(c => c.createdBy === 'ai-generated');
  console.log('User-created cases:', userCases.length);
  
  userCases.forEach((case_, index) => {
    console.log(`User case ${index + 1}:`, {
      id: case_.id,
      title: case_.title,
      createdAt: case_.createdAt
    });
  });
  
  // Check localStorage size
  console.log('\n4. localStorage usage...');
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  console.log('Total localStorage size:', Math.round(totalSize / 1024), 'KB');
  
  console.log('=== DEBUG COMPLETE ===');
  
  return {
    totalCases: allCases.length,
    userCases: userCases.length,
    demoCases: allCases.filter(c => c.createdBy === 'demo-user').length,
    storageSize: Math.round(totalSize / 1024)
  };
};

// Make it available globally for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).debugCaseCreation = debugCaseCreation;
} 