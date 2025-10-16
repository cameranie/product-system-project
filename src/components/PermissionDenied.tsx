import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 权限拒绝页面组件
 * 
 * 当用户没有访问权限时显示
 */
export function PermissionDenied() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <CardTitle>访问被拒绝</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            您没有权限访问此页面或执行此操作。
          </p>
          <p className="text-sm text-muted-foreground">
            如果您认为这是一个错误，请联系系统管理员。
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.back()} className="flex-1">
              返回上一页
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




