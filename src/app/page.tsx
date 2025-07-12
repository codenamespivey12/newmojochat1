'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/UI';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to chat page
    router.push('/chat');
  }, [router]);

  return <LoadingSpinner fullScreen size={60} message="Loading..." />;
}
