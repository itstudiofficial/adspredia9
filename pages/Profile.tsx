
import React, { useState } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  Bell, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Camera,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface ProfileProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeModal, setActiveModal] = useState<'edit' | 'security' | 'notifications' | 'privacy' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form States
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) return alert('Name must be at least 3 characters.');
    
    setIsProcessing(true);
    const updatedUser = { ...user, name };
    const success = await AdsprediaBackend.updateUserFull(updatedUser);
    setIsProcessing(false);
    
    if (success) {
      onUpdateUser(updatedUser);
      setActiveModal(null);
      alert('Profile updated successfully!');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Passwords do not match.');
    if (newPassword.length < 6) return alert('Password must be at least 6 characters.');

    setIsProcessing(true);
    // In a real app, you'd have a specific backend method for password updates.
    // For this simulation, we'll assume updating the user record handles it.
    // (Note: Backend would need to re-hash, but here we just simulate the success)
    setTimeout(() => {
      setIsProcessing(false);
      setNewPassword('');
      setConfirmPassword('');
      setActiveModal(null);
      alert('Password updated successfully!');
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    const success = await AdsprediaBackend.deleteUser(user.email);
    setIsProcessing(false);
    
    if (success) {
      alert('Your account has been permanently deleted.');
      onLogout();
    }
  };

  // Fix: marked children as optional to fix TS missing property errors in JSX usage where content is passed between tags
  const Modal = ({ title, children, onClose, onSubmit }: { title: string, children?: React.ReactNode, onClose: () => void, onSubmit?: (e: React.FormEvent) => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <form onSubmit={onSubmit} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          {children}
        </div>
        <div className="mt-10 pt-8 border-t flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
            Cancel
          </button>
          {onSubmit && (
            <button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black shadow-xl hover:bg-violet-700 transition-all flex items-center justify-center">
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Profile */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="relative">
          <div className="w-40 h-40 bg-violet-100 rounded-full flex items-center justify-center text-6xl font-black text-violet-600 border-8 border-slate-50 shadow-2xl relative overflow-hidden transition-transform group-hover:scale-105 duration-500">
            {user.name.charAt(0)}
            <img 
              src={`https://i.pravatar.cc/300?u=${user.id}`} 
              alt="Profile" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </div>
          <button className="absolute bottom-2 right-2 bg-violet-600 p-3 rounded-2xl shadow-xl border-4 border-white text-white hover:scale-110 transition-all">
            <Camera size={20} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h2>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 border border-emerald-100">
              <CheckCircle2 size={14} /> Verified Member
            </span>
          </div>
          <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
            <Mail size={18} className="text-violet-600" /> {user.email}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border border-slate-100">
              <Calendar size={14} className="text-violet-400" /> Joined {user.joinDate}
            </div>
            <div className="bg-violet-600 px-5 py-2.5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-violet-100">
              <Shield size={14} className="text-violet-200" /> Level 1 Earner
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Groups */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Hub</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { id: 'edit', label: 'Edit Profile', icon: UserIcon, desc: 'Update your display name and basic info' },
                { id: 'security', label: 'Security & Password', icon: Lock, desc: 'Manage your access and secure your income' },
                { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Control how you receive task alerts' },
                { id: 'privacy', label: 'Privacy Control', icon: Shield, desc: 'Adjust your visibility on the platform' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveModal(item.id as any)}
                  className="w-full p-8 flex items-center justify-between hover:bg-violet-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-2xl transition-all shadow-sm">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg group-hover:text-violet-600 transition-colors">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-200 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-rose-50 rounded-[2.5rem] p-10 border-2 border-dashed border-rose-100 space-y-6">
            <div className="flex items-center gap-4 text-rose-600">
              <AlertTriangle size={32} />
              <h4 className="text-2xl font-black tracking-tight">Danger Zone</h4>
            </div>
            <p className="text-rose-600/70 text-sm font-medium leading-relaxed">
              Deleting your account is irreversible. All your coins, pending rewards, and transaction history will be permanently wiped from the Adspredia servers.
            </p>
            <button 
              onClick={() => setActiveModal('delete')}
              className="px-8 py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-black hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
            >
              Delete My Account Permanently
            </button>
          </div>
        </div>

        {/* Support & Preferences */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 bg-violet-500/20 w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-violet-300">
                Premium Feature
              </div>
              <h3 className="text-3xl font-black tracking-tight leading-tight">Pro Access Upgrade</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Unlock 2x task rewards, priority withdrawals, and an exclusive badge for $9.99/mo.
              </p>
              <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black shadow-2xl hover:bg-violet-50 transition-all flex items-center justify-center gap-2 group">
                Go Pro Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <Shield size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Need Assistance?</h3>
            <div className="space-y-3">
              {[
                'Help Knowledge Base',
                'Contact Support Team',
                'Report Platform Bug'
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-violet-600 hover:text-white transition-all shadow-sm">
                  {link} <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      
      {activeModal === 'edit' && (
        <Modal title="Update Profile" onClose={() => setActiveModal(null)} onSubmit={handleUpdateName}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600" size={20} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none font-bold"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gmail (Locked)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'security' && (
        <Modal title="Change Password" onClose={() => setActiveModal(null)} onSubmit={handleUpdatePassword}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none font-bold"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none font-bold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'notifications' && (
        <Modal title="Notifications" onClose={() => setActiveModal(null)} onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Preferences saved!'); }}>
          <div className="space-y-4">
            {[
              { label: 'New Task Alerts', desc: 'Get notified when high-paying tasks arrive' },
              { label: 'Wallet Updates', desc: 'Receive alerts for withdrawals and bonuses' },
              { label: 'System News', desc: 'Stay updated with platform announcements' }
            ].map((pref, i) => (
              <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">{pref.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pref.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg text-violet-600 border-2 border-slate-200 focus:ring-violet-600" />
              </label>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === 'privacy' && (
        <Modal title="Privacy Settings" onClose={() => setActiveModal(null)} onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Privacy updated!'); }}>
          <div className="space-y-4">
            {[
              { label: 'Public Profile', desc: 'Show your name and stats on leaderboards' },
              { label: 'Email Visibility', desc: 'Allow referral partners to see your email' },
              { label: 'Activity Logs', desc: 'Track and store your browsing history' }
            ].map((pref, i) => (
              <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">{pref.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pref.desc}</p>
                </div>
                <input type="checkbox" defaultChecked={i === 0} className="w-6 h-6 rounded-lg text-violet-600 border-2 border-slate-200 focus:ring-violet-600" />
              </label>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setActiveModal(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trash2 size={48} />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Final Goodbye?</h3>
             <p className="text-slate-500 font-medium mb-10 leading-relaxed">
               This action is permanent and cannot be undone. All your data and funds will be lost forever.
             </p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={isProcessing}
                  className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Deletion'}
                </button>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black"
                >
                  Keep My Account
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
