
import React, { useState, useEffect } from 'react';
import { User, Payment, PaymentType, PaymentStatus, Notification, PAYMENT_TYPES } from '../../../types';
import { api } from '../../apiService';
import { CountdownTimer } from './CountdownTimer';

interface ClientDashboardProps {
  user: User;
  isManagerPreview?: boolean;
  onBackToManager?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  user, 
  isManagerPreview = false, 
  onBackToManager 
}) => {
  const [data, setData] = useState<{ payments: Payment[], notifications: Notification[], settings?: any }>({ payments: [], notifications: [] });
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<PaymentType>(PaymentType.CONTRIBUTION);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const loadData = async () => {
    const res = await api.getClientDashboard(user.id);
    setData(res);
  };

  useEffect(() => { loadData(); }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManagerPreview) return;
    if (!amount || !file) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      await api.submitPayment({
        clientId: user.id,
        clientName: user.name,
        amount: parseFloat(amount),
        type,
        receiptUrl: reader.result as string
      });
      setAmount('');
      setFile(null);
      setLoading(false);
      loadData();
    };
    reader.readAsDataURL(file);
  };

  const totals = PAYMENT_TYPES.reduce((acc, pt) => {
    acc[pt] = data.payments
      .filter(p => p.type === pt && p.status === PaymentStatus.APPROVED)
      .reduce((sum, p) => sum + p.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const filteredHistory = data.payments
    .filter(p => historyFilter === 'ALL' || p.status === historyFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const remindersEnabled = data.settings?.automatedRemindersEnabled ?? true;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {isManagerPreview && (
        <div className="bg-indigo-900 border-l-8 border-orange-500 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-2xl sticky top-24 z-40 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-6 text-orange-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <p className="text-white font-black text-xs uppercase tracking-[0.4em] mb-1">Review Perspective</p>
              <p className="text-indigo-200 text-sm font-medium">Monitoring metrics for <span className="text-white font-black">{user.name}</span></p>
            </div>
          </div>
          <button 
            onClick={onBackToManager}
            className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
          >
            Terminate Session
          </button>
        </div>
      )}

      {remindersEnabled && <CountdownTimer />}

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">Member ID: <span className="text-indigo-600">{user.jerseyNumber}</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center group transition-all hover:shadow-xl hover:shadow-slate-100">
          <div className="mr-8 pr-8 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved Equity</p>
            <p className="text-4xl font-black text-slate-900 tabular-nums">₦{grandTotal.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PAYMENT_TYPES.map(pt => (
          <div key={pt} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{pt}</p>
            <p className="text-3xl font-black text-slate-800">₦{totals[pt].toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-4">
          <div className={`bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 sticky top-28 ${isManagerPreview ? 'opacity-60 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
              <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </span>
              Fund Allocation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Transfer Amount (₦)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-800 text-lg" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Category</label>
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700" 
                  value={type} 
                  onChange={e => setType(e.target.value as PaymentType)}
                >
                  {PAYMENT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Proof of Transfer</label>
                <div className="relative">
                  <input 
                    type="file" 
                    required 
                    className="w-full text-[10px] text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-slate-900 file:text-white file:text-[9px] file:font-black file:uppercase file:tracking-widest hover:file:bg-black transition-all cursor-pointer" 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                  />
                </div>
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Upload Receipt'}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-8 space-y-10">
          {/* Notifications Panel */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h3 className="text-xl font-black mb-8 flex items-center relative z-10 tracking-tight">
              <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Corporate Briefing
            </h3>
            <div className="space-y-4 relative z-10 max-h-72 overflow-y-auto pr-4 custom-scrollbar">
              {data.notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center border border-white/10 rounded-[2rem] bg-white/5">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">All catch-ups cleared</p>
                </div>
              ) : (
                data.notifications.map(n => (
                  <div key={n.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
                    <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                    <div className="flex items-center mt-4 pt-4 border-t border-white/5">
                      <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em]">{new Date(n.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-10 py-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Financial Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time status of your allocations</p>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                  {['ALL', PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.REJECTED].map((status) => (
                    <button
                      key={status}
                      onClick={() => setHistoryFilter(status as any)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        historyFilter === status 
                          ? 'bg-white text-indigo-600 shadow-xl' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {status === 'ALL' ? 'Everything' : status}
                    </button>
                  ))}
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-10 py-6">Timestamp</th>
                     <th className="px-10 py-6">Portfolio</th>
                     <th className="px-10 py-6">Volume</th>
                     <th className="px-10 py-6">Verification</th>
                     <th className="px-10 py-6 text-right">Artifact</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredHistory.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="py-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No transaction history</td>
                     </tr>
                   ) : (
                     filteredHistory.map(p => (
                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-10 py-6">
                            <p className="font-black text-slate-800 text-sm">{new Date(p.date).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </td>
                         <td className="px-10 py-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight bg-slate-100 px-3 py-1 rounded-lg">{p.type}</span>
                         </td>
                         <td className="px-10 py-6">
                            <p className="text-lg font-black text-slate-900">₦{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                         </td>
                         <td className="px-10 py-6">
                            <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                              p.status === PaymentStatus.APPROVED ? 'bg-green-50 text-green-700' : 
                              p.status === PaymentStatus.PENDING ? 'bg-orange-50 text-orange-600' : 
                              'bg-red-50 text-red-700'
                            }`}>
                              {p.status}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <a 
                              href={p.receiptUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                            >
                              Verify
                            </a>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
