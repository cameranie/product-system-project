'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi } from '@/lib/api';
import type { User } from '@/types/issue';
import Link from 'next/link';

import {
  Table,
  TableHeader as TableHeaderRaw,
  TableBody as TableBodyRaw,
  TableRow as TableRowRaw,
  TableCell as TableCellRaw,
  TableHead as TableHeadRaw,
} from '@/components/ui/table';

import { Search, Plus, Eye } from 'lucide-react';

// 人员状态配置
const userStatusConfig = {
  ACTIVE: { label: '在职', color: 'bg-green-100 text-green-800' },
  INACTIVE: { label: '离职', color: 'bg-gray-100 text-gray-800' },
  ON_LEAVE: { label: '请假', color: 'bg-yellow-100 text-yellow-800' },
  PROBATION: { label: '试用期', color: 'bg-blue-100 text-blue-800' },
};

// 人员类型配置
const userTypeConfig = {
  FULL_TIME: { label: '全职' },
  PART_TIME: { label: '兼职' },
  INTERN: { label: '实习生' },
  CONTRACTOR: { label: '外包' },
};

// 性别配置
const genderConfig = {
  MALE: { label: '男' },
  FEMALE: { label: '女' },
  OTHER: { label: '其他' },
};

// 模拟扩展用户数据
interface ExtendedUser extends User {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'PROBATION';
  userType: 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACTOR';
  department: {
    id: string;
    name: string;
  };
  manager: {
    id: string;
    name: string;
  } | null;
  position: string;
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载人员数据
  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        setLoading(true);
        const response = await userApi.getUsers();
        
        // 模拟扩展数据
        const extendedUsers: ExtendedUser[] = response.users.users.map((user, index) => ({
          ...user,
          gender: ['MALE', 'FEMALE', 'OTHER'][index % 3] as 'MALE' | 'FEMALE' | 'OTHER',
          phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          status: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'PROBATION'][index % 4] as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'PROBATION',
          userType: ['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACTOR'][index % 4] as 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACTOR',
          department: {
            id: `dept_${index % 3 + 1}`,
            name: ['技术部', '产品部', '运营部'][index % 3]
          },
          manager: index === 0 ? null : {
            id: 'manager_1',
            name: '张经理'
          },
          position: ['高级工程师', '产品经理', '运营专员', '设计师'][index % 4]
        }));
        
        setPersonnel(extendedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        console.error('Failed to load personnel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPersonnel();
  }, []);

  // 过滤人员
  const filteredPersonnel = personnel.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone.includes(searchTerm) ||
    person.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        </div>

        {/* 人员表格 */}
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeaderRaw>
              <TableRowRaw>
                <TableHeadRaw>姓名</TableHeadRaw>
                <TableHeadRaw>性别</TableHeadRaw>
                <TableHeadRaw>手机号码</TableHeadRaw>
                <TableHeadRaw>人员状态</TableHeadRaw>
                <TableHeadRaw>人员类型</TableHeadRaw>
                <TableHeadRaw>部门</TableHeadRaw>
                <TableHeadRaw>主管</TableHeadRaw>
                <TableHeadRaw>职务</TableHeadRaw>
                <TableHeadRaw>操作</TableHeadRaw>
              </TableRowRaw>
            </TableHeaderRaw>
            <TableBodyRaw>
              {loading ? (
                <TableRowRaw>
                  <TableCellRaw colSpan={9} className="h-24 text-center">
                    加载中...
                  </TableCellRaw>
                </TableRowRaw>
              ) : error ? (
                <TableRowRaw>
                  <TableCellRaw colSpan={9} className="h-24 text-center text-red-600">
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
                          <div className="text-sm text-muted-foreground">{person.email}</div>
                        </div>
                      </div>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline">
                        {genderConfig[person.gender]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw className="font-mono text-sm">
                      {person.phone}
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline" className={userStatusConfig[person.status]?.color}>
                        {userStatusConfig[person.status]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <Badge variant="outline">
                        {userTypeConfig[person.userType]?.label}
                      </Badge>
                    </TableCellRaw>
                    <TableCellRaw>
                      <div className="text-sm">{person.department.name}</div>
                    </TableCellRaw>
                    <TableCellRaw>
                      {person.manager ? (
                        <div className="text-sm">{person.manager.name}</div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCellRaw>
                    <TableCellRaw>
                      <div className="text-sm">{person.position}</div>
                    </TableCellRaw>
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
                    </TableCellRaw>
                  </TableRowRaw>
                ))
              ) : (
                <TableRowRaw>
                  <TableCellRaw colSpan={9} className="h-24 text-center">
                    暂无人员数据
                  </TableCellRaw>
                </TableRowRaw>
              )}
            </TableBodyRaw>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
