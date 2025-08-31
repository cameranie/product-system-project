'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { StatsCardsWithProgress } from '@/components/ui/stats-cards-with-progress';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-6">项目概览</h1>
        <StatsCardsWithProgress />
      </div>
    </AppLayout>
  );
}