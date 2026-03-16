import { useState } from 'react';
import { useApp } from '@/hooks/use-app-state';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2, X } from 'lucide-react';

export function CashInOut() {
  const { R, isAr, txs, custs, totalIn, totalOut, balance, addTx, deleteTx } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  if (!R) return null;

  const tabs = [
    { labelEn: 'All', labelAr: 'الكل' },
    { labelEn: 'Cash In', labelAr: 'وارد' },
    { labelEn: 'Cash Out', labelAr: 'صادر' },
    { labelEn: 'Customers', labelAr: 'العملاء' }
  ];

  const filteredTxs = activeTab === 1 
    ? txs.filter(t => t.type === 'in')
    : activeTab === 2 
    ? txs.filter(t => t.type === 'out')
    : txs;

  const categories: Record<string, string> = {
    'sales': isAr ? 'مبيعات' : 'Sales', 'services': isAr ? 'خدمات' : 'Services', 'rent': isAr ? 'إيجار' : 'Rent',
    'inventory': isAr ? 'بضاعة' : 'Inventory', 'salaries': isAr ? 'مرتبات' : 'Salaries', 'utilities': isAr ? 'فواتير' : 'Utilities',
    'transport': isAr ? 'مواصلات' : 'Transport', 'food': isAr ? 'أكل' : 'Food', 'maintenance': isAr ? 'صيانة' : 'Maintenance', 'other': isAr ? 'أخرى' : 'Other'
  };

  return (
    <div className="pb-24 flex flex-col h-screen">
      {/* Header */}
      <header className="bg-card pt-12 pb-0 sticky top-0 z-20 border-b border-border">
        <h1 className="text-xl font-bold text-foreground px-4 mb-4">
          {isAr ? 'الوارد والصادر' : 'Cash In / Cash Out'}
        </h1>
        
        {/* Custom Tab Bar */}
        <div className="flex px-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="relative px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors"
            >
              <span className={activeTab === i ? "text-accent" : "text-muted-foreground"}>
                {isAr ? tab.labelAr : tab.labelEn}
              </span>
              {activeTab === i && (
                <motion.div layoutId="cash-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Summaries */}
      <div className="px-4 py-4 flex gap-2 shrink-0">
        <SummaryChip label={isAr ? 'وارد' : 'In'} value={totalIn} color="text-success" bg="bg-success-bg" currency={R.currency} />
        <SummaryChip label={isAr ? 'صادر' : 'Out'} value={totalOut} color="text-danger" bg="bg-danger-bg" currency={R.currency} />
        <SummaryChip label={isAr ? 'الرصيد' : 'Balance'} value={balance} color="text-accent" bg="bg-accent-bg" currency={R.currency} />
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab < 3 ? (
          <div className="space-y-2.5">
            {filteredTxs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground font-medium">{isAr ? 'لا توجد معاملات' : 'No transactions'}</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTxs.map(tx => {
                  const isIn = tx.type === 'in';
                  const catLabel = categories[tx.category] || tx.category;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, height: 0 }}
                      key={tx.id}
                      className="group relative"
                    >
                      {/* Swipe Delete Background */}
                      <div className="absolute inset-0 bg-danger rounded-2xl flex items-center justify-end px-5">
                        <Trash2 className="text-white w-5 h-5" />
                      </div>
                      
                      {/* Foreground Card */}
                      <motion.div 
                        drag="x"
                        dragConstraints={{ left: -100, right: 0 }}
                        onDragEnd={(e, { offset }) => {
                          if (offset.x < -50) deleteTx(tx.id);
                        }}
                        className="bg-card p-4 rounded-2xl border border-border flex items-center gap-4 relative z-10"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isIn ? "bg-success-bg text-success" : "bg-danger-bg text-danger")}>
                          {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{tx.note || catLabel}</p>
                          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{catLabel} • {tx.date}</p>
                        </div>
                        <div className={cn("text-sm font-bold whitespace-nowrap", isIn ? "text-success" : "text-danger")}>
                          {isIn ? '+' : '-'}{formatCurrency(tx.amount, R.currency).replace('.00', '')}
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {custs.map(c => {
              const tc = c.trust >= 90 ? 'text-success' : c.trust >= 70 ? 'text-warning' : 'text-danger';
              const tbg = c.trust >= 90 ? 'bg-success/10' : c.trust >= 70 ? 'bg-warning/10' : 'bg-danger/10';
              
              return (
                <div key={c.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-bg text-accent font-bold flex items-center justify-center text-lg">
                      {isAr ? c.nameAr[0] : c.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{isAr ? c.nameAr : c.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{c.phone}</p>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", tbg, tc)}>
                      {c.trust}% Trust
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 bg-danger-bg rounded-xl p-2.5">
                      <p className="text-[9px] font-bold text-danger uppercase mb-1">{isAr ? 'مستحق' : 'Owed'}</p>
                      <p className="text-xs font-bold text-foreground">{formatCurrency(c.owed, R.currency).replace('.00', '')}</p>
                    </div>
                    <div className="flex-1 bg-success-bg rounded-xl p-2.5">
                      <p className="text-[9px] font-bold text-success uppercase mb-1">{isAr ? 'مدفوع' : 'Paid'}</p>
                      <p className="text-xs font-bold text-foreground">{formatCurrency(c.paid, R.currency).replace('.00', '')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 bg-accent text-[#1A1510] h-14 px-6 rounded-full shadow-lg shadow-accent/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform z-30"
      >
        <Plus strokeWidth={3} className="w-5 h-5" />
        <span className="font-bold text-sm">{isAr ? 'إضافة' : 'Add'}</span>
      </button>

      {/* Add Entry Sheet overlay */}
      <AnimatePresence>
        {showAdd && <AddEntrySheet onClose={() => setShowAdd(false)} R={R} isAr={isAr} addTx={addTx} categories={categories} />}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents
function SummaryChip({ label, value, color, bg, currency }: any) {
  return (
    <div className={cn("flex-1 p-2.5 rounded-xl border border-border/50", bg)}>
      <p className={cn("text-[9px] font-bold uppercase tracking-wider text-center", color)}>{label}</p>
      <p className="text-xs font-black text-foreground text-center mt-1">
        {formatCurrency(value, currency).replace('.00', '')}
      </p>
    </div>
  )
}

function AddEntrySheet({ onClose, R, isAr, addTx, categories }: any) {
  const [type, setType] = useState<'in'|'out'>('in');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('sales');
  const [note, setNote] = useState('');

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return;
    
    addTx({
      id: Date.now().toString(),
      type,
      amount: amt,
      category: cat,
      note,
      date: new Date().toISOString().split('T')[0],
      synced: false
    });
    onClose();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose}
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40" 
      />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 p-6 pb-10 shadow-2xl"
      >
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">{isAr ? 'إضافة قيد' : 'Add Entry'}</h2>
            <p className="text-xs font-medium text-muted-foreground">{R.flag} {R.name} • {R.currency}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => setType('in')}
            className={cn(
              "flex-1 py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2",
              type === 'in' ? "bg-success border-success text-white shadow-md shadow-success/20" : "bg-muted border-border text-muted-foreground"
            )}
          >
            <ArrowDownLeft className="w-4 h-4" /> {isAr ? 'نقد وارد' : 'Cash In'}
          </button>
          <button 
            onClick={() => setType('out')}
            className={cn(
              "flex-1 py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2",
              type === 'out' ? "bg-danger border-danger text-white shadow-md shadow-danger/20" : "bg-muted border-border text-muted-foreground"
            )}
          >
            <ArrowUpRight className="w-4 h-4" /> {isAr ? 'نقد صادر' : 'Cash Out'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">{R.currency}</span>
            <input 
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-muted border border-border rounded-xl text-xl font-black text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="0.00" autoFocus
            />
          </div>
          
          <select 
            value={cat} onChange={e => setCat(e.target.value)}
            className="w-full px-4 py-4 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-accent transition-colors appearance-none"
          >
            {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          
          <input 
            type="text" value={note} onChange={e => setNote(e.target.value)}
            className="w-full px-4 py-4 bg-muted border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground"
            placeholder={isAr ? 'ملاحظة...' : 'Note...'}
          />

          <button 
            onClick={handleSave}
            className="w-full py-4 mt-2 bg-accent text-[#1A1510] font-black rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isAr ? 'حفظ' : 'Save Entry'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
