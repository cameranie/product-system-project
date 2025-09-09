'use client';

import { Homepage } from '@/components/homepage';

export default function Page() {
  const handleLogin = (email: string, password: string) => {
    // Handle login logic here
    console.log('Login attempt:', { email, password });
    
    // For now, redirect to dashboard on successful login
    // In a real app, you would validate credentials first
    if (email && password) {
      window.location.href = '/dashboard';
    }
  };

  return <Homepage onLogin={handleLogin} />;
}