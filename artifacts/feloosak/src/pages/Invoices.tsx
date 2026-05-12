import { useApp } from '@/hooks/use-app-state';
import { formatCurrency, cn } from '@/lib/utils';
import { Receipt, ShieldCheck, FileText } from 'lucide-react';

export function Invoices() {
  const { R, isAr } = useApp();
  if (!R) return null;

  // Mock invoices scaled up by VAT
  const invs = [
    { num: 'FEL-2026-001', cust: 'Ahmed Hassan', total: Math.round(8700 * (1 + R.vatRate)), st: 'unpaid' },
    { num: 'FEL-2026-002', cust: 'Mohamed Ali', total: Math.round(15000 * (1 + R.vatRate)), st: 'unpaid' },
    { num: 'FEL-2026-003', cust: 'Fatma Youssef', total: Math.round(6500 * (1 + R.vatRate)), st: 'paid' },
    { num: 'FEL-2026-004', cust: 'Sara Ibrahim', total: Math.round(3800 * (1 + R.vatRate)), st: 'draft' },
  ];

  const stColors: Record<string, {text:string, bg:string}> = {
    'paid': { text: 'text-success', bg: 'bg-success-bg' },
    'unpaid': { text: 'text-warning', bg: 'bg-warning-bg' },
    'draft': { text: 'text-muted-foreground', bg: 'bg-muted' },
  };

  return (
    <div className="pb-20 md:pb-24 min-h-screen bg-background">
      {/* Header - Mobile Responsive */}
      <header className="bg-card pt-8 md:pt-12 pb-3 md:pb-4 sticky top-0 z-20 border-b border-border px-4 flex justify-between items-center">
        <h1 className="text-lg md:text-xl font-bold text-foreground">
          {isAr ? 'الفواتير' : 'Invoices'}
        </h1>
        <div className={cn(
          "px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold border whitespace-nowrap",
          R.eMandatory ? "bg-success-bg text-success border-success/20" : "bg-warning-bg text-warning border-warning/20"
        )}>
          {R.authority} {R.eMandatory ? "Active" : "Pilot"}
        </div>
      </header>

      <main className="px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
        {/* Compliance Banner - Mobile Responsive */}
        <div className={cn(
          "p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-start gap-2 md:gap-3",
          R.id === 'EG' ? "bg-danger-bg border-danger/15" : "bg-info-bg border-info/15"
        )}>
          <ShieldCheck className={cn("w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5", R.id === 'EG' ? "text-danger" : "text-info")} />
          <p className={cn("text-[9px] md:text-[11px] font-semibold leading-relaxed", R.id === 'EG' ? "text-danger" : "text-info")}>
            {R.id === 'EG'
              ? 'ETA: Real-time XML/JSON • UUID+QR • GS1 codes • Digital signature • 7yr archival'
              : 'FTA: Tax invoices with TRN • Peppol CTC pilot July 2026 • Mandatory 2027 • 5yr archival'}
          </p>
        </div>

        {/* Stats Row - Mobile Responsive 3 columns */}
        <div className="bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border shadow-sm flex divide-x divide-border">
          <div className="flex-1 text-center px-1 md:px-2">
            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">VAT</p>
            <p className="text-base md:text-xl font-black text-accent">{(R.vatRate * 100).toFixed(0)}%</p>
          </div>
          <div className="flex-1 text-center px-1 md:px-2">
            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">{isAr ? 'الفواتير' : 'Invoices'}</p>
            <p className="text-base md:text-xl font-black text-foreground">{invs.length}</p>
          </div>
          <div className="flex-1 text-center px-1 md:px-2">
            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">{isAr ? 'أرشفة' : 'Archival'}</p>
            <p className="text-base md:text-xl font-black text-info">{R.archival}yr</p>
          </div>
        </div>

        {/* Invoice List - Mobile Responsive */}
        <div className="space-y-2 md:space-y-3 mt-4 md:mt-6">
          {invs.map((inv, i) => (
            <div key={i} className="bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border shadow-sm flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 bg-accent-bg text-accent rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-foreground truncate">{inv.num}</p>
                <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate">{inv.cust}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs md:text-sm font-bold text-foreground">
                  {formatCurrency(inv.total, R.currency).replace('.00', '')}
                </p>
                <div className={cn(
                  "inline-block px-1.5 md:px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold uppercase mt-0.5 md:mt-1",
                  stColors[inv.st].bg, stColors[inv.st].text
                )}>
                  {inv.st}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB Button - Mobile Responsive */}
      <button className="fixed bottom-20 md:bottom-24 right-4 bg-accent text-[#1A1510] h-12 md:h-14 px-4 md:px-6 rounded-full shadow-lg shadow-accent/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform z-30 touch-manipulation">
        <FileText strokeWidth={2.5} className="w-4 h-4 md:w-5 md:h-5" />
        <span className="font-bold text-xs md:text-sm">{isAr ? 'فاتورة جديدة' : 'New Invoice'}</span>
      </button>
    </div>
  );
}