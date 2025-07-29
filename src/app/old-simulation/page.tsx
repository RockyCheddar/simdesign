import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/components/dashboard';

export default function OldSimulationPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
} 