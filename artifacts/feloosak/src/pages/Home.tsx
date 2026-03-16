import { useApp } from '@/hooks/use-app-state';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Sparkles, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Home() {
  const { R, isAr, balance, totalIn, totalOut, totalOwed, custs, txs } = useApp();
  if (!R) return null;

  const stats = [
    { icon: Wallet, label: isAr ? 'الرصيد' : 'Balance', value: balance, color: 'text-accent', bg: 'bg-accent/10', change: '+17%', isPositive: true },
    { icon: TrendingUp, label: isAr ? 'الوارد' : 'Cash In', value: totalIn, color: 'text-success', bg: 'bg-success/10', change: '+8.9%', isPositive: true },
    { icon: TrendingDown, label: isAr ? 'الصادر' : 'Cash Out', value: totalOut, color: 'text-danger', bg: 'bg-danger/10', change: '-3.2%', isPositive: false },
    { icon: CreditCard, label: isAr ? 'مستحقات' : 'Receivable', value: totalOwed, color: 'text-warning', bg: 'bg-warning/10', count: custs.filter(c => c.owed > 0).length.toString() },
  ];

  const recentTxs = txs.slice(0, 6);

  const categories: Record<string, string> = {
    'sales': isAr ? 'مبيعات' : 'Sales', 'services': isAr ? 'خدمات' : 'Services', 'rent': isAr ? 'إيجار' : 'Rent',
    'inventory': isAr ? 'بضاعة' : 'Inventory', 'salaries': isAr ? 'مرتبات' : 'Salaries', 'utilities': isAr ? 'فواتير' : 'Utilities',
    'transport': isAr ? 'مواصلات' : 'Transport', 'food': isAr ? 'أكل' : 'Food', 'maintenance': isAr ? 'صيانة' : 'Maintenance'
  };

  return (
    <div className="pb-24">
      {/* HEADER */}
      <header className="bg-card px-4 pt-12 pb-4 sticky top-0 z-30 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isAr ? `أهلاً بك ${R.flag}` : `Welcome ${R.flag}`}
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {R.name} • {R.vatLabel} • {R.authority}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent relative">
            <span className="font-bold text-sm font-arabic">ف</span>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-card" />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-[100px]"
              >
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-xl", stat.bg)}>
                    <Icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  {stat.change ? (
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      stat.isPositive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                    )}>
                      {stat.change}
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-bg text-warning">
                      {stat.count}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-base font-bold text-foreground leading-none tracking-tight">
                    {formatCurrency(stat.value, R.currency).replace('.00', '')}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* AI INSIGHT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-accent-bg to-card rounded-2xl p-5 border border-accent/20 shadow-[0_8px_30px_rgb(200,166,48,0.08)] relative overflow-hidden"
        >
          {/* Subtle decoration */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 bg-accent/20 rounded-xl text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-accent mb-1">{isAr ? 'رؤية ذكية' : 'AI Insight'}</h3>
              <p className="text-xs font-medium text-foreground leading-relaxed">
                Net profit <strong>{formatCurrency(balance, R.currency)}</strong> (+17%). 
                Est. VAT: <strong>{formatCurrency(balance * R.vatRate, R.currency)}</strong> ({(R.vatRate * 100).toFixed(0)}%).
                {R.id === 'EG' 
                  ? " Khaled Mahmoud is 16 days overdue on payment." 
                  : " Below AED 375K CT threshold — 0% corporate tax."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* RECENT TRANSACTIONS */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-foreground">{isAr ? 'آخر المعاملات' : 'Recent Transactions'}</h2>
          </div>
          
          <div className="space-y-2.5">
            {recentTxs.map((tx, i) => {
              const isIn = tx.type === 'in';
              const catLabel = categories[tx.category] || tx.category;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.05) }}
                  key={tx.id} 
                  className="bg-card p-3.5 rounded-2xl border border-border shadow-sm flex items-center gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isIn ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                  )}>
                    {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {tx.note || catLabel}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      {catLabel} • {tx.date}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "text-sm font-bold whitespace-nowrap",
                    isIn ? "text-success" : "text-danger"
                  )}>
                    {isIn ? '+' : '-'}{formatCurrency(tx.amount, R.currency).replace('.00', '')}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
