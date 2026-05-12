import { useApp } from '@/hooks/use-app-state';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { egyptData, uaeData } from '@/hooks/use-app-state';

export function RegionSelect() {
  const { setRegion } = useApp();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 md:px-6 py-8 md:py-0">
      <div className="max-w-md mx-auto w-full">
        {/* Header Section - Mobile Responsive */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            Select Your Region
          </h1>
          <p className="text-xs md:text-sm font-medium text-muted-foreground mt-2 px-3 md:px-4">
            Each region follows different tax & compliance laws.
          </p>
        </div>

        {/* Region Buttons - Mobile Responsive */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3 md:space-y-4"
        >
          {[egyptData, uaeData].map((r) => (
            <motion.button
              key={r.id}
              variants={item}
              onClick={() => setRegion(r.region)}
              className="w-full group text-left flex items-center p-3 md:p-5 bg-card rounded-xl md:rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 active:scale-98 touch-manipulation"
            >
              {/* Flag Icon - Responsive size */}
              <div className="text-3xl md:text-4xl mr-2 md:mr-4 group-hover:scale-110 transition-transform origin-center shrink-0">
                {r.flag}
              </div>
              
              {/* Region Info - Responsive text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline flex-wrap gap-1 md:gap-2">
                  <h3 className="text-base md:text-lg font-bold text-foreground truncate">
                    {r.name}
                  </h3>
                  <span className="text-xs md:text-sm font-bold text-accent font-arabic truncate">
                    {r.nameAr}
                  </span>
                </div>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground mt-0.5 md:mt-1 truncate">
                  {r.vatLabel} • {r.authority} • {r.currency}
                </p>
              </div>
              
              {/* Arrow Icon - Responsive size */}
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent group-hover:text-[#1A1510] transition-colors text-muted-foreground shrink-0 ml-2 md:ml-0">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}