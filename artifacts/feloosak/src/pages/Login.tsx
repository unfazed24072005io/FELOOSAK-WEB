import { useState } from 'react';
import { useApp } from '@/hooks/use-app-state';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImg from "@assets/1773704760591_1773708627320.png";

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@felosak.com');
  const [password, setPassword] = useState('password');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login();
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background generated image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Abstract golden background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm px-6 py-8 z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <img src={logoImg} alt="felosak" className="h-10 mb-4"/>
          <p className="text-sm font-medium text-muted-foreground mt-1">Your Financial Brain</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
              placeholder="Email address"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <button className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-[#1A1510] bg-accent shadow-lg shadow-accent/25 transition-all duration-200",
              "hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center h-[56px]"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#1A1510]/30 border-t-[#1A1510] rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div className="mt-8 flex items-center space-x-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-semibold text-foreground">
            <span className="mr-2 text-lg">G</span> Google
          </button>
          <button className="flex items-center justify-center py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-semibold text-foreground">
            <span className="mr-2 text-lg">🍎</span> Apple
          </button>
        </div>
      </motion.div>
    </div>
  );
}
