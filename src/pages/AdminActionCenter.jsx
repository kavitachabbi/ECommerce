import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, BarChart2, ShieldAlert, FileText, Lock, Unlock, DollarSign } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useToast } from '../components/ui/Toast';

const AdminActionCenter = () => {
  const { 
    pendingRequests, requests, resolveRequest, addRequestMessage,
    activityLog, 
    escrowHoldings, releaseEscrow,
    disputes, refundDispute,
    adminRole 
  } = useGlobalState();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'escrow', 'disputes', 'log', 'analytics'
  const [loadingAction, setLoadingAction] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [adminReply, setAdminReply] = useState('');

  const isSuperAdmin = adminRole === 'superadmin';

  const handleAction = async (id, action) => {
    setLoadingAction(id);
    await new Promise(r => setTimeout(r, 600));
    resolveRequest(id, action);
    setLoadingAction(null);
    setExpandedRequestId(null);
    toast(`Request ${action === 'Approve' ? 'Approved' : 'Rejected'} successfully`, action === 'Approve' ? 'success' : 'error');
  };

  const handleSendAdminReply = (id) => {
    if (!adminReply.trim()) return;
    addRequestMessage(id, 'Admin', adminReply);
    setAdminReply('');
  };

  const handleRelease = async (id) => {
    setLoadingAction(id);
    await new Promise(r => setTimeout(r, 600));
    releaseEscrow(id);
    setLoadingAction(null);
    toast(`Funds released to seller`, 'success');
  };

  const handleRefund = async (id) => {
    setLoadingAction(id);
    await new Promise(r => setTimeout(r, 600));
    refundDispute(id);
    setLoadingAction(null);
    toast(`Instant refund issued`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className={`w-16 h-16 rounded-[10px] ${isSuperAdmin ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} flex items-center justify-center border shadow-sm`}>
          <ShieldCheck size={32} className={isSuperAdmin ? 'text-amber-500' : 'text-emerald-500'} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter font-display">
            {isSuperAdmin ? 'Advanced Admin Portal' : 'Moderator Portal'}
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Clearance Level: <strong className="uppercase text-white">{adminRole || 'Moderator'}</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4 overflow-x-auto hide-scrollbar">
        <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={Clock} label="Review Queue" badge={requests.filter(r=>r.status==='Pending').length} />
        {isSuperAdmin && (
          <>
            <TabButton active={activeTab === 'escrow'} onClick={() => setActiveTab('escrow')} icon={Lock} label="Escrow Management" badge={escrowHoldings.filter(e => e.status==='Held').length} />
            <TabButton active={activeTab === 'disputes'} onClick={() => setActiveTab('disputes')} icon={ShieldAlert} label="Dispute Resolution" badge={disputes.filter(d => d.status==='Open').length} />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Circular Analytics" />
            <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')} icon={FileText} label="Activity Log" />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="rounded-[10px] bg-[#121816] border border-white/5 p-8 shadow-sm relative overflow-hidden min-h-[50vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-bold text-white">Pending Transactions</h2>
              </div>
              {requests.filter(r=>r.status==='Pending').length === 0 ? <EmptyState icon={CheckCircle2} title="Queue is Empty" desc="All pending actions have been resolved." /> : (
                <Table headers={['Request ID', 'User', 'Type', 'Item', 'Value', 'Status', 'Action']}>
                  {requests.filter(r=>r.status==='Pending').map(req => (
                    <React.Fragment key={req.id}>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}>
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">{req.id}</td>
                        <td className="py-4 px-4 text-sm font-bold text-white">{req.user}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider ${req.type === 'Rent' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">{req.item}</td>
                        <td className="py-4 px-4 text-sm font-bold text-emerald-400">{req.amount}</td>
                        <td className="py-4 px-4"><span className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold"><AlertCircle size={12} /> {req.status}</span></td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-[10px] font-black text-emerald-400 hover:text-emerald-300">REVIEW</button>
                        </td>
                      </tr>
                      {expandedRequestId === req.id && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan="7" className="p-6 border-b border-white/5">
                            <div className="bg-[#0A0F0D] rounded-xl border border-white/10 p-4 space-y-4">
                              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Send size={14} className="text-amber-400"/> Direct Communication</h4>
                              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {(req.messages || []).map((m, i) => (
                                  <div key={i} className={`flex flex-col ${m.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[9px] text-slate-500 mb-0.5">{m.sender}</span>
                                    <div className={`px-3 py-2 rounded-[10px] text-xs ${m.sender === 'Admin' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none' : 'bg-white/10 text-slate-300 border border-white/10 rounded-tl-none'}`}>
                                      {m.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={adminReply} onChange={e=>setAdminReply(e.target.value)} placeholder="Type a reply to the user..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                                <button onClick={() => handleSendAdminReply(req.id)} className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all"><Send size={14}/></button>
                              </div>
                              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button onClick={() => handleAction(req.id, 'Rejected')} disabled={loadingAction === req.id} className="px-4 py-2 rounded-[6px] bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/30 flex items-center gap-1.5">
                                  <XCircle size={14} /> Reject
                                </button>
                                <button onClick={() => handleAction(req.id, 'Approved')} disabled={loadingAction === req.id} className="px-4 py-2 rounded-[6px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                                  <CheckCircle2 size={14} /> Approve Request
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </Table>
              )}
            </motion.div>
          )}

          {activeTab === 'escrow' && isSuperAdmin && (
            <motion.div key="escrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Payment Holding</h2>
                  <p className="text-xs text-slate-400">Funds are held in escrow until peer-to-peer confirmation is complete.</p>
                </div>
              </div>
              {escrowHoldings.length === 0 ? <EmptyState icon={ShieldCheck} title="No Escrows" desc="No funds are currently held." /> : (
                <Table headers={['Holding ID', 'Item', 'Amount', 'Seller', 'Status', 'Action']}>
                  {escrowHoldings.map(h => (
                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">{h.id}</td>
                      <td className="py-4 px-4 text-sm text-white font-bold">{h.item}</td>
                      <td className="py-4 px-4 text-sm font-bold text-amber-400">{h.amount}</td>
                      <td className="py-4 px-4 text-sm text-slate-300">{h.seller}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider ${h.status === 'Held' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {h.status === 'Held' ? (
                          <button onClick={() => handleRelease(h.id)} disabled={loadingAction === h.id} className="px-3 py-1.5 rounded-[6px] bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest border border-amber-500/30 flex items-center justify-center gap-1.5 ml-auto">
                            <Unlock size={14} /> Release to Seller
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500">RELEASED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </motion.div>
          )}

          {activeTab === 'disputes' && isSuperAdmin && (
            <motion.div key="disputes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Reported Items</h2>
                  <p className="text-xs text-slate-400">Ticketing system for managing fake listings or broken tools.</p>
                </div>
              </div>
              {disputes.length === 0 ? <EmptyState icon={CheckCircle2} title="No Active Disputes" desc="Community guidelines are being respected." /> : (
                <Table headers={['Ticket ID', 'Reported Item', 'Reason', 'Buyer', 'Amount', 'Status', 'Action']}>
                  {disputes.map(d => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">{d.id}</td>
                      <td className="py-4 px-4 text-sm text-white font-bold">{d.item}</td>
                      <td className="py-4 px-4 text-xs font-bold text-red-400">{d.reason}</td>
                      <td className="py-4 px-4 text-sm text-slate-300">{d.buyer}</td>
                      <td className="py-4 px-4 text-sm font-bold text-white">{d.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider ${d.status === 'Open' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {d.status === 'Open' ? (
                          <button onClick={() => handleRefund(d.id)} disabled={loadingAction === d.id} className="px-3 py-1.5 rounded-[6px] bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest border border-red-500/30 flex items-center justify-center gap-1.5 ml-auto">
                            <DollarSign size={14} /> Issue Refund
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500">REFUNDED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && isSuperAdmin && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[10px] bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700" />
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 relative z-10">Total CO₂ Saved</p>
                  <h3 className="text-4xl font-black text-white relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">4,285 kg</h3>
                  <div className="mt-6 h-20 flex items-end gap-2 relative z-10">
                    {[30, 40, 20, 50, 70, 60, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                
                <div className="p-6 rounded-[10px] bg-blue-500/5 border border-blue-500/20 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 relative z-10">Sustainability Growth</p>
                  <h3 className="text-4xl font-black text-white relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">+42%</h3>
                  <div className="mt-6 h-20 flex items-end gap-2 relative z-10">
                    {[10, 20, 25, 40, 45, 60, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'log' && isSuperAdmin && (
            <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Audit & Traceability</h2>
                  <p className="text-xs text-slate-400">Immutable ledger of all admin actions and financial movements.</p>
                </div>
              </div>
              <div className="space-y-3">
                {activityLog.map(log => (
                  <div key={log.id} className="p-4 rounded-[8px] bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                      <FileText size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{log.action}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.toLocaleTimeString()} · {log.timestamp.toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-[10px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
    }`}
  >
    <Icon size={14} /> {label}
    {badge > 0 && (
      <span className="ml-1 px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">
        {badge}
      </span>
    )}
  </button>
);

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-[10px]">
    <Icon size={48} className="mb-4 text-slate-600 opacity-50" />
    <p className="text-lg font-bold text-white">{title}</p>
    <p className="text-sm mt-1">{desc}</p>
  </div>
);

const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/10">
          {headers.map((h, i) => (
            <th key={i} className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${i === headers.length - 1 ? 'text-right' : ''}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        <AnimatePresence>
          {children}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

export default AdminActionCenter;
