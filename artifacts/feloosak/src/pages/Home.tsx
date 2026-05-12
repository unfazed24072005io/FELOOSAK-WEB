import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/use-app-state';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Sparkles, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { db, collection, getDocs, query, where } from '../firebase';
import { auth } from '../firebase';
export function Home() {
  const { R, isAr, balance, totalIn, totalOut, totalOwed, custs, txs } = useApp();
  const [realTxs, setRealTxs] = useState<any[]>([]);
  const [realCusts, setRealCusts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from Firebase
  useEffect(() => {
    const loadRealData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load transactions from Firebase
        const txsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const txsSnapshot = await getDocs(txsQuery);
        const loadedTxs = txsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRealTxs(loadedTxs);

        // Load customers from Firebase
        const custsQuery = query(collection(db, "customers"), where("userId", "==", user.uid));
        const custsSnapshot = await getDocs(custsQuery);
        const loadedCusts = custsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRealCusts(loadedCusts);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, []);
// Add this right after the useEffect that loads data
useEffect(() => {
  console.log("=== Current user in Home ===");
  console.log("User:", auth.currentUser?.uid);
  console.log("Real transactions from Firebase:", realTxs);
  console.log("App context transactions:", txs);
}, [realTxs, txs]);
  if (!R) return null;

  // Calculate real totals from Firebase data
  const realTotalIn = realTxs.filter(t => t.type === 'in').reduce((s, t) => s + (t.amount || 0), 0);
  const realTotalOut = realTxs.filter(t => t.type === 'out').reduce((s, t) => s + (t.amount || 0), 0);
  const realBalance = realTotalIn - realTotalOut;
  const realTotalOwed = realCusts.filter(c => c.owed > 0).reduce((s, c) => s + (c.owed || 0), 0);
  const realCustsWithOwed = realCusts.filter(c => c.owed > 0).length;

  // Use real data if available, otherwise fallback to demo data
  const displayTxs = realTxs.length > 0 ? realTxs : txs;
  const displayCusts = realCusts.length > 0 ? realCusts : custs;
  const displayTotalIn = realTxs.length > 0 ? realTotalIn : totalIn;
  const displayTotalOut = realTxs.length > 0 ? realTotalOut : totalOut;
  const displayBalance = realTxs.length > 0 ? realBalance : balance;
  const displayTotalOwed = realCusts.length > 0 ? realTotalOwed : totalOwed;
  const displayOwedCount = realCusts.length > 0 ? realCustsWithOwed : custs.filter(c => c.owed > 0).length;

  const stats = [
    { icon: Wallet, label: isAr ? 'الرصيد' : 'Balance', value: displayBalance, color: 'text-accent', bg: 'bg-accent/10', change: '+17%', isPositive: true },
    { icon: TrendingUp, label: isAr ? 'الوارد' : 'Cash In', value: displayTotalIn, color: 'text-success', bg: 'bg-success/10', change: '+8.9%', isPositive: true },
    { icon: TrendingDown, label: isAr ? 'الصادر' : 'Cash Out', value: displayTotalOut, color: 'text-danger', bg: 'bg-danger/10', change: '-3.2%', isPositive: false },
    { icon: CreditCard, label: isAr ? 'مستحقات' : 'Receivable', value: displayTotalOwed, color: 'text-warning', bg: 'bg-warning/10', count: displayOwedCount.toString() },
  ];

  const recentTxs = displayTxs.slice(0, 6);

  const categories: Record<string, string> = {
    'sales': isAr ? 'مبيعات' : 'Sales', 'services': isAr ? 'خدمات' : 'Services', 'rent': isAr ? 'إيجار' : 'Rent',
    'inventory': isAr ? 'بضاعة' : 'Inventory', 'salaries': isAr ? 'مرتبات' : 'Salaries', 'utilities': isAr ? 'فواتير' : 'Utilities',
    'transport': isAr ? 'مواصلات' : 'Transport', 'food': isAr ? 'أكل' : 'Food', 'maintenance': isAr ? 'صيانة' : 'Maintenance'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-24 min-h-screen bg-background">
      {/* HEADER - Mobile Responsive */}
      <header className="bg-card px-4 pt-8 md:pt-12 pb-3 md:pb-4 sticky top-0 z-30 border-b border-border">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-xl font-bold text-foreground truncate">
              {isAr ? `أهلاً بك ${R.flag}` : `Welcome ${R.flag}`}
            </h1>
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground mt-0.5 md:mt-1 truncate">
              {R.name} • {R.vatLabel} • {R.authority}
            </p>
          </div>
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent relative shrink-0 ml-2">
            <span className="font-bold text-xs md:text-sm font-arabic">ف</span>
            <span className="absolute top-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-danger rounded-full border-2 border-card" />
          </div>
        </div>
      </header>

      <main className="px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* STATS GRID - Mobile responsive 2 columns */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border shadow-sm flex flex-col justify-between min-h-[90px] md:h-[100px]"
              >
                <div className="flex justify-between items-start">
                  <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl", stat.bg)}>
                    <Icon className={cn("w-3 h-3 md:w-4 md:h-4", stat.color)} />
                  </div>
                  {stat.change ? (
                    <div className={cn(
                      "px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold",
                      stat.isPositive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                    )}>
                      {stat.change}
                    </div>
                  ) : (
                    <div className="px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold bg-warning-bg text-warning">
                      {stat.count}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-semibold text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-xs md:text-base font-bold text-foreground leading-none tracking-tight truncate">
                    {formatCurrency(stat.value, R.currency).replace('.00', '')}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* AI INSIGHT - Mobile Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-accent-bg to-card rounded-xl md:rounded-2xl p-4 md:p-5 border border-accent/20 shadow-[0_8px_30px_rgb(200,166,48,0.08)] relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="flex items-start gap-3 md:gap-4 relative z-10">
            <div className="p-2 md:p-2.5 bg-accent/20 rounded-lg md:rounded-xl text-accent shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-accent mb-0.5 md:mb-1">{isAr ? 'رؤية ذكية' : 'AI Insight'}</h3>
              <p className="text-[10px] md:text-xs font-medium text-foreground leading-relaxed">
                Net profit <strong>{formatCurrency(displayBalance, R.currency)}</strong>. 
                Est. VAT: <strong>{formatCurrency(displayBalance * R.vatRate, R.currency)}</strong> ({(R.vatRate * 100).toFixed(0)}%).
                {R.id === 'EG' && displayOwedCount > 0 
                  ? ` ${displayOwedCount} customer(s) owe ${formatCurrency(displayTotalOwed, R.currency)}.` 
                  : R.id === 'AE' ? " Below AED 375K CT threshold — 0% corporate tax." : ""}
              </p>
            </div>
          </div>
        </motion.div>

        {/* RECENT TRANSACTIONS - Mobile Responsive */}
        <div>
          <div className="flex justify-between items-end mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-bold text-foreground">{isAr ? 'آخر المعاملات' : 'Recent Transactions'}</h2>
            {realTxs.length === 0 && (
              <span className="text-[10px] text-muted-foreground">Demo data shown</span>
            )}
          </div>
          
          <div className="space-y-2 md:space-y-2.5">
            {recentTxs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-1">Add your first transaction</p>
              </div>
            ) : (
              recentTxs.map((tx, i) => {
                const isIn = tx.type === 'in';
                const catLabel = categories[tx.category] || tx.category;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.05) }}
                    key={tx.id} 
                    className="bg-card p-3 md:p-3.5 rounded-xl md:rounded-2xl border border-border shadow-sm flex items-center gap-3 md:gap-4"
                  >
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0",
                      isIn ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                    )}>
                      {isIn ? <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-foreground truncate">
                        {tx.note || catLabel}
                      </p>
                      <p className="text-[9px] md:text-[11px] font-medium text-muted-foreground mt-0.5">
                        {catLabel} • {tx.date}
                      </p>
                    </div>
                    
                    <div className={cn(
                      "text-xs md:text-sm font-bold whitespace-nowrap",
                      isIn ? "text-success" : "text-danger"
                    )}>
                      {isIn ? '+' : '-'}{formatCurrency(tx.amount, R.currency).replace('.00', '')}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}