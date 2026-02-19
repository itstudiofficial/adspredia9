
import React, { useState } from 'react';
import { User, Task, TaskCategory } from '../types';
import { 
  PlusCircle, 
  ArrowRight, 
  Coins, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateTaskProps {
  user: User | null;
  onCreate: (task: Task, totalCost: number) => boolean;
}

const CreateTask: React.FC<CreateTaskProps> = ({ user, onCreate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: TaskCategory.YOUTUBE,
    description: '',
    reward: 10,
    quantity: 100,
  });
  const [instructions, setInstructions] = useState<string[]>(['']);

  if (!user) return null;

  const totalCost = (formData.reward * formData.quantity) / 1000; // Reward in coins, converted to USD (1000 coins = $1)
  const hasEnoughBalance = user.balance >= totalCost;

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => {
    const next = [...instructions];
    next.splice(index, 1);
    setInstructions(next);
  };

  const handleInstructionChange = (index: number, val: string) => {
    const next = [...instructions];
    next[index] = val;
    setInstructions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughBalance) return alert('Insufficient balance! Please deposit more funds.');
    
    const newTask: Task = {
      id: 'user_t_' + Date.now(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      reward: formData.reward,
      instructions: instructions.filter(i => i.trim() !== ''),
      status: 'available',
    };

    const success = onCreate(newTask, totalCost);
    if (success) {
      alert('Task created successfully! It is now live.');
      navigate('/tasks');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto">
           <PlusCircle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Create New Task</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Promote your content or apps to our global community of earners instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Task Basics</label>
              <input 
                type="text" 
                placeholder="Task Title (e.g. Subscribe to my channel)" 
                required
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <select 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as TaskCategory})}
              >
                {Object.values(TaskCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <textarea 
                placeholder="Short description of the task..."
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all min-h-[100px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Worker Instructions</label>
                <button type="button" onClick={addInstruction} className="text-xs font-bold text-violet-600 flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Add Step
                </button>
              </div>
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">{idx+1}</span>
                  <input 
                    type="text" 
                    placeholder={`Step ${idx+1} details...`}
                    required
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:border-violet-500 outline-none"
                    value={inst}
                    onChange={e => handleInstructionChange(idx, e.target.value)}
                  />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reward per Worker</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                  <input 
                    type="number" 
                    min="1"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold"
                    value={formData.reward}
                    onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Coins</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Workers</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                  <input 
                    type="number" 
                    min="1"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 sticky top-24">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Workers</span>
                <span className="font-bold">{formData.quantity} Users</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cost per User</span>
                <span className="font-bold text-amber-400">{formData.reward} Coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Platform Fee</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-center">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-widest">Total Budget Required</p>
              <p className="text-4xl font-black mb-2">${totalCost.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500">Your Balance: ${user.balance.toFixed(2)}</p>
            </div>

            {!hasEnoughBalance && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-3 text-rose-200">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-medium">Insufficient balance to create this task. Please <span className="underline cursor-pointer" onClick={() => navigate('/wallet')}>Deposit</span> first.</p>
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={!hasEnoughBalance || !formData.title}
              className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-2xl
                ${hasEnoughBalance && formData.title 
                  ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'}`}
            >
              <Zap size={20} /> Publish Task
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Quality Guarantee
            </h4>
            <ul className="space-y-3 text-xs text-slate-500 leading-relaxed">
              <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                 Every task is verified by our AI and manual moderators.
              </li>
              <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                 Funds are only released when worker provides valid proof.
              </li>
              <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                 Unfilled slots are refunded back to your wallet instantly.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
