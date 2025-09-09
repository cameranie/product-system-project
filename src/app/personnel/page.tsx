'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi, visibilityApi } from '@/lib/api';
type ListUser = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  position: string | null;
  employeeNo: string | null;
  employmentStatus: string | null;
  department?: { id: string; name: string } | null;
};
import Link from 'next/link';

import {
  Table,
  TableHeader as TableHeaderRaw,
  TableBody as TableBodyRaw,
  TableRow as TableRowRaw,
  TableCell as TableCellRaw,
  TableHead as TableHeadRaw,
} from '@/components/ui/table';

import { Search, Plus, Eye, ShieldCheck } from 'lucide-react';

// （列显隐已由 visibleFieldKeys 控制）

// 可见字段 keys -> 控制列显隐
const FIELD_KEYS = {
  name: 'name',
  department: 'department',
  position: 'position',
  employeeNo: 'employee_no',
  employmentStatus: 'employment_status',
  contactWorkEmail: 'contact_work_email',
  contactPhone: 'contact_phone',
} as const;

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<ListUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [isActive, setIsActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentId, setDepartmentId] = useState<string>('all');

  // 搜索防抖
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // 加载人员数据 + 可见字段
  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        setLoading(true);
        const [usersRes, keysRes] = await Promise.all([
          userApi.getUsers({
            filters: {
              ...(debouncedSearch ? { search: debouncedSearch } : {}),
              ...(isActive === 'active' ? { isActive: true } : {}),
              ...(isActive === 'inactive' ? { isActive: false } : {}),
              ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          visibilityApi.visibleFieldKeys({ resource: 'user' }),
        ]);
        setPersonnel(usersRes.users.users);
        setTotal(usersRes.users.total ?? 0);
        setVisibleKeys(keysRes.visibleFieldKeys);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load personnel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPersonnel();
  }, [debouncedSearch, page, pageSize, isActive, departmentId]);

  // 搜索变更时重置页码
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, isActive, departmentId]);

  // 过滤人员
  const filteredPersonnel = personnel; // 过滤交由后端 search

  const showPhone = visibleKeys.includes(FIELD_KEYS.contactPhone);
  const showPosition = visibleKeys.includes(FIELD_KEYS.position);
  const showDepartment = visibleKeys.includes(FIELD_KEYS.department);
  const showEmployeeNo = visibleKeys.includes(FIELD_KEYS.employeeNo);
  const showEmploymentStatus = visibleKeys.includes(FIELD_KEYS.employmentStatus);
  const columnsCount = 2 +
    (showPhone ? 1 : 0) +
    (showEmploymentStatus ? 1 : 0) +
    (showEmployeeNo ? 1 : 0) +
    (showDepartment ? 1 : 0) +
    (showPosition ? 1 : 0);

  const handleExport = async () => {
    try {
      setExporting(true);
      const filters: Record<string, string | boolean> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (isActive === 'active') filters.isActive = true;
      if (isActive === 'inactive') filters.isActive = false;
      if (departmentId && departmentId !== 'all') filters.departmentId = departmentId;
      const data = await visibilityApi.exportUsersCsv(Object.keys(filters).length ? filters : undefined);
      const csv = data.exportUsersCsv as string;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '导出失败（可能无导出权限）';
      alert(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索人员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 添加人员按钮 */}
          <Button asChild>
            <Link href="/personnel/new">
              <Plus className="h-4 w-4 mr-2" />
              添加人员
            </Link>
          </Button>
          {/* 状态筛选 */}
          <div className="w-40">
            <Select value={isActive} onValueChange={(v) => setIsActive(v as 'all' | 'active' | 'inactive')}>
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">在职</SelectItem>
                <SelectItem value="inactive">未激活/离职</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* 部门筛选（从当前结果中聚合） */}
          <div className="w-48">
            <Select value={departmentId} onValueChange={(v) => setDepartmentId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {[...new Map(personnel.map(u => (u.department ? [u.department.id, u.department.name] : null)).filter(Boolean) as [string, string][])].map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? '导出中…' : '导出 CSV'}
          </Button>
        </div>

        {/* 人员表格 */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeaderRaw>
              <TableRowRaw>
                <TableHeadRaw>姓名</TableHeadRaw>
                {showPhone && <TableHeadRaw>手机号码</TableHeadRaw>}
                {showEmploymentStatus && <TableHeadRaw>人员状态</TableHeadRaw>}
                {showEmployeeNo && <TableHeadRaw>工号</TableHeadRaw>}
                {showDepartment && <TableHeadRaw>部门</TableHeadRaw>}
                {showPosition && <TableHeadRaw>职务</TableHeadRaw>}
                <TableHeadRaw>操作</TableHeadRaw>
              </TableRowRaw>
            </TableHeaderRaw>
            <TableBodyRaw>
              {loading ? (
                <TableRowRaw>
                  <TableCellRaw colSpan={columnsCount} className="h-24 text-center">
                    加载中...
                  </TableCellRaw>
                </TableRowRaw>
              ) : error ? (
                <TableRowRaw>
                  <TableCellRaw colSpan={columnsCount} className="h-24 text-center text-red-600">
                    {error}
                  </TableCellRaw>
                </TableRowRaw>
              ) : filteredPersonnel.length > 0 ? (
                filteredPersonnel.map((person) => (
                  <TableRowRaw key={person.id}>
                    <TableCellRaw>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${person.username}`} />
                          <AvatarFallback>{person.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{person.name}</div>
                          {visibleKeys.includes(FIELD_KEYS.contactWorkEmail) && (
                            <div className="text-sm text-muted-foreground">{person.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCellRaw>
                    {showPhone && (
                      <TableCellRaw className="font-mono text-sm">
                        {person.phone ?? ''}
                      </TableCellRaw>
                    )}
                    {showEmploymentStatus && (
                      <TableCellRaw>
                        <Badge variant="outline">{person.employmentStatus ?? ''}</Badge>
                      </TableCellRaw>
                    )}
                    {showEmployeeNo && (
                      <TableCellRaw>
                        <div className="text-sm">{person.employeeNo ?? ''}</div>
                      </TableCellRaw>
                    )}
                    {showDepartment && (
                      <TableCellRaw>
                        <div className="text-sm">{person.department?.name ?? ''}</div>
                      </TableCellRaw>
                    )}
                    {showPosition && (
                      <TableCellRaw>
                        <div className="text-sm">{person.position ?? ''}</div>
                      </TableCellRaw>
                    )}
                    <TableCellRaw>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/personnel/${person.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          详情
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/permissions/preview?targetUserId=${person.id}`}>
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          权限
                        </Link>
                      </Button>
                    </TableCellRaw>
                  </TableRowRaw>
                ))
              ) : (
                <TableRowRaw>
                  <TableCellRaw colSpan={columnsCount} className="h-24 text-center">
                    暂无人员数据
                  </TableCellRaw>
                </TableRowRaw>
              )}
            </TableBodyRaw>
          </Table>
        </div>
        {/* 分页 */}
        <div className="flex items-center justify-end gap-2">
          <div className="text-sm text-muted-foreground mr-2">共 {total} 条</div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>上一页</Button>
          <div className="text-sm text-muted-foreground">第 {page} 页</div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= total}>下一页</Button>
        </div>
      </div>
    </AppLayout>
  );
}
