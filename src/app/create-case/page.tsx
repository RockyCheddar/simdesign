'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CaseCreationWizard from '@/components/case-creation/CaseCreationWizard';

// TEST: Simple console log to verify console is working
console.log('🚀 Create Case page loaded - Console is working!');

export default function CreateCasePage() {
  return (
    <ProtectedRoute>
      <CaseCreationWizard />
    </ProtectedRoute>
  );
} 