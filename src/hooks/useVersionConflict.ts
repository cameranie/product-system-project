import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Requirement } from '@/lib/requirements-store';

/**
 * 版本冲突检测 Hook
 * 
 * 检测并处理多用户同时编辑同一需求时的数据冲突
 * 
 * @example
 * ```tsx
 * const { 
 *   hasConflict, 
 *   hasLocalChanges,
 *   markAsChanged,
 *   forceSave,
 *   refreshData 
 * } = useVersionConflict(requirement);
 * 
 * // 用户修改时标记
 * const handleInputChange = (field, value) => {
 *   setFormData(prev => ({ ...prev, [field]: value }));
 *   markAsChanged();
 * };
 * 
 * // 显示冲突对话框
 * <ConflictDialog
 *   open={hasConflict}
 *   onForceSave={forceSave}
 *   onRefresh={refreshData}
 * />
 * ```
 */
export function useVersionConflict(requirement?: Requirement) {
  const [serverVersion, setServerVersion] = useState(requirement?.updatedAt);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // 监听服务端数据变化
  useEffect(() => {
    if (!requirement) return;
    
    const currentServerVersion = requirement.updatedAt;
    
    // 检测版本冲突
    if (serverVersion && serverVersion !== currentServerVersion) {
      if (hasLocalChanges) {
        // 有本地修改，显示冲突提示
        setShowConflictDialog(true);
        toast.warning('需求已被他人更新', {
          description: '您的修改可能会覆盖他人的更新',
          duration: 10000,
        });
      } else {
        // 无本地修改，自动同步
        setServerVersion(currentServerVersion);
      }
    }
  }, [requirement?.updatedAt, serverVersion, hasLocalChanges]);

  /**
   * 标记有本地修改
   */
  const markAsChanged = useCallback(() => {
    setHasLocalChanges(true);
  }, []);

  /**
   * 重置本地修改状态
   */
  const resetChanges = useCallback(() => {
    setHasLocalChanges(false);
    setServerVersion(requirement?.updatedAt);
    setShowConflictDialog(false);
  }, [requirement?.updatedAt]);

  /**
   * 强制保存（忽略冲突）
   */
  const forceSave = useCallback(() => {
    setShowConflictDialog(false);
    setServerVersion(requirement?.updatedAt);
    // 返回 true 表示允许保存
    return true;
  }, [requirement?.updatedAt]);

  /**
   * 刷新数据（放弃本地修改）
   */
  const refreshData = useCallback(() => {
    resetChanges();
    window.location.reload();
  }, [resetChanges]);

  /**
   * 关闭冲突对话框
   */
  const closeConflictDialog = useCallback(() => {
    setShowConflictDialog(false);
  }, []);

  return {
    hasConflict: showConflictDialog,
    hasLocalChanges,
    serverVersion,
    markAsChanged,
    resetChanges,
    forceSave,
    refreshData,
    closeConflictDialog,
  };
}




