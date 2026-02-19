
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  ClipboardList, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  BarChart3,
  MoreVertical,
  Filter,
  CreditCard,
  Smartphone,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  ShieldAlert,
  UserPlus,
  ArrowLeftRight,
  Shield,
  X,
  AlertTriangle,
  Loader2,
  Calendar,
  AlertCircle,
  Flag,
  Palette,
  Image as ImageIcon,
  Type,
  Plus,
  Archive,
  Settings as SettingsIcon,
  Globe,
  Layout as LayoutIcon,
  Edit,
  Mail,
  Coins
} from 'lucide-react';
import { User, Transaction, Task, TaskCategory } from '../types';
import { AdsprediaBackend, BrandingSettings } from '../backend';

interface ExtendedUser extends User {
  deposits: number;
  withdrawals: number;
  tasksCreated: number;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'campaigns' | 'settings' | 'staff'>('overview');
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [branding, setBranding] = useState<BrandingSettings>({ logoUrl: '', heroBannerUrl: '', siteName: 'Adspredia' });
  const [stats, setStats] = useState({ totalUsers: 0, totalPayouts: 0, pendingWithdrawals: 0, totalDeposits: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Task Form State
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: TaskCategory.YOUTUBE,
    description: '',
    reward: 50,
    instructions: ['']
  });

  // User Edit Modal State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    balance: 0,
    coins: 0,
    role: 'user' as 'admin' | 'user'
  });

  // Give Coins Modal State
  const [coinTargetUser, setCoinTargetUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(100);

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'transaction' | 'campaign' | 'user';
    item: Transaction | Task | User | null;
    action: 'completed' | 'rejected' | 'delete' | null;
  }>({
    show: false,
    type: 'transaction',
    item: null,
    action: null
  });
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [allUsers, allTxs, allTasks, platformStats, currentBranding] = await Promise.all([
      AdsprediaBackend.getAllUsers(),
      AdsprediaBackend.getTransactions(),
      AdsprediaBackend.getTasks(),
      AdsprediaBackend.getPlatformStats(),
      AdsprediaBackend.getBranding()
    ]);
    
    // Map user stats
    const extendedUsers = allUsers.map(u => {
      const userTxs = allTxs.filter(tx => tx.userId === u.id && tx.status === 'completed');
      const deposits = userTxs.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
      const withdrawals = userTxs.filter(tx => tx.type === 'withdrawal').reduce((sum, tx) => sum + tx.amount, 0);
      const createdTasksCount = allTasks.filter(t => t.creatorId === u.id).length;
      return { ...u, deposits, withdrawals, tasksCreated: createdTasksCount };
    });

    setUsers([...extendedUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()));
    setTransactions(allTxs.reverse());
    setTasks(allTasks);
    setStats(platformStats);
    setBranding(currentBranding);
    setIsLoading(false);
  };

  const handleBrandingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActioning(true);
    await AdsprediaBackend.updateBranding(branding);
    setIsActioning(false);
    alert('Global settings updated successfully!');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActioning(true);
    const newTask: Task = {
      id: 'admin_t_' + Date.now(),
      title: taskForm.title,
      category: TaskCategory.YOUTUBE,
      description: taskForm.description,
      reward: taskForm.reward,
      instructions: taskForm.instructions.filter(i => i.trim() !== ''),
      status: 'available'
    };
    await AdsprediaBackend.saveTask(newTask);
    setIsActioning(false);
    setShowCreateTask(false);
    setTaskForm({ title: '', category: TaskCategory.YOUTUBE, description: '', reward: 50, instructions: [''] });
    fetchData();
  };

  const handleGrantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinTargetUser) return;
    setIsActioning(true);
    
    const updatedUser = { 
      ...coinTargetUser, 
      coins: coinTargetUser.coins + coinAmount,
      balance: coinTargetUser.balance + (coinAmount / 1000)
    };
    
    await AdsprediaBackend.updateUserFull(updatedUser);
    await AdsprediaBackend.createTransaction(
      coinTargetUser.id, 
      'bonus', 
      coinAmount / 1000, 
      'Admin Adjustment',
      'completed'
    );
    
    setIsActioning(false);
    setCoinTargetUser(null);
    setCoinAmount(100);
    fetchData();
    alert(`Successfully granted ${coinAmount} coins to ${updatedUser.name}`);
  };

  const addInstruction = () => setTaskForm({ ...taskForm, instructions: [...taskForm.instructions, ''] });
  
  const updateInstruction = (index: number, val: string) => {
    const next = [...taskForm.instructions];
    next[index] = val;
    setTaskForm({ ...taskForm, instructions: next });
  };

  const removeInstruction = (index: number) => {
    if (taskForm.instructions.length <= 1) return;
    const next = taskForm.instructions.filter((_, i) => i !== index);
    setTaskForm({ ...taskForm, instructions: next });
  };

  const handleAction = async () => {
    if (!confirmModal.item || !confirmModal.action) return;
    setIsActioning(true);
    let success = false;
    
    if (confirmModal.type === 'transaction') {
      success = await AdsprediaBackend.updateTransactionStatus(
        (confirmModal.item as Transaction).id, 
        confirmModal.action as 'completed' | 'rejected'
      );
    } else if (confirmModal.type === 'campaign' && confirmModal.action === 'delete') {
      success = await AdsprediaBackend.deleteTask((confirmModal.item as Task).id);
    } else if (confirmModal.type === 'user' && confirmModal.action === 'delete') {
      success = await AdsprediaBackend.deleteUser((confirmModal.item as User).email);
    }

    setIsActioning(false);
    if (success) {
      setConfirmModal({ show: false, type: 'transaction', item: null, action: null });
      fetchData();
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const success = await AdsprediaBackend.updateTaskStatus(taskId, newStatus);
    if (success) fetchData();
  };

  const openCampaignDeleteModal = (task: Task) => {
    setConfirmModal({
      show: true,
      type: 'campaign',
      item: task,
      action: 'delete'
    });
  };

  const openUserDeleteModal = (user: User) => {
    setConfirmModal({
      show: true,
      type: 'user',
      item: user,
      action: 'delete'
    });
  };

  const handleEditUserClick = (u: User) => {
    setEditUser(u);
    setUserForm({
      name: u.name,
      balance: u.balance,
      coins: u.coins,
      role: u.role
    });
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsActioning(true);
    const updatedUser = { ...editUser, ...userForm };
    const success = await AdsprediaBackend.updateUserFull(updatedUser);
    setIsActioning(false);
    if (success) {
      setEditUser(null);
      fetchData();
      alert("User updated successfully.");
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const withdrawalTransactions = transactions.filter(tx => tx.type === 'withdrawal');

  if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-violet-600" size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 font-medium">Full management of Adspredia platform.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex-wrap overflow-hidden">
          {(['overview', 'users', 'withdrawals', 'campaigns', 'settings', 'staff'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`px-4 md:px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'settings' ? 'Global Settings' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><Users className="text-violet-600 mb-4" size={24}/><p className="text-4xl font-black">{stats.totalUsers}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members</p></div>
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><DollarSign className="text-amber-600 mb-4" size={24}/><p className="text-4xl font-black">${stats.totalDeposits.toFixed(2)}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposits</p></div>
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm"><Wallet className="text-emerald-600 mb-4" size={24}/><p className="text-4xl font-black">${stats.totalPayouts.toFixed(2)}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Out</p></div>
          <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-lg"><Clock className="mb-4" size={24}/><p className="text-4xl font-black">{stats.pendingWithdrawals}</p><p className="text-[10px] font-black text-violet-200 uppercase tracking-widest">Pending Payouts</p></div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-8 border-b bg-slate-50/30 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search name or Gmail..." 
                className="w-full pl-12 pr-6 py-3.5 bg-white border-2 rounded-2xl outline-none focus:border-violet-600 transition-all" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4 text-left">Member / Gmail</th>
                  <th className="px-8 py-4 text-left">Joined</th>
                  <th className="px-8 py-4 text-left">Balance & Coins</th>
                  <th className="px-8 py-4 text-left">Deposits ($)</th>
                  <th className="px-8 py-4 text-left">Withdrawals ($)</th>
                  <th className="px-8 py-4 text-left">Tasks</th>
                  <th className="px-8 py-4 text-left">Role</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-violet-50/20">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={10}/> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-600 text-xs">{u.joinDate}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black">Member Since</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="font-black text-emerald-600">${u.balance.toFixed(2)}</p>
                        <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1"><Coins size={10}/> {u.coins} C</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-violet-600">${u.deposits.toFixed(2)}</td>
                    <td className="px-8 py-6 font-bold text-rose-500">${u.withdrawals.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{u.tasksCreated}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setCoinTargetUser(u)}
                          className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all border border-amber-100"
                          title="Grant Coins"
                        >
                          <Coins size={16}/>
                        </button>
                        <button 
                          onClick={() => handleEditUserClick(u)}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-violet-600 hover:text-white transition-all border border-slate-100"
                          title="Edit User"
                        >
                          <Edit size={16}/>
                        </button>
                        <button 
                          onClick={() => openUserDeleteModal(u)}
                          className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                          title="Delete User"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
          <div className="p-8 border-b bg-slate-50/30 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Withdrawal Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4 text-left">User</th>
                  <th className="px-8 py-4 text-left">Amount ($)</th>
                  <th className="px-8 py-4 text-left">Method</th>
                  <th className="px-8 py-4 text-left">Account</th>
                  <th className="px-8 py-4 text-left">Status</th>
                  <th className="px-8 py-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {withdrawalTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-6 font-bold">{tx.userName}</td>
                    <td className="px-8 py-6 font-black text-rose-500">${tx.amount.toFixed(2)}</td>
                    <td className="px-8 py-6"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase">{tx.method}</span></td>
                    <td className="px-8 py-6 font-mono text-xs">{tx.accountNumber || 'N/A'}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                        tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {tx.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setConfirmModal({ show: true, type: 'transaction', item: tx, action: 'completed' })}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white border border-emerald-100 transition-all"
                          >
                            <CheckCircle2 size={16}/>
                          </button>
                          <button 
                            onClick={() => setConfirmModal({ show: true, type: 'transaction', item: tx, action: 'rejected' })}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white border border-rose-100 transition-all"
                          >
                            <XCircle size={16}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm p-10 space-y-8 animate-in fade-in">
           <div className="flex items-center gap-4 text-violet-600 mb-4">
              <ShieldCheck size={32} />
              <h2 className="text-2xl font-black text-slate-800">Staff & Roles</h2>
           </div>
           <p className="text-slate-500 font-medium">Elevate trusted community members to help manage tasks and payouts.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {users.filter(u => u.role === 'admin').map(admin => (
                <div key={admin.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{admin.name}</p>
                        <p className="text-xs text-slate-400">{admin.email}</p>
                      </div>
                   </div>
                   <span className="px-3 py-1 bg-violet-600 text-white text-[9px] font-black uppercase rounded-lg">Root Admin</span>
                </div>
              ))}
           </div>
           <div className="bg-violet-50 p-8 rounded-[2rem] border border-violet-100 text-center">
              <p className="font-black text-violet-600 text-sm mb-4">Ready to expand your team?</p>
              <button className="px-8 py-4 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-600 hover:text-white transition-all">
                Search User to Promote
              </button>
           </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Campaign Management</h2>
            <button onClick={() => setShowCreateTask(true)} className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-violet-700 transition-all"><Plus size={16}/> Create Admin Task</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50"><div className="relative max-w-md w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search campaigns by title..." className="w-full pl-12 pr-6 py-3.5 bg-white border-2 rounded-2xl outline-none focus:border-violet-600 transition-all font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-8 py-4 text-left">Campaign Details</th><th className="px-8 py-4 text-left">Category</th><th className="px-8 py-4 text-left">Reward</th><th className="px-8 py-4 text-left">Current Status</th><th className="px-8 py-4 text-right">Status Controls</th></tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800 mb-0.5">{task.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{task.description}</p>
                      </td>
                      <td className="px-8 py-6"><span className="px-2 py-1 bg-violet-50 text-violet-600 text-[10px] font-black rounded-lg uppercase tracking-wider">{task.category}</span></td>
                      <td className="px-8 py-6 font-black text-amber-600">{task.reward} C</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                            task.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            task.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            task.status === 'completed' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                            task.status === 'removed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'available' ? 'bg-emerald-500 animate-pulse' : 
                              task.status === 'paused' ? 'bg-amber-500' : 
                              task.status === 'completed' ? 'bg-violet-500' : 
                              task.status === 'removed' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}></div>
                            {task.status === 'available' ? 'Active' : task.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => updateTaskStatus(task.id, 'available')} className={`p-2 rounded-xl border ${task.status === 'available' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'}`} title="Set Active"><Play size={14}/></button>
                          <button onClick={() => updateTaskStatus(task.id, 'paused')} className={`p-2 rounded-xl border ${task.status === 'paused' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`} title="Set Paused"><Pause size={14}/></button>
                          <button onClick={() => updateTaskStatus(task.id, 'completed')} className={`p-2 rounded-xl border ${task.status === 'completed' ? 'bg-violet-600 text-white' : 'bg-white text-slate-400'}`} title="Set Completed"><Flag size={14}/></button>
                          <button onClick={() => updateTaskStatus(task.id, 'removed')} className={`p-2 rounded-xl border ${task.status === 'removed' ? 'bg-rose-600 text-white' : 'bg-white text-slate-400'}`} title="Set Removed"><Archive size={14}/></button>
                          <button onClick={() => openCampaignDeleteModal(task)} className="p-2 ml-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white border border-rose-100" title="Hard Delete"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleBrandingUpdate} className="bg-white rounded-[2.5rem] border shadow-sm p-10 max-w-2xl animate-in slide-in-from-right">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800"><SettingsIcon className="text-violet-600"/> Global Site Settings</h2>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1"><Type size={14}/> Site Name (Platform Identity)</label>
              <p className="text-xs text-slate-400 pl-1">This name appears in the browser tab, navbar, and footer.</p>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold transition-all" value={branding.siteName} onChange={e => setBranding({...branding, siteName: e.target.value})} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1"><Globe size={14}/> Logo Image URL</label>
              <p className="text-xs text-slate-400 pl-1">Best results with SVG or PNG (transparent background). Used in top-left brand slot.</p>
              <div className="flex gap-4">
                 <input type="text" className="flex-1 px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-mono text-xs transition-all" placeholder="https://..." value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})} />
                 {branding.logoUrl && <div className="w-14 h-14 bg-slate-50 border-2 rounded-2xl flex items-center justify-center overflow-hidden p-2"><img src={branding.logoUrl} className="max-w-full max-h-full object-contain" /></div>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1"><LayoutIcon size={14}/> Hero Banner URL</label>
              <p className="text-xs text-slate-400 pl-1">The main landing page image. High-resolution (1920x1080) works best.</p>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-mono text-xs transition-all" placeholder="https://..." value={branding.heroBannerUrl} onChange={e => setBranding({...branding, heroBannerUrl: e.target.value})} />
              {branding.heroBannerUrl && <div className="mt-2 w-full h-32 bg-slate-50 border-2 rounded-2xl overflow-hidden"><img src={branding.heroBannerUrl} className="w-full h-full object-cover" /></div>}
            </div>

            <div className="pt-8 border-t"><button type="submit" disabled={isActioning} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-violet-600 transition-all flex items-center justify-center gap-3">{isActioning ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/> Save Global Changes</>}</button></div>
          </div>
        </form>
      )}

      {/* Grant Coins Modal */}
      {coinTargetUser && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setCoinTargetUser(null)}></div>
          <form onSubmit={handleGrantCoins} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Grant Rewards</h3>
                <button type="button" onClick={() => setCoinTargetUser(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20}/></button>
             </div>
             
             <div className="p-6 bg-slate-50 rounded-2xl border flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold">{coinTargetUser.name.charAt(0)}</div>
                <div>
                  <p className="font-black text-slate-800">{coinTargetUser.name}</p>
                  <p className="text-xs text-slate-400">Current Balance: ${coinTargetUser.balance.toFixed(2)}</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Coins to Grant</label>
                   <div className="relative">
                      <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20}/>
                      <input 
                        type="number" 
                        required
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-black text-xl"
                        value={coinAmount}
                        onChange={e => setCoinAmount(parseInt(e.target.value) || 0)}
                      />
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Equivalent to: ${(coinAmount / 1000).toFixed(2)} USD</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button type="button" onClick={() => setCoinTargetUser(null)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black">Cancel</button>
                <button type="submit" disabled={isActioning} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center">
                   {isActioning ? <Loader2 className="animate-spin" /> : 'Grant Now'}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateTask(false)}></div>
          <form onSubmit={handleCreateTask} className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create Admin Task</h3>
                <button type="button" onClick={() => setShowCreateTask(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={24}/></button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Task Title</label>
                   <input 
                    type="text" 
                    required
                    placeholder="e.g. Subscribe to Official Youtube"
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold"
                    value={taskForm.title}
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                      <select 
                        className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold"
                        value={taskForm.category}
                        onChange={e => setTaskForm({...taskForm, category: e.target.value as TaskCategory})}
                      >
                         {Object.values(TaskCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reward (Coins)</label>
                      <div className="relative">
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18}/>
                        <input 
                          type="number" 
                          required
                          className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-black"
                          value={taskForm.reward}
                          onChange={e => setTaskForm({...taskForm, reward: parseInt(e.target.value) || 0})}
                        />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                   <textarea 
                    required
                    placeholder="Brief summary for the task card..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-medium min-h-[100px]"
                    value={taskForm.description}
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Step-by-Step Instructions</label>
                      <button type="button" onClick={addInstruction} className="flex items-center gap-1 text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline"><Plus size={14}/> Add Step</button>
                   </div>
                   <div className="space-y-3">
                      {taskForm.instructions.map((inst, idx) => (
                        <div key={idx} className="flex gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs shrink-0">{idx + 1}</div>
                           <input 
                            type="text" 
                            required
                            placeholder="Instruction detail..."
                            className="flex-1 px-5 py-3 bg-slate-50 border-2 rounded-xl outline-none focus:border-violet-600 font-medium"
                            value={inst}
                            onChange={e => updateInstruction(idx, e.target.value)}
                           />
                           {taskForm.instructions.length > 1 && (
                             <button type="button" onClick={() => removeInstruction(idx)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t flex gap-4">
                <button type="button" onClick={() => setShowCreateTask(false)} className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black">Cancel</button>
                <button type="submit" disabled={isActioning} className="flex-1 py-5 bg-violet-600 text-white rounded-2xl font-black shadow-xl hover:bg-violet-700 transition-all flex items-center justify-center">
                   {isActioning ? <Loader2 className="animate-spin" /> : 'Publish Global Task'}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditUser(null)}></div>
          <form onSubmit={handleUserUpdate} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update Account</h3>
              <button type="button" onClick={() => setEditUser(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold transition-all"
                  value={userForm.name}
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Balance ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold transition-all"
                    value={userForm.balance}
                    onChange={e => setUserForm({...userForm, balance: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Coins (C)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold transition-all"
                    value={userForm.coins}
                    onChange={e => setUserForm({...userForm, coins: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Level</label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none focus:border-violet-600 font-bold transition-all"
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value as 'admin' | 'user'})}
                >
                  <option value="user">Standard Member</option>
                  <option value="admin">Platform Admin</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t flex gap-4">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-slate-100 transition-all">Cancel</button>
              <button type="submit" disabled={isActioning} className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-xl hover:bg-violet-700 transition-all flex items-center justify-center">
                {isActioning ? <Loader2 className="animate-spin" size={20}/> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirmModal({ show: false, type: 'transaction', item: null, action: null })}></div>
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-300">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.action === 'delete' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>{confirmModal.action === 'delete' ? <Trash2 size={40}/> : <AlertTriangle size={40}/>}</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{confirmModal.action === 'delete' ? 'Delete Permanently?' : 'Confirm Action'}</h3>
              <p className="text-slate-500 font-medium mb-8">This action is irreversible. All data associated with this {confirmModal.type} will be removed.</p>
              <div className="flex gap-4"><button onClick={() => setConfirmModal({ show: false, type: 'transaction', item: null, action: null })} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">Cancel</button><button onClick={handleAction} disabled={isActioning} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all">{isActioning ? <Loader2 className="animate-spin mx-auto"/> : 'Confirm'}</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
