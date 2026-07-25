export interface Asset {
  id: number;
  type: 'Laptop' | 'Desktop';
  make: string;
  model: string;
  sn: string;
  user_name: string | null;
  user_email: string | null;
  password?: string | null; // password will be optional/hidden in lists and revealed in detail views
  email_password?: string | null;
  configuration: string | null;
  status: 'Active' | 'In Stock' | 'Maintenance' | 'Retired';
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  asset_id: number | null;
  action: 'Create' | 'Update' | 'Delete';
  details: string;
  timestamp: string;
}

export interface MakeBreakdown {
  make: string;
  count: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  laptops: number;
  desktops: number;
  statusBreakdown: StatusBreakdown[];
  makeBreakdown: MakeBreakdown[];
}

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: 'it' | 'admin';
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_id: string;
  name: string;
  email: string;
  sn: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;
  updated_at: string;
}
