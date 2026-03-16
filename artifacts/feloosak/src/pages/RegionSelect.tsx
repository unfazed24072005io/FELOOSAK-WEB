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
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Select Your Region</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 px-4">
            Each region follows different tax & compliance laws.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {[egyptData, uaeData].map((r) => (
            <motion.button
              key={r.id}
              variants={item}
              onClick={() => setRegion(r.region)}
              className="w-full group text-left flex items-center p-5 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300"
            >
              <div className="text-4xl mr-4 group-hover:scale-110 transition-transform origin-center">
                {r.flag}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-lg font-bold text-foreground">{r.name}</h3>
                  <span className="text-sm font-bold text-accent font-arabic">{r.nameAr}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  {r.vatLabel} • {r.authority} • {r.currency}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent group-hover:text-[#1A1510] transition-colors text-muted-foreground">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
