'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnConfig } from './types';

export interface DataTableColumnsProps {
  columns: string[];
  hiddenColumns: string[];
  columnsConfig: Record<string, { label: string }>;
  onToggle?: (column: string) => void;
  onReorder?: (newOrder: string[]) => void;
  onReset?: () => void;
}

/**
 * 可排序的列项组件
 */
interface SortableColumnItemProps {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (columnId: string) => void;
}

function SortableColumnItem({ id, label, isVisible, onToggle }: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DropdownMenuItem
      ref={setNodeRef}
      style={style}
      onSelect={(e) => e.preventDefault()}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
        aria-label="拖拽排序"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={isVisible}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        aria-label={`${isVisible ? '隐藏' : '显示'} ${label}`}
      />
      <span className="flex-1">{label}</span>
    </DropdownMenuItem>
  );
}

/**
 * 通用数据表格列控制组件
 * 
 * 提供列的显示/隐藏切换、拖拽排序、重置功能
 * 
 * @example
 * ```tsx
 * <DataTableColumns
 *   columns={columnOrder}
 *   hiddenColumns={hiddenColumns}
 *   columnsConfig={COLUMNS_CONFIG}
 *   onToggle={toggleColumn}
 *   onReorder={reorderColumns}
 *   onReset={resetColumns}
 * />
 * ```
 */
export function DataTableColumns({
  columns,
  hiddenColumns,
  columnsConfig,
  onToggle,
  onReorder,
  onReset,
}: DataTableColumnsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.indexOf(active.id as string);
      const newIndex = columns.indexOf(over.id as string);
      const newOrder = arrayMove(columns, oldIndex, newIndex);
      onReorder?.(newOrder);
    }
  };

  // 有序的列配置
  const orderedColumns = columns
    .map(id => ({
      value: id,
      label: columnsConfig[id]?.label || id,
    }))
    .filter(col => columnsConfig[col.value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={hiddenColumns.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
          aria-label={hiddenColumns.length > 0 ? `${hiddenColumns.length} 列已隐藏` : '列设置'}
        >
          <EyeOff className="h-4 w-4 mr-2" />
          {hiddenColumns.length > 0 ? `${hiddenColumns.length} 列隐藏` : '列设置'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 z-[200]"
        onPointerLeave={(e) => {
          // 防止鼠标移动到子元素时触发关闭
          const target = e.target as HTMLElement;
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (relatedTarget && target.contains(relatedTarget)) {
            e.preventDefault();
          }
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columns} strategy={verticalListSortingStrategy}>
            {orderedColumns.map((col) => (
              <SortableColumnItem
                key={col.value}
                id={col.value}
                label={col.label}
                isVisible={!hiddenColumns.includes(col.value)}
                onToggle={onToggle || (() => {})}
              />
            ))}
          </SortableContext>
        </DndContext>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            onClick={() => {
              onReset?.();
              toast.success('已恢复默认列设置');
            }}
            variant="outline"
            size="sm"
            className="w-full"
            aria-label="恢复默认列设置"
          >
            恢复默认
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

