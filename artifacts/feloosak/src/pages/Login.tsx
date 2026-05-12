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
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://i.ibb.co/zKfNST5/Gemini-Generated-Image-1lyq0p1lyq0p1lyq.png" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      {/* Golden Badges - Top Left */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10 flex flex-wrap gap-2">
        {["ETA Compliant", "FTA Ready", "Offline-First", "Arabic-Native"].map((badge) => (
          <div
            key={badge}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-500/20 backdrop-blur-sm border border-amber-400/50 shadow-lg"
          >
            <span className="text-xs md:text-sm font-semibold text-amber-400 whitespace-nowrap">{badge}</span>
          </div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[90%] md:max-w-sm px-4 md:px-6 py-6 md:py-8 z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <img src={logoImg} alt="felosak" className="h-8 md:h-10 mb-3 md:mb-4"/>
          <p className="text-xs md:text-sm font-medium text-muted-foreground mt-0.5 md:mt-1">Your Financial Brain</p>
        </div>

        {/* White Box with Logos */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
            <img src="https://i.ibb.co/m5r8Z1sG/UBER.png" alt="Uber" className="h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://i.ibb.co/4w4NdwC1/TRELLA.png" alt="TRELLA" className="h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://i.ibb.co/20fMKfMr/PAYNAS.png" alt="PAYNAS" className="h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://i.ibb.co/gbBYhqgY/VEZEETA.png" alt="VEZEETA" className="h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-3 md:space-y-4">
          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-3 md:py-3.5 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-medium"
              placeholder="Email address"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 md:pl-11 pr-10 md:pr-12 py-3 md:py-3.5 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-medium"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              {showPw ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button className="text-xs md:text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors touch-manipulation">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={cn(
              "w-full py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-[#1A1510] bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 transition-all duration-200",
              "hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-98",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center h-[48px] md:h-[56px] touch-manipulation"
            )}
          >
            {loading ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#1A1510]/30 border-t-[#1A1510] rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="mt-6 md:mt-8 flex items-center space-x-3 md:space-x-4">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-[10px] md:text-xs font-medium text-white/80 uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4">
          <button className="flex items-center justify-center py-2.5 md:py-3 rounded-lg md:rounded-xl border border-white/30 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors text-xs md:text-sm font-semibold text-foreground touch-manipulation">
            <span className="mr-1.5 md:mr-2 text-base md:text-lg">G</span> Google
          </button>
          <button className="flex items-center justify-center py-2.5 md:py-3 rounded-lg md:rounded-xl border border-white/30 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors text-xs md:text-sm font-semibold text-foreground touch-manipulation">
            <span className="mr-1.5 md:mr-2 text-base md:text-lg">🍎</span> Apple
          </button>
        </div>
      </motion.div>
    </div>
  );
}