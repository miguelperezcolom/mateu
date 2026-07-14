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

export interface TimelineItem {
  id?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  icon?: string;
  color?: string;
  actionId?: string;
}

export interface Timeline {
  type?: 'Timeline';
  items?: TimelineItem[];
}

export interface Step {
  id?: string;
  title?: string;
  description?: string;
  status?: string; // done | current | upcoming
}

export interface ProgressSteps {
  type?: 'ProgressSteps';
  steps?: Step[];
}

export interface Stat {
  type?: 'Stat';
  label?: string;
  value?: string;
  unit?: string;
  delta?: string;
  trend?: string; // up | down | flat
  spark?: number[];
  actionId?: string;
}

export interface CalendarEvent {
  id?: string;
  title?: string;
  date?: string; // ISO date, YYYY-MM-DD
  color?: string;
  actionId?: string;
}

export interface Calendar {
  type?: 'Calendar';
  month?: string; // any day in the month, ISO date
  events?: CalendarEvent[];
}

export interface PricingPlan {
  id?: string;
  name?: string;
  price?: string;
  period?: string;
  featured?: boolean;
  features?: string[];
  ctaLabel?: string;
  actionId?: string;
}

export interface PricingTable {
  type?: 'PricingTable';
  plans?: PricingPlan[];
}

export interface OrgNode {
  id?: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  color?: string;
  actionId?: string;
  children?: OrgNode[];
}

export interface OrgChart {
  type?: 'OrgChart';
  root?: OrgNode;
}

export interface HeatCell {
  date?: string;
  value?: number;
  label?: string;
}

export interface Heatmap {
  type?: 'Heatmap';
  cells?: HeatCell[];
}

export interface FunnelStage {
  label?: string;
  value?: number;
  color?: string;
}

export interface Funnel {
  type?: 'Funnel';
  stages?: FunnelStage[];
}

export interface TrendChart {
  type?: 'TrendChart';
  title?: string;
  values?: number[];
  labels?: string[];
  color?: string;
  area?: boolean;
}

export interface Feature {
  icon?: string;
  title?: string;
  description?: string;
  actionId?: string;
}

export interface FeatureGrid {
  type?: 'FeatureGrid';
  features?: Feature[];
  columns?: number;
}

export interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

export interface Testimonials {
  type?: 'Testimonials';
  items?: Testimonial[];
}

export interface FaqItem {
  question?: string;
  answer?: string;
  open?: boolean;
}

export interface Faq {
  type?: 'Faq';
  items?: FaqItem[];
}

export interface CalloutCard {
  type?: 'CalloutCard';
  title?: string;
  description?: string;
  icon?: string;
  ctaLabel?: string;
  actionId?: string;
  theme?: string;
}

export interface Comment {
  id?: string;
  author?: string;
  avatar?: string;
  text?: string;
  timestamp?: string;
  replies?: Comment[];
}

export interface CommentThread {
  type?: 'CommentThread';
  comments?: Comment[];
}

export interface FileItem {
  name?: string;
  size?: string;
  type?: string;
  url?: string;
  actionId?: string;
}

export interface FileList {
  type?: 'FileList';
  files?: FileItem[];
}
