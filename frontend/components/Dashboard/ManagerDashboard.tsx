
import React, { useState, useEffect } from 'react';
import { User, Payment, PaymentStatus, UserStatus, PAYMENT_TYPES } from '../../../types';
import { api } from '../../apiService';

interface ManagerDashboardProps {
  onImpersonateClient?: (client: User) => void;
}

const ApprovalForm: React.FC<{ user: User, onProcessed: () => void }> = ({ user, onProcessed }) => {
  const [jersey, setJersey] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!jersey || !pass) return alert('Please enter both a Jersey Number and Password');
    setLoading(true);
    await api.approveClient(user.id, jersey, pass);
    setLoading(false);
    onProcessed();
  };

  const handleReject = async () => {
    if (!window.confirm(`Are you sure you want to reject and delete ${user.name}'s registration?`)) return;
    setLoading(true);
    await api.rejectClient(user.id);
    setLoading(false);
    onProcessed();
  };

  return (
    <div className="group p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all bg-white shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xl font-black text-slate-800 leading-none mb-1.5">{user.name}</p>
          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
        </div>
        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">Pending</span>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Jersey #</label>
            <input 
              type="text" 
              placeholder="JSY-000" 
              className="w-full px-4 py-3 text-sm bg-slate-50 rounded-2xl outline-none uppercase font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all border-none" 
              value={jersey}
              onChange={e => setJersey(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Temp Password</label>
            <input 
              type="text" 
              placeholder="********" 
              className="w-full px-4 py-3 text-sm bg-slate-50 rounded-2xl outline-none font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all border-none" 
              value={pass}
              onChange={e => setPass(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          disabled={loading}
          className="flex-grow bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          onClick={handleApprove}
        >
          {loading ? 'Processing...' : 'Approve Access'}
        </button>
        <button 
          disabled={loading}
          className="px-6 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
          onClick={handleReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onImpersonateClient }) => {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'approvals' | 'payments' | 'ledger' | 'messaging' | 'settings'>('approvals');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>(PaymentStatus.PENDING);
  const [msgForm, setMsgForm] = useState({ msg: '', target: 'ALL' });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const load = async () => setData(await api.getManagerDashboard());
  useEffect(() => { load(); }, []);

  const handleToggleReminders = async () => {
    setIsUpdatingSettings(true);
    const newSettings = { ...data.settings, automatedRemindersEnabled: !data.settings.automatedRemindersEnabled };
    await api.updateSettings(newSettings);
    await load();
    setIsUpdatingSettings(false);
  };

  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const totals = PAYMENT_TYPES.reduce((acc, pt) => {
    acc[pt] = data.allPayments.filter((p: Payment) => p.type === pt && p.status === 'APPROVED').reduce((s: number, p: Payment) => s + p.amount, 0);
    return acc;
  }, {} as any);

  const grandTotal = Object.values(totals).reduce((a: any, b: any) => a + b, 0);

  const filteredPayments = data.allPayments.filter((p: Payment) => 
    paymentFilter === 'ALL' ? true : p.status === paymentFilter
  ).sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-10">
      {/* Dynamic Summary Section */}
      <section className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-3xl shadow-slate-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-orange-500/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Master Ledger Liquidity</p>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-4 tabular-nums">₦{grandTotal.toLocaleString()}</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">Aggregated value across all contribution tiers and saving pools.</p>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            {PAYMENT_TYPES.map(pt => (
              <div key={pt} className="bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{pt}</p>
                <p className="text-2xl font-black">₦{totals[pt].toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Navigation */}
      <nav className="flex flex-wrap gap-2 bg-white p-2 rounded-3xl w-fit shadow-sm border border-slate-100 mx-auto md:mx-0">
        {[
          { id: 'approvals', label: 'Registrations', count: data.pendingUsers.length, color: 'bg-orange-500' },
          { id: 'payments', label: 'Payments', count: data.pendingPayments.length, color: 'bg-indigo-500' },
          { id: 'ledger', label: 'Ledger', count: 0, color: '' },
          { id: 'messaging', label: 'Messaging', count: 0, color: '' },
          { id: 'settings', label: 'Settings', count: 0, color: '' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as any)} 
            className={`relative px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id 
                ? 'bg-slate-900 text-white shadow-xl' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${t.color} text-[8px] text-white animate-bounce`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content Container */}
      <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
        {tab === 'approvals' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Access Requests</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Review and assign credentials to new team members.</p>
              </div>
            </div>
            {data.pendingUsers.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Inbox Cleared</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.pendingUsers.map((u: User) => (
                  <ApprovalForm key={u.id} user={u} onProcessed={load} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Transaction Desk</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Verify receipts and reconcile submitted funds.</p>
              </div>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl w-fit">
                {[
                  { label: 'Review', value: PaymentStatus.PENDING, color: 'text-orange-600' },
                  { label: 'Cleared', value: PaymentStatus.APPROVED, color: 'text-green-600' },
                  { label: 'Bounced', value: PaymentStatus.REJECTED, color: 'text-red-600' },
                  { label: 'History', value: 'ALL', color: 'text-slate-800' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setPaymentFilter(f.value as any)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      paymentFilter === f.value 
                        ? 'bg-white shadow-lg ' + f.color
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="pb-6 px-6">Sender Identity</th>
                    <th className="pb-6 px-6">Tier</th>
                    <th className="pb-6 px-6">Amount</th>
                    <th className="pb-6 px-6 text-center">Receipt</th>
                    <th className="pb-6 px-6 text-center">Status</th>
                    <th className="pb-6 px-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No records found</td>
                    </tr>
                  ) : (
                    filteredPayments.map((p: Payment) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 px-6">
                          <p className="font-black text-slate-800 text-sm">{p.clientName}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-tight">{new Date(p.date).toLocaleDateString()} • {new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </td>
                        <td className="py-6 px-6">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight bg-slate-100 px-3 py-1 rounded-lg">{p.type}</span>
                        </td>
                        <td className="py-6 px-6 font-black text-slate-900 text-lg">₦{p.amount.toLocaleString()}</td>
                        <td className="py-6 px-6 text-center">
                          <a href={p.receiptUrl} target="_blank" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </a>
                        </td>
                        <td className="py-6 px-6 text-center">
                          <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                            p.status === PaymentStatus.APPROVED ? 'bg-green-50 text-green-600' : 
                            p.status === PaymentStatus.REJECTED ? 'bg-red-50 text-red-600' : 
                            'bg-orange-50 text-orange-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-6 px-6 text-right space-x-2">
                          {p.status === PaymentStatus.PENDING ? (
                            <>
                              <button className="px-5 py-2.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95" onClick={async () => { await api.processPayment(p.id, PaymentStatus.APPROVED); load(); }}>Clear</button>
                              <button className="px-5 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95" onClick={async () => { await api.processPayment(p.id, PaymentStatus.REJECTED); load(); }}>Reject</button>
                            </>
                          ) : (
                            <button className="px-5 py-2.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95" onClick={async () => { await api.processPayment(p.id, PaymentStatus.PENDING); load(); }}>Reset</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'ledger' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-10">
               <div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Member Performance</h2>
                 <p className="text-slate-400 text-sm font-medium mt-1">Deep-dive into individual client contribution metrics.</p>
               </div>
               <div className="bg-indigo-50 px-6 py-4 rounded-[2rem] border border-indigo-100 text-right">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Base</p>
                  <p className="text-2xl font-black text-indigo-800">{data.activeClients.length} Members</p>
               </div>
             </div>
             <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <tr>
                        <th className="p-8">Member Identity</th>
                        {PAYMENT_TYPES.map(pt => <th key={pt} className="p-8">{pt}</th>)}
                        <th className="p-8">Net Total</th>
                        <th className="p-8 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {data.activeClients.map((c: User) => {
                        const cp = data.allPayments.filter((p: Payment) => p.clientId === c.id && p.status === 'APPROVED');
                        let total = 0;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-8">
                              <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1">{c.jerseyNumber}</p>
                            </td>
                            {PAYMENT_TYPES.map(pt => {
                              const s = cp.filter((p: Payment) => p.type === pt).reduce((a: number, b: Payment) => a + b.amount, 0);
                              total += s;
                              return <td key={pt} className="p-8 text-slate-500 font-bold text-sm">₦{s.toLocaleString()}</td>;
                            })}
                            <td className="p-8 font-black text-indigo-700 text-lg">₦{total.toLocaleString()}</td>
                            <td className="p-8 text-right">
                              <button 
                                onClick={() => onImpersonateClient?.(c)}
                                className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                              >
                                Preview Dashboard
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {tab === 'messaging' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Dispatch</h2>
              <p className="text-slate-400 text-sm font-medium mt-2">Send mission-critical alerts to your team members.</p>
            </div>
            <div className="bg-white p-12 rounded-[3.5rem] shadow-3xl shadow-slate-200 border border-slate-50">
               <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Audience</label>
                    <select className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={msgForm.target} onChange={e => setMsgForm({...msgForm, target: e.target.value})}>
                       <option value="ALL">Global Broadcast (All Clients)</option>
                       {data.activeClients.map((c: User) => <option key={c.id} value={c.id}>{c.name} • {c.jerseyNumber}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Message Body</label>
                    <textarea rows={5} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-slate-700" placeholder="Type your directive here..." value={msgForm.msg} onChange={e => setMsgForm({...msgForm, msg: e.target.value})} />
                  </div>
                  <button className="w-full bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] hover:bg-black shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98]" onClick={async () => { await api.broadcast(msgForm.target, msgForm.msg); setMsgForm({...msgForm, msg: ''}); alert('Dispatch Success!'); load(); }}>
                    Release Notification
                  </button>
               </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Preferences</h2>
              <p className="text-slate-400 text-sm font-medium mt-2">Manage global system behaviors and automation rules.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-xl hover:shadow-indigo-50/50">
                <div className="pr-12">
                  <p className="font-black text-slate-800 text-lg mb-1">Payment Countdown Automations</p>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Displays a dynamic urgency timer (13th to 12th cycle) on all client dashboards.</p>
                </div>
                <button 
                  onClick={handleToggleReminders}
                  disabled={isUpdatingSettings}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    data.settings.automatedRemindersEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      data.settings.automatedRemindersEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-10 rounded-[3rem] bg-indigo-900 text-indigo-100 flex items-start group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                 <div className="bg-white/10 p-4 rounded-2xl mr-6">
                   <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Protocol Note</p>
                   <p className="text-sm font-medium leading-relaxed">The countdown cycle is hardcoded for maximum reliability. The 12th of each month is identified as the terminal point for the 'Contribution' window.</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
