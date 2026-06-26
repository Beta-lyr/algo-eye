/* 通用类型定义 */

// 基础组件 Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 路由参数
export interface RouteParams {
  id?: string;
}

// 通用响应
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 语言类型
export type Locale = 'zh-CN' | 'en-US';
