/**
 * 页面组件 Props 类型定义
 * 
 * 统一管理所有页面组件的Props类型，提高类型安全性和可维护性
 */

/**
 * 动态路由参数类型
 */
export interface DynamicPageParams {
  id: string;
}

/**
 * 搜索参数类型
 */
export interface SearchParams {
  from?: string;
  returnTo?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * 需求详情页Props
 */
export interface RequirementDetailPageProps {
  /** 路由参数 */
  params: DynamicPageParams;
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 需求编辑页Props
 */
export interface RequirementEditPageProps {
  /** 路由参数 */
  params: DynamicPageParams;
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 需求新建页Props
 */
export interface RequirementNewPageProps {
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 人员详情页Props
 */
export interface PersonnelDetailPageProps {
  /** 路由参数 */
  params: DynamicPageParams;
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 目录详情页Props
 */
export interface DirectoryDetailPageProps {
  /** 路由参数 */
  params: DynamicPageParams;
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 通用列表页Props
 */
export interface ListPageProps {
  /** URL搜索参数 */
  searchParams?: SearchParams;
}

/**
 * 通用详情页Props（泛型）
 */
export interface DetailPageProps<T extends Record<string, any> = DynamicPageParams> {
  /** 路由参数 */
  params: T;
  /** URL搜索参数 */
  searchParams?: SearchParams;
}




