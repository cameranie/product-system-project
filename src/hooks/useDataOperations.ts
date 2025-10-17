/**
 * 通用数据操作Hook
 * 
 * 提供数据的增删改查操作
 * 
 * @module useDataOperations
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

/**
 * 数据操作Hook的配置
 */
interface UseDataOperationsConfig<T> {
  /** 初始数据 */
  initialData?: T[];
  /** 获取数据的函数 */
  fetchData?: () => Promise<T[]>;
  /** 创建数据的函数 */
  createItem?: (item: Omit<T, 'id'>) => Promise<T>;
  /** 更新数据的函数 */
  updateItem?: (id: string, updates: Partial<T>) => Promise<T>;
  /** 删除数据的函数 */
  deleteItem?: (id: string) => Promise<void>;
  /** 批量删除数据的函数 */
  deleteItems?: (ids: string[]) => Promise<void>;
  /** 获取项目ID的函数 */
  getItemId?: (item: T) => string;
  /** 是否自动加载数据 */
  autoLoad?: boolean;
}

/**
 * 数据操作Hook的返回值
 */
interface UseDataOperationsReturn<T> {
  /** 数据列表 */
  data: T[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新数据 */
  refresh: () => Promise<void>;
  /** 创建项目 */
  create: (item: Omit<T, 'id'>) => Promise<T | null>;
  /** 更新项目 */
  update: (id: string, updates: Partial<T>) => Promise<T | null>;
  /** 删除项目 */
  remove: (id: string) => Promise<boolean>;
  /** 批量删除项目 */
  removeMany: (ids: string[]) => Promise<number>;
  /** 根据ID获取项目 */
  getById: (id: string) => T | undefined;
  /** 根据条件查找项目 */
  find: (predicate: (item: T) => boolean) => T | undefined;
  /** 根据条件过滤项目 */
  filter: (predicate: (item: T) => boolean) => T[];
  /** 设置数据 */
  setData: (data: T[]) => void;
  /** 添加项目到列表 */
  addItem: (item: T) => void;
  /** 从列表中移除项目 */
  removeItem: (id: string) => void;
  /** 更新列表中的项目 */
  updateItemInList: (id: string, updates: Partial<T>) => void;
}

/**
 * 通用数据操作Hook
 * 
 * @param config 配置选项
 * @returns 数据操作相关的状态和方法
 */
export function useDataOperations<T extends { id: string }>({
  initialData = [],
  fetchData,
  createItem,
  updateItem,
  deleteItem,
  deleteItems,
  getItemId = (item: T) => item.id,
  autoLoad = false,
}: UseDataOperationsConfig<T>): UseDataOperationsReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 刷新数据
  const refresh = useCallback(async () => {
    if (!fetchData) return;

    setLoading(true);
    setError(null);
    
    try {
      const newData = await fetchData();
      setData(newData);
    } catch (err: any) {
      setError(err.message || '加载数据失败');
      console.error('刷新数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // 创建项目
  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T | null> => {
    if (!createItem) {
      console.warn('createItem 函数未提供');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newItem = await createItem(item);
      setData(prev => [...prev, newItem]);
      toast.success('创建成功');
      return newItem;
    } catch (err: any) {
      setError(err.message || '创建失败');
      toast.error(err.message || '创建失败');
      console.error('创建项目失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [createItem]);

  // 更新项目
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    if (!updateItem) {
      console.warn('updateItem 函数未提供');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedItem = await updateItem(id, updates);
      setData(prev => prev.map(item => 
        getItemId(item) === id ? updatedItem : item
      ));
      toast.success('更新成功');
      return updatedItem;
    } catch (err: any) {
      setError(err.message || '更新失败');
      toast.error(err.message || '更新失败');
      console.error('更新项目失败:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateItem, getItemId]);

  // 删除项目
  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (!deleteItem) {
      console.warn('deleteItem 函数未提供');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteItem(id);
      setData(prev => prev.filter(item => getItemId(item) !== id));
      toast.success('删除成功');
      return true;
    } catch (err: any) {
      setError(err.message || '删除失败');
      toast.error(err.message || '删除失败');
      console.error('删除项目失败:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [deleteItem, getItemId]);

  // 批量删除项目
  const removeMany = useCallback(async (ids: string[]): Promise<number> => {
    if (!deleteItems) {
      console.warn('deleteItems 函数未提供');
      return 0;
    }

    if (ids.length === 0) return 0;

    setLoading(true);
    setError(null);

    try {
      await deleteItems(ids);
      setData(prev => prev.filter(item => !ids.includes(getItemId(item))));
      toast.success(`成功删除 ${ids.length} 个项目`);
      return ids.length;
    } catch (err: any) {
      setError(err.message || '批量删除失败');
      toast.error(err.message || '批量删除失败');
      console.error('批量删除项目失败:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [deleteItems, getItemId]);

  // 根据ID获取项目
  const getById = useCallback((id: string): T | undefined => {
    return data.find(item => getItemId(item) === id);
  }, [data, getItemId]);

  // 根据条件查找项目
  const find = useCallback((predicate: (item: T) => boolean): T | undefined => {
    return data.find(predicate);
  }, [data]);

  // 根据条件过滤项目
  const filter = useCallback((predicate: (item: T) => boolean): T[] => {
    return data.filter(predicate);
  }, [data]);

  // 设置数据
  const setDataCallback = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  // 添加项目到列表
  const addItem = useCallback((item: T) => {
    setData(prev => [...prev, item]);
  }, []);

  // 从列表中移除项目
  const removeItem = useCallback((id: string) => {
    setData(prev => prev.filter(item => getItemId(item) !== id));
  }, [getItemId]);

  // 更新列表中的项目
  const updateItemInList = useCallback((id: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      getItemId(item) === id ? { ...item, ...updates } : item
    ));
  }, [getItemId]);

  // 自动加载数据
  useMemo(() => {
    if (autoLoad && fetchData) {
      refresh();
    }
  }, [autoLoad, fetchData, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    removeMany,
    getById,
    find,
    filter,
    setData: setDataCallback,
    addItem,
    removeItem,
    updateItemInList,
  };
}

/**
 * 乐观更新Hook
 * 
 * 提供乐观更新功能，先更新UI再同步到服务器
 */
export function useOptimisticUpdate<T extends { id: string }>(
  data: T[],
  updateFn: (id: string, updates: Partial<T>) => Promise<T>,
  rollbackFn?: (id: string, originalData: T) => void
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(data);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, Partial<T>>>(new Map());

  // 乐观更新
  const optimisticUpdate = useCallback(async (
    id: string, 
    updates: Partial<T>,
    originalData?: T
  ): Promise<T | null> => {
    // 立即更新UI
    setOptimisticData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));

    // 记录待处理的更新
    setPendingUpdates(prev => new Map(prev.set(id, updates)));

    try {
      // 执行实际更新
      const updatedItem = await updateFn(id, updates);
      
      // 更新成功，移除待处理状态
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      return updatedItem;
    } catch (error) {
      // 更新失败，回滚UI
      if (originalData) {
        setOptimisticData(prev => prev.map(item => 
          item.id === id ? originalData : item
        ));
        
        if (rollbackFn) {
          rollbackFn(id, originalData);
        }
      }

      // 移除待处理状态
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      throw error;
    }
  }, [updateFn, rollbackFn]);

  // 检查是否有待处理的更新
  const hasPendingUpdates = useMemo(() => {
    return pendingUpdates.size > 0;
  }, [pendingUpdates.size]);

  // 获取待处理的更新
  const getPendingUpdate = useCallback((id: string) => {
    return pendingUpdates.get(id);
  }, [pendingUpdates]);

  return {
    optimisticData,
    optimisticUpdate,
    hasPendingUpdates,
    getPendingUpdate,
    pendingUpdatesCount: pendingUpdates.size,
  };
}






