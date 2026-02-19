
import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types';
import { 
  Youtube, 
  Globe, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Coins,
  X,
  RotateCw,
  Loader2,
  Sparkles
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface TasksProps {
  onComplete: (coins: number) => void;
}

const Tasks: React.FC<TasksProps> = ({ onComplete }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProof, setSubmissionProof] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await AdsprediaBackend.getTasks();
      // Filter to only show available tasks to users
      const availableTasks = allTasks.filter(t => t.status === 'available');
      setTasks(availableTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = selectedCategory === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const getIcon = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.YOUTUBE: return <Youtube className="text-rose-500" />;
      case TaskCategory.WEBSITE: return <Globe className="text-blue-500" />;
      case TaskCategory.APP: return <Smartphone className="text-emerald-500" />;
      case TaskCategory.SOCIAL: return <Share2 className="text-violet-500" />;
      default: return <FileText />;
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    
    setIsSubmitting(true);
    
    // Call the Backend AI Verification
    const verification = await AdsprediaBackend.verifyTaskSubmission(activeTask, submissionProof);
    
    setIsSubmitting(false);
    
    if (verification.success) {
      onComplete(activeTask.reward);
      alert(`✅ Verified by Adspredia AI!\n${verification.message}`);
      setActiveTask(null);
      setSubmissionProof('');
      // Refresh list in case task reached limit or status changed
      fetchTasks();
    } else {
      alert(`❌ Verification Failed\nReason: ${verification.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-violet-600" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing available tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
        >
          All Tasks
        </button>
        {Object.values(TaskCategory).filter(c => c !== TaskCategory.SPIN).map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group relative">
            {/* New Task Indicator */}
            {task.id.startsWith('admin_t_') && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                <Sparkles size={10} /> Official
              </div>
            )}

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-50 rounded-[1.2rem] group-hover:scale-110 transition-transform group-hover:bg-violet-50">
                  {getIcon(task.category)}
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Coins size={12} className="text-amber-500" />
                  +{task.reward} C
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{task.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">{task.description}</p>
            </div>
            
            <div className="mt-auto p-8 bg-slate-50/50 border-t border-slate-50">
                <button 
                  onClick={() => setActiveTask(task)}
                  className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 flex items-center justify-center gap-2"
                >
                  Collect Income
                </button>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <FileText size={48} className="text-slate-200" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-lg">No Active Tasks</p>
              <p className="text-slate-400 font-medium text-sm">Check back later for new earning opportunities.</p>
            </div>
            <button onClick={fetchTasks} className="px-6 py-2.5 bg-violet-50 text-violet-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 transition-all">Refresh List</button>
          </div>
        )}
      </div>

      {activeTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveTask(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">{activeTask.title}</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-violet-600 font-black flex items-center gap-1.5 bg-violet-50 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest">
                      <Coins size={14} /> Reward: {activeTask.reward} C
                    </p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTask.category}</span>
                  </div>
                </div>
                <button onClick={() => setActiveTask(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] mb-8 border border-slate-100">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  <AlertCircle size={16} className="text-violet-600" /> 
                  AI Verification Guidelines:
                </h4>
                <ul className="space-y-4">
                  {activeTask.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm text-slate-600 font-bold">
                      <span className="w-6 h-6 bg-white border border-slate-200 text-violet-600 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm">
                        {idx + 1}
                      </span>
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleTaskSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Submission Proof</label>
                  <textarea 
                    placeholder="Enter URL, code, or description of completed task..." 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-bold min-h-[120px]"
                    required
                    value={submissionProof}
                    onChange={(e) => setSubmissionProof(e.target.value)}
                  />
                  <p className="mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-2">
                    <Sparkles size={12} className="text-violet-500" />
                    Adspredia AI will analyze your proof for immediate approval.
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !submissionProof}
                    className="flex-[2] py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RotateCw className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Verify & Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
