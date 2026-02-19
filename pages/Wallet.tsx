
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Transaction } from '../types';
import { 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Banknote,
  Smartphone,
  ShieldCheck,
  ChevronRight, 
  ArrowRight, 
  ArrowLeft,
  Info,
  CheckCircle2,
  Copy,
  Zap,
  Loader2,
  Globe,
  Upload,
  Image as ImageIcon,
  Clock,
  X,
  User as UserIcon,
  Hash,
  AlertCircle,
  Coins,
  ArrowUp,
  RotateCcw,
  ClipboardList,
  Users
} from 'lucide-react';
import { AdsprediaBackend } from '../backend';

interface WalletProps {
  user: User | null;
  onDeposit: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, onDeposit }) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit' | 'history'>('withdraw');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [depositStep, setDepositStep] = useState<'form' | 'payment' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tid, setTid] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const txs = await AdsprediaBackend.getTransactions();
    setHistory(txs.filter(t => t.userId === user?.id).reverse());
  };

  if (!user) return null;

  // Always show real balance
  const activeBalanceDisplay = user.balance;

  const exchangeRates = [
    { country: 'Pakistan', currency: 'PKR', rate: 278.50, flag: '🇵🇰' },
    { country: 'India', currency: 'INR', rate: 83.45, flag: '🇮🇳' },
    { country: 'Bangladesh', currency: 'BDT', rate: 117.20, flag: '🇧🇩' },
    { country: 'Philippines', currency: 'PHP', rate: 58.15, flag: '🇵🇭' },
  ];

  const withdrawMethods = [
    { 
      name: 'EasyPaisa', 
      icon: <Smartphone className="text-emerald-500" size={32} />, 
      placeholder: 'Mobile Number (03xxxxxxxxx)',
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      name: 'JazzCash', 
      icon: <Smartphone className="text-amber-500" size={32} />, 
      placeholder: 'Mobile Number (03xxxxxxxxx)',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      name: 'Payeer', 
      icon: <Globe className="text-blue-500" size={32} />, 
      placeholder: 'Account ID (P10xxxxxx)',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'Binance', 
      icon: <Zap className="text-orange-500" size={32} />, 
      placeholder: 'BEP20 Address (e.g. 0x...)',
      color: 'bg-orange-50 text-orange-600'
    },
    { 
      name: 'USDT (TRC20)', 
      icon: <Coins className="text-emerald-600" size={32} />, 
      placeholder: 'TRC20 Wallet Address (T...)',
      color: 'bg-emerald-50 text-emerald-700'
    },
  ];

  const depositMethods = [
    { 
      name: 'EasyPaisa', 
      address: '03338182116', 
      icon: <Smartphone className="text-emerald-500" size={28} />,
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      name: 'JazzCash', 
      address: '03069552023', 
      icon: <Smartphone className="text-amber-500" size={28} />,
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      name: 'Payeer', 
      address: 'P1061557241', 
      icon: <Globe className="text-blue-500" size={28} />,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'USDT (TRC20)', 
      address: 'TWFfb9ewKRbtSz8qTitr2fJpyRPQWtKj2U', 
      icon: <Coins className="text-emerald-600" size={28} />,
      color: 'bg-emerald-50 text-emerald-700'
    },
  ];

  const earningOpportunities = [
    {
      title: 'Micro Tasks',
      desc: 'Complete simple social media & website tasks.',
      icon: ClipboardList,
      link: '/tasks',
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Lucky Spin',
      desc: 'Spin the wheel 3 times daily for free coins.',
      icon: RotateCcw,
      link: '/lucky-spin',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Refer & Earn',
      desc: 'Get 10% commission from your friends income.',
      icon: Users,
      link: '/referral',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  const handleDepositClick = () => {
    if (!amount || !method) return alert('Please select method and amount');
    if (parseFloat(amount) < 1) return alert('Minimum deposit is $1.00');
    setDepositStep('payment');
  };

  const handleConfirmWithdrawal = async () => {
    if (!amount || parseFloat(amount) < 3) return alert('Minimum withdrawal is $3.00');
    if (parseFloat(amount) > user.balance) return alert('Insufficient balance!');
    if (!method) return alert('Please select a withdrawal method');
    if (!accountNumber) return alert('Please enter your account number');
    if (!accountName) return alert('Please enter your account name');
    
    setIsProcessing(true);
    await AdsprediaBackend.createTransaction(
      user.id, 
      'withdrawal', 
      parseFloat(amount), 
      method, 
      'pending', 
      accountNumber, 
      accountName
    );
    
    setIsProcessing(false);
    alert(`Withdrawal request of $${amount} submitted!`);
    setAmount('');
    setAccountNumber('');
    setAccountName('');
    fetchHistory();
  };

  const handleConfirmDeposit = async () => {
    if (!tid) return alert('Please enter TID');
    if (!screenshot) return alert('Please upload screenshot');
    
    setIsProcessing(true);
    await AdsprediaBackend.createTransaction(user.id, 'deposit', parseFloat(amount), method, 'pending', tid);
    setTimeout(() => {
      setIsProcessing(false);
      setDepositStep('success');
      fetchHistory();
    }, 1500);
  };

  const getGatewayIcon = (tx: Transaction) => {
    const iconClass = "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110";
    const methodName = tx.method || '';

    if (methodName.includes('EasyPaisa')) return <div className={`${iconClass} bg-emerald-50 text-emerald-600`}><Smartphone size={20}/></div>;
    if (methodName.includes('JazzCash')) return <div className={`${iconClass} bg-amber-50 text-amber-600`}><Smartphone size={20}/></div>;
    if (methodName.includes('Payeer')) return <div className={`${iconClass} bg-blue-50 text-blue-600`}><Globe size={20}/></div>;
    if (methodName.includes('Binance')) return <div className={`${iconClass} bg-orange-50 text-orange-600`}><Zap size={20}/></div>;
    if (methodName.includes('USDT')) return <div className={`${iconClass} bg-emerald-50 text-emerald-700`}><Coins size={20}/></div>;
    
    return <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">{tx.type.charAt(0)}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-violet-400" /> Secure Wallet
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-black tracking-tighter">${activeBalanceDisplay.toFixed(2)}</h2>
                <span className="text-violet-400 font-black text-sm uppercase tracking-widest">USD</span>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 size={14} /> Active
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Coins</p>
                  <p className="text-sm font-bold text-amber-400">{user.coins} C</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px]"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Globe size={20} className="text-violet-600" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Market Rates</h3>
            </div>
            <div className="space-y-4">
              {exchangeRates.map((item) => (
                <div key={item.currency} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.flag}</span>
                    <p className="text-xs font-black text-slate-800">{item.country}</p>
                  </div>
                  <p className="text-sm font-black text-violet-600">{(item.rate * activeBalanceDisplay).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex border-b bg-slate-50/50">
              {[
                { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
                { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
                { id: 'history', label: 'History', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-6 flex items-center justify-center gap-2 font-black transition-all border-b-4 
                    ${activeTab === tab.id ? 'text-violet-600 border-violet-600 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                  <tab.icon size={20} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'withdraw' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <div className="space-y-8">
                    <div className="bg-violet-50 border border-violet-100 p-6 rounded-[2rem] flex gap-5 text-violet-700">
                      <div className="shrink-0"><Info size={24} /></div>
                      <div className="space-y-1">
                         <p className="text-sm font-black uppercase tracking-widest mb-1">Withdrawal Policy</p>
                         <p className="text-sm font-medium">Payouts are processed daily. Minimum withdrawal: $3.00.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Method</label>
                        <div className="grid grid-cols-2 gap-4">
                          {withdrawMethods.map((m) => (
                            <button
                              key={m.name}
                              onClick={() => setMethod(m.name)}
                              className={`p-6 rounded-[2.5rem] border-2 transition-all text-center flex flex-col items-center gap-4 group h-full justify-center
                                ${method === m.name ? 'border-violet-600 bg-white shadow-xl shadow-violet-100/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                            >
                              <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${m.color}`}>
                                {m.icon}
                              </div>
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{m.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Amount (USD)</label>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">$</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-violet-500 outline-none font-black text-2xl tracking-tighter"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Account Info</label>
                            <div className="relative">
                              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input
                                type="text"
                                placeholder={withdrawMethods.find(m => m.name === method)?.placeholder || 'Enter address'}
                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-violet-500 outline-none font-bold"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleConfirmWithdrawal}
                          disabled={isProcessing}
                          className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-violet-700 transition-all disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Cashout'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'deposit' && (
                <div className="animate-in fade-in duration-300">
                  <div className="space-y-8">
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-5 text-amber-700">
                      <div className="shrink-0"><Zap size={24} /></div>
                      <div className="space-y-1">
                         <p className="text-sm font-black uppercase tracking-widest mb-1">Add Funds</p>
                         <p className="text-sm font-medium">Deposit balance to publish your own tasks.</p>
                      </div>
                    </div>
                    {/* Simplified deposit section for brevity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Gateway</label>
                          <div className="space-y-4">
                            {depositMethods.map((m) => (
                              <button
                                key={m.name}
                                onClick={() => setMethod(m.name)}
                                className={`w-full p-5 rounded-[2rem] border-2 transition-all flex items-center gap-5
                                  ${method === m.name ? 'border-violet-600 bg-white shadow-lg' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                              >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-2 shadow-sm border ${m.color}`}>
                                   {m.icon}
                                </div>
                                <span className="font-black text-slate-800 text-sm tracking-tight">{m.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-8">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Amount (USD)</label>
                           <input
                              type="number"
                              placeholder="Min $1.00"
                              className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-violet-500 outline-none font-black text-4xl tracking-tighter"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                           />
                           <button onClick={handleDepositClick} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                             Next Step <ArrowRight size={20} />
                           </button>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Transaction Records</h4>
                  </div>
                  {history.length > 0 ? history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-violet-50 transition-all group">
                      <div className="flex items-center gap-5">
                        {getGatewayIcon(tx)}
                        <div>
                          <p className="font-black text-slate-800 text-base capitalize">{tx.type} {tx.method ? `- ${tx.method}` : ''}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                             <Clock size={12} /> {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={`font-black text-lg tracking-tight ${tx.type === 'deposit' || tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'spin' ? 'text-emerald-600' : 'text-rose-400'}`}>
                            {tx.type === 'deposit' || tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'spin' ? '+' : '-'}{(tx.amount * 1000).toFixed(0)} C
                         </p>
                         <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">${tx.amount.toFixed(2)} USD</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'pending' ? 'text-amber-500' : 'text-slate-300'}`}>{tx.status}</p>
                         </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No activity yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Earn Coins Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 animate-in fade-in duration-700 delay-200">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                 <Coins className="text-amber-500" /> Earn Coins
              </h3>
              <p className="text-sm text-slate-500 font-medium">Boost your balance with these opportunities</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {earningOpportunities.map((op, i) => (
            <Link 
              key={i}
              to={op.link}
              className="group p-8 rounded-[2rem] border-2 border-slate-50 bg-slate-50/30 hover:bg-white hover:border-violet-100 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4"
            >
              <div className={`p-5 rounded-2xl ${op.bg} ${op.color} group-hover:scale-110 transition-transform`}>
                 <op.icon size={32} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-lg">{op.title}</h4>
                <p className="text-sm text-slate-400 font-medium mt-1">{op.desc}</p>
              </div>
              <div className="pt-2">
                 <span className="text-xs font-black text-violet-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start Now <ArrowRight size={14} />
                 </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
