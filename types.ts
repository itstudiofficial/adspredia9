
export enum TaskCategory {
  SPIN = 'Spin & Income',
  YOUTUBE = 'YouTube',
  SOCIAL = 'Social Media',
  WEBSITE = 'Website Visit',
  APP = 'App Engagement'
}

export interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  balance: number;
  referralCode: string;
  referrals: number;
  joinDate: string;
  lastBonusDate?: string;
  loginStreak: number;
  role: 'admin' | 'user';
  spinsToday: number;
  lastSpinDate?: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  reward: number;
  instructions: string[];
  status: 'pending' | 'completed' | 'available' | 'paused' | 'removed';
  creatorId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'referral' | 'bonus' | 'spin';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  method?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
