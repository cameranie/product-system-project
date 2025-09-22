'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Upload, Download } from 'lucide-react';
import { userApi, adminApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  avatar?: string;
  department?: {
    id: string;
    name: string;
  };
  roles?: Array<{
    id: string;
    name: string;
  }>;
}

interface Department {
  id: string;
  name: string;
}

export default function PersonnelManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并发加载用户和部门数据
      const [usersRes, departmentsRes] = await Promise.all([
        userApi.getUsers({ take: 1000 }),
        adminApi.departments()
      ]);
      
      setUsers(usersRes.users?.users || []);
      setDepartments(departmentsRes.departments || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // 文本搜索过滤
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 部门筛选
    const matchesDepartment = !selectedDepartment || selectedDepartment === 'all' ||
      (selectedDepartment === 'unassigned' ? !user.department : user.department?.id === selectedDepartment);
    
    return matchesSearch && matchesDepartment;
  });

  const getRoleBadge = (roles: Array<{id: string; name: string}>) => {
    if (!roles || roles.length === 0) return null;
    
    const roleNames = roles.map(r => r.name);
    if (roleNames.includes('super_admin')) {
      return <Badge variant="destructive">超级管理员</Badge>;
    }
    if (roleNames.includes('admin')) {
      return <Badge variant="secondary">管理员</Badge>;
    }
    if (roleNames.includes('hr_manager')) {
      return <Badge variant="outline">HR</Badge>;
    }
    return <Badge variant="default">成员</Badge>;
  };

  // 处理XLSX文件转换为CSV文本
  const handleFileUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 转换为CSV文本
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      setImportText(csvText);
    } catch (error) {
      console.error('文件解析失败:', error);
      alert('文件解析失败，请确保文件格式正确');
    }
  };

  // 下载CSV模板
  const downloadCSVTemplate = () => {
    const csv = '姓名,邮箱,部门,手机,员工编码\n张三,zhangsan@example.com,产品部,13800000000,EMP001\n李四,lisi@example.com,测试部,13900000000,EMP002';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = '人员导入模板.csv'; 
    a.click();
    URL.revokeObjectURL(url);
  };

  // 下载XLSX模板
  const downloadXLSXTemplate = () => {
    const data = [
      ['姓名', '邮箱', '部门', '手机', '员工编码'],
      ['张三', 'zhangsan@example.com', '产品部', '13800000000', 'EMP001'],
      ['李四', 'lisi@example.com', '测试部', '13900000000', 'EMP002']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '人员信息');
    XLSX.writeFile(wb, '人员导入模板.xlsx');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载人员信息...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          {/* 右侧按钮区域在搜索/筛选右侧 */}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索人员姓名、邮箱或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-96 bg-background border-border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="筛选部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              <SelectItem value="unassigned">未分配</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              导入人员
            </Button>
            <Link href="/personnel/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加人员
              </Button>
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username || user.email || user.name}` } />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.phone || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {user.department ? user.department.name : <span className="text-muted-foreground">未分配</span>}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.roles || [])}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/personnel/${user.id}`)}
                        >
                          查看
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/personnel/${user.id}/edit`)}
                        >
                          编辑
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? '未找到匹配的人员' : '暂无人员数据'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 导入人员对话框 */}
        <Dialog open={importOpen} onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            setImportText('');
            setImportMethod('file');
          }
        }}>
          <DialogContent className="w-[840px] max-w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle>导入人员</DialogTitle>
            </DialogHeader>
            
            <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as 'text' | 'file')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">文件上传</TabsTrigger>
                <TabsTrigger value="text">文本粘贴</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    支持上传 Excel (.xlsx)、CSV 或 Markdown 文件。表头应包含：姓名、邮箱（可选：部门、手机、员工编码）
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async ()=>{
                        try {
                          const res = await userApi.userImportHeaders();
                          const headers: string[] = res?.userImportHeaders || ['姓名','邮箱','部门','手机','员工编码'];
                          // 生成 Excel 模板
                          const ws = XLSX.utils.aoa_to_sheet([headers]);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, '人员信息');
                          XLSX.writeFile(wb, '人员导入模板.xlsx');
                        } catch {
                          downloadXLSXTemplate();
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载Excel模板
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async ()=>{
                        try {
                          const res = await userApi.userImportHeaders();
                          const headers: string[] = res?.userImportHeaders || ['姓名','邮箱','部门','手机','员工编码'];
                          const csv = headers.join(',') + '\n';
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = '人员导入模板.csv'; a.click();
                          URL.revokeObjectURL(url);
                        } catch {
                          downloadCSVTemplate();
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载CSV模板
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.md,.markdown,.txt"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                          await handleFileUpload(file);
                        } else {
                          const text = await file.text();
                          setImportText(text);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          选择文件
                        </Button>
                        <p className="mt-2 text-sm text-muted-foreground">
                          或拖拽文件到此处
                        </p>
                      </div>
                    </div>
                  </div>

                  {importText && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">预览数据：</p>
                      <div className="bg-muted p-3 rounded text-xs max-h-32 overflow-y-auto overflow-x-hidden">
                        <pre className="whitespace-pre-wrap break-all">
                          {importText.slice(0, 500)}{importText.length > 500 ? '...' : ''}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    直接粘贴 CSV 或 Markdown 表格数据。表头应包含：姓名、邮箱（可选：部门、手机、员工编码）
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">示例格式：</p>
                    <div className="bg-muted p-3 rounded text-xs overflow-y-auto overflow-x-hidden">
                      <pre className="whitespace-pre-wrap break-all">姓名,邮箱,部门,手机,员工编码
张三,zhangsan@example.com,产品部,13800000000,EMP001
李四,lisi@example.com,测试部,13900000000,EMP002</pre>
                    </div>
                  </div>

                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="在此粘贴CSV或Markdown表格..."
                    className="min-h-[200px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                取消
              </Button>
              <Button 
                disabled={importing || !importText.trim()} 
                onClick={async () => {
                  try {
                    setImporting(true);
                    const res = await userApi.importUsers(importText);
                    const info: { created: number; skipped: number; errors: string[] } = res.importUsers;
                    await loadData();
                    setImportOpen(false);
                    setImportText('');
                    alert(`导入完成：新增 ${info.created} 条，跳过 ${info.skipped} 条${(info.errors?.length ? `\n错误:\n` + info.errors.join('\n') : '')}`);
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    alert('导入失败：' + msg);
                  } finally {
                    setImporting(false);
                  }
                }}
              >
                {importing ? '导入中...' : '确定导入'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}