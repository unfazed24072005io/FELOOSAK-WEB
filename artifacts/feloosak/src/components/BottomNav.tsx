import { useApp } from '@/hooks/use-app-state';
import { LayoutDashboard, ArrowUpDown, Receipt, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const { tab, setTab, isAr } = useApp();

  const navItems = [
    { idx: 0, icon: LayoutDashboard, labelEn: 'Home', labelAr: 'الرئيسية' },
    { idx: 1, icon: ArrowUpDown, labelEn: 'Cash In/Out', labelAr: 'الوارد/الصادر' },
    { idx: 2, icon: Receipt, labelEn: 'Invoices', labelAr: 'الفواتير' },
    { idx: 3, icon: Settings, labelEn: 'Settings', labelAr: 'الإعدادات' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 px-2 sm:px-6 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = tab === item.idx;
          const Icon = item.icon;
          
          return (
            <button
              key={item.idx}
              onClick={() => setTab(item.idx)}
              className="relative flex flex-col items-center justify-center w-full h-full py-1 focus:outline-none"
            >
              <Icon 
                className={cn(
                  "w-5 h-5 mb-1 transition-colors duration-200", 
                  isActive ? "text-accent" : "text-muted-foreground"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-accent font-bold" : "text-muted-foreground"
                )}
              >
                {isAr ? item.labelAr : item.labelEn}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
