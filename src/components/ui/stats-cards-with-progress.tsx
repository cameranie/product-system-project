'use client';

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

// 圆形进度条组件
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color: string;
}

function CircularProgress({ 
  value, 
  size = 80, 
  strokeWidth = 8, 
  className = "",
  color 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-foreground">
          {value}%
        </span>
      </div>
    </div>
  );
}

const statsData = [
  {
    name: "项目进度",
    value: "75%",
    progress: 75,
    change: "+12%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "#10B981",
    description: "本月完成",
  },
  {
    name: "任务完成率",
    value: "89%",
    progress: 89,
    change: "+5%",
    changeType: "positive" as const,
    icon: CheckCircle,
    color: "#3B82F6",
    description: "已完成任务",
  },
  {
    name: "团队效率",
    value: "92%",
    progress: 92,
    change: "+8%",
    changeType: "positive" as const,
    icon: Users,
    color: "#8B5CF6",
    description: "团队协作",
  },
  {
    name: "待解决问题",
    value: "23",
    progress: 23,
    change: "-3",
    changeType: "negative" as const,
    icon: AlertCircle,
    color: "#F59E0B",
    description: "待处理",
  },
];

export function StatsCardsWithProgress() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((item) => (
        <Card key={item.name} className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${
                  item.changeType === "positive"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {item.change}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <CircularProgress
                value={item.progress}
                size={60}
                strokeWidth={6}
                color={item.color}
              />
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}



