import { useApp } from '@/hooks/use-app-state';
import { cn } from '@/lib/utils';
import { Globe, MapPin, Shield, LogOut } from 'lucide-react';
import { egyptData, uaeData } from '@/hooks/use-app-state';

export function Settings() {
  const { R, isAr, region, lang, setRegion, setLang, logout } = useApp();
  if (!R) return null;

  return (
    <div className="pb-20 md:pb-24 min-h-screen bg-background">
      {/* Header - Mobile Responsive */}
      <header className="bg-card pt-8 md:pt-12 pb-3 md:pb-4 sticky top-0 z-20 border-b border-border px-4">
        <h1 className="text-lg md:text-xl font-bold text-foreground">
          {isAr ? 'الإعدادات' : 'Setting'}
        </h1>
      </header>

      <main className="px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
        
        {/* Region Switcher - Mobile Responsive */}
        <div className="bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border flex flex-col gap-3 md:gap-4">
          <div className="flex gap-2 md:gap-3 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-foreground">{isAr ? 'المنطقة' : 'Region'}</p>
              <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground truncate">
                {R.flag} {R.name} • {R.authority} • {R.vatLabel}
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-muted p-1 rounded-lg md:rounded-xl">
            {[egyptData, uaeData].map(r => (
              <button 
                key={r.id} 
                onClick={() => setRegion(r.region)}
                className={cn(
                  "flex-1 py-1.5 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-all touch-manipulation",
                  region === r.region ? "bg-accent text-[#1A1510] shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.flag} {r.id}
              </button>
            ))}
          </div>
        </div>

        {/* Language Switcher - Mobile Responsive */}
        <div className="bg-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-border flex flex-col gap-3 md:gap-4">
          <div className="flex gap-2 md:gap-3 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-info-bg text-info flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-foreground">{isAr ? 'اللغة' : 'Language'}</p>
              <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground">English / عربي</p>
            </div>
          </div>
          <div className="flex gap-2 bg-muted p-1 rounded-lg md:rounded-xl">
            <button 
              onClick={() => setLang('en')}
              className={cn(
                "flex-1 py-1.5 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-all touch-manipulation",
                lang === 'en' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ar')}
              className={cn(
                "flex-1 py-1.5 md:py-2 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold font-arabic transition-all touch-manipulation",
                lang === 'ar' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              عربي
            </button>
          </div>
        </div>

        {/* Comparison Table - Mobile Responsive (Scrollable on small screens) */}
        <div className="bg-card p-3 md:p-5 rounded-xl md:rounded-2xl border border-border overflow-x-auto">
          <h3 className="text-xs md:text-sm font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" /> 
            <span>{isAr ? 'مقارنة 🇪🇬 vs 🇦🇪' : '🇪🇬 vs 🇦🇪 Comparison'}</span>
          </h3>
          <div className="min-w-[280px] md:min-w-0 space-y-2 md:space-y-3">
            {[
              ['VAT', '14%', '5%'],
              ['Corp Tax', '22.5% flat', '0%→9%'],
              ['E-Invoice', 'ETA Mandatory', 'FTA Pilot 2026'],
              ['Archival', '7 years', '5 years'],
              ['Social Ins', '11%+18.75%', '5%+12.5% (nat)']
            ].map((row, i) => (
              <div key={i} className="flex text-[10px] md:text-[11px] font-semibold">
                <div className="w-16 md:w-20 text-muted-foreground shrink-0">{row[0]}</div>
                <div className={cn("flex-1", region === 'egypt' ? "text-accent font-bold" : "text-foreground")}>
                  {row[1]}
                </div>
                <div className={cn("flex-1", region === 'uae' ? "text-accent font-bold" : "text-foreground")}>
                  {row[2]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button - Mobile Responsive */}
        <button 
          onClick={logout}
          className="w-full mt-6 md:mt-8 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-danger/20 text-danger font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-danger-bg transition-colors touch-manipulation"
        >
          <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {isAr ? 'تسجيل خروج' : 'Logout'}
        </button>
      </main>
    </div>
  );
}