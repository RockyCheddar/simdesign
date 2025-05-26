import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
