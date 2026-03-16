import { useApp } from '@/hooks/use-app-state';
import { cn } from '@/lib/utils';
import { Globe, MapPin, Shield, LogOut } from 'lucide-react';
import { egyptData, uaeData } from '@/hooks/use-app-state';

export function Settings() {
  const { R, isAr, region, lang, setRegion, setLang, logout } = useApp();
  if (!R) return null;

  return (
    <div className="pb-24">
      <header className="bg-card pt-12 pb-4 sticky top-0 z-20 border-b border-border px-4">
        <h1 className="text-xl font-bold text-foreground">
          {isAr ? 'الإعدادات' : 'Settings'}
        </h1>
      </header>

      <main className="px-4 py-6 space-y-4">
        
        {/* Region Switcher */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{isAr ? 'المنطقة' : 'Region'}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{R.flag} {R.name} • {R.authority} • {R.vatLabel}</p>
            </div>
          </div>
          <div className="flex gap-2 bg-muted p-1 rounded-xl">
            {[egyptData, uaeData].map(r => (
              <button 
                key={r.id} onClick={() => setRegion(r.region)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                  region === r.region ? "bg-accent text-[#1A1510] shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.flag} {r.id}
              </button>
            ))}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-info-bg text-info flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{isAr ? 'اللغة' : 'Language'}</p>
              <p className="text-[11px] font-medium text-muted-foreground">English / عربي</p>
            </div>
          </div>
          <div className="flex gap-2 bg-muted p-1 rounded-xl">
            <button 
              onClick={() => setLang('en')}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                lang === 'en' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ar')}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold font-arabic transition-all",
                lang === 'ar' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              عربي
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-card p-5 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" /> 🇪🇬 vs 🇦🇪 Comparison
          </h3>
          <div className="space-y-3">
            {[
              ['VAT', '14%', '5%'],
              ['Corp Tax', '22.5% flat', '0%→9%'],
              ['E-Invoice', 'ETA Mandatory', 'FTA Pilot 2026'],
              ['Archival', '7 years', '5 years'],
              ['Social Ins', '11%+18.75%', '5%+12.5% (nat)']
            ].map((row, i) => (
              <div key={i} className="flex text-[11px] font-semibold">
                <div className="w-20 text-muted-foreground">{row[0]}</div>
                <div className={cn("flex-1", region === 'egypt' ? "text-accent font-bold" : "text-foreground")}>{row[1]}</div>
                <div className={cn("flex-1", region === 'uae' ? "text-accent font-bold" : "text-foreground")}>{row[2]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="w-full mt-8 py-4 rounded-xl border-2 border-danger/20 text-danger font-bold text-sm flex items-center justify-center gap-2 hover:bg-danger-bg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isAr ? 'تسجيل خروج' : 'Logout'}
        </button>
      </main>
    </div>
  );
}
