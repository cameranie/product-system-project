'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { visibilityApi } from '@/lib/api';

export default function PermissionsPreviewPage() {
  const searchParams = useSearchParams();
  const [targetUserId, setTargetUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setErr(null);
    try {
      const data = await visibilityApi.accessPreview({
        resource: 'user',
        targetUserId: targetUserId || undefined,
      });
      const parsed = JSON.parse(data.accessPreview);
      setResult(parsed);
    } catch (e: any) {
      setErr(e?.message || '加载失败');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('targetUserId') || '';
    if (id) {
      setTargetUserId(id);
      // 自动触发
      (async () => {
        await run();
      })();
    }
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">权限预览</h2>
        <div className="flex gap-2 max-w-xl">
          <Input
            placeholder="目标用户ID（可选）"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
          <Button onClick={run} disabled={loading}>{loading ? '加载中...' : '查询'}</Button>
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        {result && (
          <pre className="bg-muted p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </AppLayout>
  );
}


