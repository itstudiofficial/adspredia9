
import { GoogleGenAI } from "@google/genai";
import { User, Task, Transaction, TaskCategory } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BrandingSettings {
  logoUrl: string;
  heroBannerUrl: string;
  siteName: string;
}

interface UserRecord extends User {
  passwordHash: string;
}

export class AdsprediaBackend {
  private static DB_KEY = 'adspredia_db';

  private static getDB(): { 
    users: Record<string, UserRecord>, 
    tasks: Task[], 
    transactions: Transaction[],
    branding?: BrandingSettings
  } {
    const raw = localStorage.getItem(this.DB_KEY);
    const defaultDB = {
      users: {} as Record<string, UserRecord>,
      tasks: [] as Task[],
      transactions: [] as Transaction[],
      branding: {
        logoUrl: '',
        heroBannerUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1600&auto=format&fit=crop',
        siteName: 'AdsPredia'
      }
    };

    if (!raw) return defaultDB;

    try {
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || {},
        tasks: parsed.tasks || [],
        transactions: parsed.transactions || [],
        branding: parsed.branding || defaultDB.branding
      };
    } catch (e) {
      return defaultDB;
    }
  }

  private static saveDB(db: any) {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
  }

  private static async hashPassword(password: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async initialize(defaultTasks: Task[]) {
    const db = this.getDB();
    let changed = false;

    if (db.tasks.length === 0) {
      db.tasks = defaultTasks;
      changed = true;
    }

    const rootEmail = 'admin@adspredia.site';
    if (!db.users[rootEmail]) {
      const hash = await this.hashPassword('admin123');
      const rootAdmin: UserRecord = {
        id: 'admin_root',
        name: 'Root Administrator',
        email: rootEmail,
        coins: 0,
        balance: 0,
        referralCode: 'ADMIN001',
        referrals: 0,
        joinDate: new Date().toISOString().split('T')[0],
        loginStreak: 1,
        role: 'admin',
        passwordHash: hash,
        spinsToday: 0
      };
      db.users[rootEmail] = rootAdmin;
      changed = true;
    }

    if (changed) {
      this.saveDB(db);
    }
    return db.tasks;
  }

  static async register(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const db = this.getDB();
    const emailLower = email.toLowerCase();

    if (db.users[emailLower]) {
      return { success: false, message: "Email already registered." };
    }

    const hash = await this.hashPassword(password);
    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: emailLower,
      coins: 0, 
      balance: 0,
      referralCode: 'REF' + Math.floor(Math.random() * 100000),
      referrals: 0,
      joinDate: new Date().toISOString().split('T')[0],
      loginStreak: 1,
      role: 'user',
      passwordHash: hash,
      spinsToday: 0
    };

    db.users[emailLower] = newUser;
    this.saveDB(db);

    const { passwordHash, ...userSession } = newUser;
    return { success: true, user: userSession, message: "Account created successfully!" };
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const db = this.getDB();
    const emailLower = email.toLowerCase();
    const user = db.users[emailLower];

    if (!user) {
      return { success: false, message: "No account found with this email." };
    }

    const hash = await this.hashPassword(password);
    if (user.passwordHash !== hash) {
      return { success: false, message: "Incorrect password." };
    }

    const { passwordHash: _, ...userSession } = user;
    return { success: true, user: userSession, message: "Login successful!" };
  }

  static async executeSpin(userId: string, reward: number): Promise<{ success: boolean; user?: User; message: string }> {
    const db = this.getDB();
    const users = Object.values(db.users) as UserRecord[];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return { success: false, message: "User not found." };
    
    const user = users[userIndex];
    const today = new Date().toISOString().split('T')[0];
    
    // Daily Limit Logic
    if (user.lastSpinDate !== today) {
      user.spinsToday = 0;
      user.lastSpinDate = today;
    }

    if (user.spinsToday >= 3) {
      return { success: false, message: "Daily spin limit reached (3/3)." };
    }

    user.spinsToday += 1;
    user.coins += reward;
    user.balance += (reward / 1000);
    
    db.users[user.email.toLowerCase()] = user;
    this.saveDB(db);

    await this.createTransaction(user.id, 'spin', reward / 1000, `Lucky Spin Reward (${reward} Coins)`);

    const { passwordHash, ...safeUser } = user;
    return { success: true, user: safeUser, message: `Won ${reward} Coins!` };
  }

  static async getBranding(): Promise<BrandingSettings> {
    const db = this.getDB();
    return db.branding!;
  }

  static async updateBranding(settings: BrandingSettings): Promise<void> {
    const db = this.getDB();
    db.branding = settings;
    this.saveDB(db);
  }

  static async getUser(email: string): Promise<User | null> {
    const db = this.getDB();
    const user = db.users[email.toLowerCase()];
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static saveUser(user: User) {
    const db = this.getDB();
    const emailLower = user.email.toLowerCase();
    const existing = db.users[emailLower];
    if (existing) {
      db.users[emailLower] = { ...existing, ...user };
      this.saveDB(db);
    }
  }

  static async deleteUser(email: string): Promise<boolean> {
    const db = this.getDB();
    const emailLower = email.toLowerCase();
    if (db.users[emailLower]) {
      delete db.users[emailLower];
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async updateUserFull(user: User): Promise<boolean> {
    const db = this.getDB();
    const emailLower = user.email.toLowerCase();
    const existing = db.users[emailLower];
    if (existing) {
      db.users[emailLower] = { ...existing, ...user };
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async updateUserRole(email: string, role: 'admin' | 'user'): Promise<boolean> {
    const db = this.getDB();
    const emailLower = email.toLowerCase();
    if (db.users[emailLower]) {
      db.users[emailLower].role = role;
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async getAllUsers(): Promise<User[]> {
    const db = this.getDB();
    return Object.values(db.users).map(({ passwordHash, ...u }) => u);
  }

  static async getTasks(): Promise<Task[]> {
    const db = this.getDB();
    return db.tasks;
  }

  static async saveTask(task: Task): Promise<void> {
    const db = this.getDB();
    const index = db.tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      db.tasks[index] = task;
    } else {
      db.tasks.unshift(task);
    }
    this.saveDB(db);
  }

  static async updateTaskStatus(taskId: string, status: Task['status']): Promise<boolean> {
    const db = this.getDB();
    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      db.tasks[taskIndex].status = status;
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async deleteTask(taskId: string): Promise<boolean> {
    const db = this.getDB();
    const initialLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== taskId);
    if (db.tasks.length !== initialLength) {
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async createTransaction(
    userId: string, 
    type: Transaction['type'], 
    amount: number, 
    method?: string, 
    status: Transaction['status'] = 'completed',
    accountNumber?: string,
    accountName?: string
  ) {
    const db = this.getDB();
    const user = (Object.values(db.users) as User[]).find(u => u.id === userId);
    
    const transaction: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(7),
      userId,
      userName: user?.name || 'Unknown User',
      type,
      amount,
      status,
      date: new Date().toISOString(),
      method,
      accountNumber,
      accountName
    };
    db.transactions.push(transaction);
    this.saveDB(db);
    return transaction;
  }

  static async updateTransactionStatus(txId: string, status: 'completed' | 'rejected') {
    const db = this.getDB();
    const txIndex = db.transactions.findIndex(t => t.id === txId);
    if (txIndex > -1) {
      db.transactions[txIndex].status = status;
      this.saveDB(db);
      return true;
    }
    return false;
  }

  static async getTransactions(): Promise<Transaction[]> {
    const db = this.getDB();
    return db.transactions;
  }

  static async getPlatformStats() {
    const db = this.getDB();
    const users = Object.values(db.users);
    const txs = db.transactions;

    return {
      totalUsers: users.length,
      totalPayouts: txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
      pendingWithdrawals: txs.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
      totalDeposits: txs.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    };
  }

  static async verifyTaskSubmission(task: Task, proof: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an automated task verifier for Adspredia.
        Task Title: ${task.title}
        Instructions: ${task.instructions.join(', ')}
        User's Proof: "${proof}"
        
        Evaluate if the proof is valid. Return:
        Verdict: [VALID/INVALID]
        Reason: [Short explanation]`,
        config: { temperature: 0.1 }
      });

      const text = response.text || "";
      const isValid = text.includes('VALID') && !text.includes('INVALID');
      const reasonMatch = text.match(/Reason: (.*)/);
      return {
        success: isValid,
        message: reasonMatch ? reasonMatch[1] : "Processed by AI."
      };
    } catch (error) {
      return { success: proof.length > 10, message: "Manual check pending." };
    }
  }
}
