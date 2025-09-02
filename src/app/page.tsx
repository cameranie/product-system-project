'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { StatsCardsWithProgress } from '@/components/ui/stats-cards-with-progress';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <StatsCardsWithProgress />
      </div>
    </AppLayout>
  );
}