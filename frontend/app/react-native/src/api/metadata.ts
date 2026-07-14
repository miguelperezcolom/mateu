// Wire metadata types for the dashboard/display components, mirroring the
// backend DTOs in backend/shared/dtos (MetricCardDto, ScoreboardDto, …).
// Every field is optional on the wire — null values are dropped by the server.

export type MetricTrend = 'up' | 'down' | 'neutral';

export interface MetricCard {
  type?: 'MetricCard';
  title?: string;
  value?: string;
  unit?: string;
  trend?: MetricTrend;
  trendLabel?: string;
  icon?: string;
  description?: string;
  actionId?: string;
}

// Scoreboard has no own fields — children are MetricCard components.
export interface Scoreboard {
  type?: 'Scoreboard';
}

export interface DashboardPanel {
  type?: 'DashboardPanel';
  title?: string;
  subtitle?: string;
  colSpan?: number;
  rowSpan?: number;
}

export interface DashboardLayout {
  type?: 'DashboardLayout';
  columns?: number;
}

export interface FoldoutPanelInfo {
  title?: string;
  subtitle?: string;
  icon?: string;
  open?: boolean;
}

// Overview travels as the child with slot=="overview"; panel contents as slot=="panel-N".
export interface FoldoutLayout {
  type?: 'FoldoutLayout';
  panels?: FoldoutPanelInfo[];
}

export interface HeroSection {
  type?: 'HeroSection';
  title?: string;
  subtitle?: string;
  image?: string;
  height?: string;
  centered?: boolean;
}

export interface EmptyState {
  type?: 'EmptyState';
  icon?: string;
  title?: string;
  description?: string;
  actionId?: string;
  actionLabel?: string;
}

export type SkeletonVariant = 'text' | 'card' | 'grid' | 'form';

export interface Skeleton {
  type?: 'Skeleton';
  variant?: SkeletonVariant;
  count?: number;
}

export interface GanttTask {
  id?: string;
  title?: string;
  start?: string; // ISO date, YYYY-MM-DD
  end?: string; // ISO date, YYYY-MM-DD
  progress?: number; // 0-100
  color?: string;
}

export interface Gantt {
  type?: 'Gantt';
  tasks?: GanttTask[];
}

export interface KanbanCard {
  id?: string;
  title?: string;
  description?: string;
  badge?: string;
  color?: string;
  actionId?: string;
}

export interface KanbanColumn {
  id?: string;
  title?: string;
  color?: string;
  cards?: KanbanCard[];
}

export interface Kanban {
  type?: 'Kanban';
  columns?: KanbanColumn[];
}
