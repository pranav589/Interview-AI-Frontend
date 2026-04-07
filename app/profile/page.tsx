'use client';

import AuthWrapper from '@/components/auth/auth-wrapper';
import { Navbar } from '@/components/common/navbar';
import ProfilePage from '@/components/profile/profile-page';

export default function Profile() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <ProfilePage />
      </div>
    </AuthWrapper>
  );
}
