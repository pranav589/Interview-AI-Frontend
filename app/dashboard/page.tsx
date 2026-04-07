import { Metadata } from 'next';
import DashboardPage from '@/components/dashboard/dashboard-page';
import AuthWrapper from '@/components/auth/auth-wrapper';

export const metadata: Metadata = { 
  title: 'Dashboard',
  description: 'View your interview history and performance trends.'
};

export default function Dashboard() {
  return (
    <AuthWrapper>
      <DashboardPage />
    </AuthWrapper>
  );
}
