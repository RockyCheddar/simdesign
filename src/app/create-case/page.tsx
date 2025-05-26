import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CaseCreationWizard from '@/components/case-creation/CaseCreationWizard';

export default function CreateCasePage() {
  return (
    <ProtectedRoute>
      <CaseCreationWizard />
    </ProtectedRoute>
  );
} 