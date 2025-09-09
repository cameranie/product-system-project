'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';

export default function PermissionsHome() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">权限管理</h2>
        <div className="flex gap-3">
          <Button asChild><Link href="/admin/permissions/preview">权限预览（验收）</Link></Button>
          <Button asChild><Link href="/admin/permissions/grants">临时授权（管理员）</Link></Button>
        </div>
      </div>
    </AppLayout>
  );
}


