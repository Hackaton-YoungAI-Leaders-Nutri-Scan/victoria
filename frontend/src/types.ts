export interface Patient {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'alert';
  statusMessage: string;
  avatarUrl: string;
  lastReport?: string;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface ActivityItem {
  icon: string;
  title: string;
  time: string;
  type: 'mood' | 'meal' | 'medication';
}