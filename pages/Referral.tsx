
import React from 'react';
import { User } from '../types';
import { 
  Users, 
  Copy, 
  Share2, 
  Trophy, 
  TrendingUp, 
  ArrowRight,
  UserPlus,
  Gift,
  Coins
} from 'lucide-react';

const Referral: React.FC<{ user: User | null }> = ({ user }) => {
  if (!user) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://adspredia.site/register?ref=${user.referralCode}`);
    alert('Referral link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Referral Hero */}
      <div className="bg-violet-600 rounded-3xl p-8 md:p-12 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="relative z-10 flex-1">
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Team Program</span>
          <h2 className="text-4xl font-black mb-4">Grow Income Together</h2>
          <p className="text-violet-100 text-lg max-w-md opacity-90 leading-relaxed">
            Invite your friends to join Adspredia and get 10% of their income forever. Plus, get an instant bonus for every verified sign-up!
          </p>
          
          <div className="mt-10 bg-white/10 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-lg border border-white/20">
            <div className="flex-1 px-4 py-3 font-mono font-bold text-violet-200 truncate">
              adspredia.site/?ref={user.referralCode}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-white text-violet-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-50 transition-all shadow-xl"
            >
              <Copy size={20} /> Copy Link
            </button>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20 animate-pulse">
            <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <Users size={80} className="text-white" />
            </div>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Referrals', value: user.referrals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Referral Income', value: '$0.00', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Current Rank', value: user.referrals >= 10 ? 'Bronze' : 'Newbie', icon: Trophy, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-500 font-medium mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-slate-800">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard/Team */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Your Team</h3>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full">{user.referrals} Members</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="text-slate-200" size={40} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Build Your Network</h4>
            <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed">
              When you invite friends, they'll appear here. You collect income from every task they complete!
            </p>
            <button 
              onClick={copyToClipboard}
              className="mt-8 px-8 py-3 bg-violet-50 text-violet-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-100 transition-all"
            >
              Share Referral Link
            </button>
          </div>
        </div>

        {/* Rewards Program */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Milestone Bonuses</h3>
            <div className="space-y-4">
              {[
                { label: '5 Referrals', reward: '$1.00 Bonus', progress: Math.min(100, (user.referrals / 5) * 100) },
                { label: '25 Referrals', reward: '$5.00 Bonus', progress: Math.min(100, (user.referrals / 25) * 100) },
                { label: '100 Referrals', reward: '$25.00 Bonus', progress: Math.min(100, (user.referrals / 100) * 100) },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{m.label}</span>
                    <span className="text-xs font-medium text-slate-500">{m.reward}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${m.progress === 100 ? 'bg-emerald-500' : 'bg-violet-600'}`} 
                      style={{width: `${m.progress}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <Gift className="absolute -bottom-10 -right-10 w-40 h-40 text-slate-50 opacity-50 group-hover:rotate-12 transition-transform pointer-events-none" />
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">How it works?</h3>
            <div className="space-y-4">
              {[
                { step: '1', text: 'Share your link with friends and family.' },
                { step: '2', text: 'They sign up and start completing tasks.' },
                { step: '3', text: 'You receive 10% commission on every task they complete!' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-violet-400 border border-white/10 shrink-0">
                    {item.step}
                  </span>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
