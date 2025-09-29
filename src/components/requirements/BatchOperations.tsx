'use client';

import React, { useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NEED_TO_DO_CONFIG, PRIORITY_CONFIG } from '@/config/requirements';

interface BatchOperationsProps {
  selectedCount: number;
  batchNeedToDoValue: string;
  onBatchNeedToDoChange: (value: string) => void;
  onBatchNeedToDoUpdate: () => void;
  onClearSelection: () => void;
}

export const BatchOperations = memo(function BatchOperations({
  selectedCount,
  batchNeedToDoValue,
  onBatchNeedToDoChange,
  onBatchNeedToDoUpdate,
  onClearSelection
}: BatchOperationsProps) {
  const handleNeedToDoUpdate = useCallback(() => {
    if (batchNeedToDoValue) {
      onBatchNeedToDoUpdate();
    }
  }, [batchNeedToDoValue, onBatchNeedToDoUpdate]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            已选择 {selectedCount} 个需求
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">批量设置是否要做:</span>
            <Select value={batchNeedToDoValue} onValueChange={onBatchNeedToDoChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NEED_TO_DO_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className={`px-2 py-1 rounded text-sm ${config.color} ${config.bgColor}`}>
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleNeedToDoUpdate}
              disabled={!batchNeedToDoValue}
            >
              应用
            </Button>
          </div>

          <div className="flex-1"></div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearSelection}
          >
            取消选择
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}); 