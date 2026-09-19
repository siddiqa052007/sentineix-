import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  UserPlus, 
  AlertTriangle,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToLanding }) => {
  const { login, register } = useAuth();

  // Default to Login Mode
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Security Analyst');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');

  // Status & error banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login flow state
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'initializing'>('idle');
  const [initStep, setInitStep] = useState(0);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Auto-detect effect removed so email field is never auto-filled on load
  useEffect(() => {
    // Keep email empty by default
    setEmail('');
  }, []);

  // Validation helpers
  const isValidEmail = (e: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.trim());
  const activePassword = mode === 'login' ? password : regPassword;
  const hasMinLength = activePassword.length >= 8;
  const hasNumber = /\d/.test(activePassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(activePassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authState !== 'idle') return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const currentEmail = mode === 'login' ? email : regEmail;
    const cleanEmail = currentEmail.trim().toLowerCase();
    const currentPassword = mode === 'login' ? password : regPassword;

    // Validate email format with TLD domain
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address with a proper domain extension (e.g., name@gmail.com).');
      return;
    }

    // Validate password complexity (8+ chars, 1 number, 1 special char in single error message)
    if (!currentPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (currentPassword.length < 8 || !/\d/.test(currentPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(currentPassword)) {
      setErrorMessage('Password must be at least 8 characters long, contain at least one number, and contain at least one special character.');
      return;
    }

    if (mode === 'login') {
      setAuthState('authenticating');

      const result = await login(cleanEmail, currentPassword);

      if (!result.success) {
        setAuthState('idle');
        setErrorMessage(result.message || 'This email is not registered.');
        return;
      }

      // Store registration/login state in local memory
      localStorage.setItem('sentinelx_registered', 'true');
      localStorage.setItem('sentinelx_last_email', cleanEmail);

      // Successful login -> trigger initialization screen
      setAuthState('initializing');
    } else {
      // Register Mode
      const cleanRegName = regName.trim();
      const cleanRegCompany = regCompany.trim();
      const cleanRegEmployeeId = regEmployeeId.trim();

      if (!cleanRegName || !cleanRegCompany || !cleanRegEmployeeId) {
        setErrorMessage('Please complete all required registration fields.');
        return;
      }

      setAuthState('authenticating');

      const result = await register({
        name: cleanRegName,
        email: cleanEmail,
        password: currentPassword,
        company: cleanRegCompany,
        employeeId: cleanRegEmployeeId,
        role: regRole,
        profilePicture: regAvatar
      });

      if (!result.success) {
        setAuthState('idle');
        const isExisting = result.status === 'Existing' || 
          result.message?.toLowerCase().includes('already exists') || 
          result.message?.toLowerCase().includes('registered') || 
          result.message?.toLowerCase().includes('exist');
          
        if (isExisting) {
          localStorage.setItem('sentinelx_registered', 'true');
          setEmail(cleanEmail);
          setRegEmail('');
          setPassword('');
          setRegPassword('');
          setMode('login');
          setErrorMessage('An account with this email address already exists. Please log in with your email and password.');
        } else {
          setErrorMessage(result.message);
        }
      } else {
        // Registration success -> store state & switch to sign in mode with auto-filled email
        localStorage.setItem('sentinelx_registered', 'true');

        // Reset auth state to idle, switch to sign in mode with auto-filled email and cleared password
        setAuthState('idle');
        setEmail(cleanEmail);
        setPassword('');
        setMode('login');
        setSuccessMessage('Registration successful! Your account is ready. Please enter your password to log in.');

        // Reset registration fields completely
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegCompany('');
        setRegEmployeeId('');
      }
    }
  };

  // Trigger sequence for full-screen initialization loading screen
  useEffect(() => {
    if (authState === 'initializing') {
      const timer1 = setTimeout(() => setInitStep(1), 500);  // Step 1: Verifying Credentials
      const timer2 = setTimeout(() => setInitStep(2), 1100); // Step 2: Connecting Threat Intelligence
      const timer3 = setTimeout(() => setInitStep(3), 1700); // Step 3: Loading AI Engine
      const timer4 = setTimeout(() => setInitStep(4), 2300); // Step 4: Preparing Dashboard
      const timer5 = setTimeout(() => {
        onLoginSuccess();
      }, 2900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [authState, onLoginSuccess]);

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-x-hidden selection:bg-[#00D4FF] selection:text-slate-950 font-sans">
      
      {/* Dynamic Cyber Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:48px_48px] opacity-15 pointer-events-none z-0" />
      
      {/* Background Radial Glow Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* MAIN CONTAINER (SIDE-BY-SIDE ON DESKTOP/FULLSCREEN, STACKED ON MOBILE) */}
      <div className="w-full max-w-xl lg:max-w-6xl xl:max-w-7xl relative z-10 flex flex-col my-auto space-y-6 lg:space-y-8 py-4">
        
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-600/20 border border-[#00D4FF]/40 shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:border-[#00D4FF] transition-all">
              <Shield className="w-5 h-5 text-[#00D4FF]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                SENTINEL<span className="text-[#00D4FF]">X</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">AI Intrusion Detection System</p>
            </div>
          </div>
        </div>

        {/* SIDE-BY-SIDE GRID WRAPPER FOR FULLSCREEN & DESKTOP VIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: Animated Cyber Shield Graphic Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center pt-2"
          >
            {/* Animated Orbital Shield Graphic */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              
              {/* Outer Rotating Dotted Orbit */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-[#00D4FF]/25 shadow-[0_0_35px_rgba(0,212,255,0.08)]"
              />
              
              {/* Inner Rotating Ring */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-5 rounded-full border border-cyan-500/30 border-t-[#00D4FF] border-b-purple-500 shadow-[0_0_25px_rgba(0,212,255,0.15)]"
              />

              {/* Orbiting Badge 1: 0.78ms SLA */}
              <motion.div 
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1 right-2 z-20 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/60 text-[10px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold">0.78ms SLA</span>
              </motion.div>

              {/* Orbiting Badge 2: eBPF KERNEL SHIELD: ACTIVE */}
              <motion.div 
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-6 -translate-y-1/2 z-20 px-3 py-1 rounded-full bg-slate-950/90 border border-emerald-500/60 text-[10px] font-mono text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">eBPF KERNEL SHIELD</span>
              </motion.div>

              {/* Orbiting Badge 3: XDP 100% Drops */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/90 border border-rose-500/60 text-[10px] font-mono text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="font-bold">XDP 100% Drops</span>
              </motion.div>

              {/* Orbiting Badge 4: Gemini 2.5 Flash */}
              <motion.div 
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1 left-2 z-20 px-3 py-1 rounded-full bg-slate-950/90 border border-purple-500/60 text-[10px] font-mono text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="font-bold">Gemini 2.5 Flash</span>
              </motion.div>

              {/* Central Shield Container */}
              <div className="absolute inset-10 rounded-3xl bg-slate-950/80 border border-[#00D4FF]/50 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_60px_rgba(0,212,255,0.25)] group">
                <motion.div 
                  animate={{ y: [-5, 5, -5], scale: [1, 1.03, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex flex-col items-center justify-center text-center p-3"
                >
                  <div className="relative">
                    <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-[#00D4FF] drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]" />
                    <div className="absolute inset-0 bg-[#00D4FF]/20 rounded-full blur-xl animate-pulse" />
                  </div>

                  <div className="mt-3 px-3 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PROTECTED BY SENTINELX</span>
                  </div>
                </motion.div>
              </div>

            </div>

            <div className="mt-6 text-center max-w-md space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Protecting Enterprise Networks with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-cyan-300 to-blue-400">AI Intelligence</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Real-time eBPF kernel packet filtering paired with Gemini AI threat synthesis.
              </p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Registration & Sign In Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 bg-slate-950/85 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.7)] hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-80" />

            {/* Mode Title */}
            <div className="mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {mode === 'register' ? 'Register Account' : 'Login'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'register' 
                  ? 'Complete your registration details below to create an account.' 
                  : 'Welcome back! Enter your email and password to log in.'}
              </p>
            </div>

            {/* Banners */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-sans space-y-1 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              >
                <div className="font-extrabold text-rose-300 font-mono flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>NOTICE</span>
                </div>
                <p className="text-rose-200 leading-relaxed pt-0.5">
                  {errorMessage}
                </p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-sans space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <div className="font-extrabold text-emerald-300 font-mono flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>REGISTRATION SUCCESSFUL</span>
                </div>
                <p className="text-emerald-200 leading-relaxed pt-0.5">
                  {successMessage}
                </p>
              </motion.div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-slate-300">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                    />
                  </div>

                  {/* Company & Employee ID Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-slate-300">COMPANY / ORG *</label>
                      <input
                        type="text"
                        required
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="e.g. CyberSec Inc."
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-slate-300">EMPLOYEE ID *</label>
                      <input
                        type="text"
                        required
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-2026"
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-slate-300">SYSTEM ACCESS ROLE *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="Security Analyst">Security Analyst</option>
                      <option value="Network Admin">Network Admin</option>
                      <option value="Incident Responder">Incident Responder</option>
                      <option value="Auditor">Auditor</option>
                      <option value="User">Standard User</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
                  <span>EMAIL ADDRESS *</span>
                  <span className="text-[10px] text-slate-500">e.g. name@gmail.com</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={mode === 'login' ? email : regEmail}
                  onChange={(e) => mode === 'login' ? setEmail(e.target.value) : setRegEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-medium text-slate-300">PASSWORD *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-mono text-[#00D4FF] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={mode === 'login' ? password : regPassword}
                    onChange={(e) => mode === 'login' ? setPassword(e.target.value) : setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none transition-all font-sans placeholder:text-slate-600"
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Show Password Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-[#00D4FF] focus:ring-[#00D4FF] accent-[#00D4FF] cursor-pointer"
                    />
                    <span>Show password</span>
                  </label>
                </div>

                {/* Real-time Password Requirements Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded-md border transition-all ${
                    hasMinLength 
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}>
                    {hasMinLength ? '✓ 8+ chars' : '• 8+ chars'}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md border transition-all ${
                    hasNumber 
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}>
                    {hasNumber ? '✓ 1+ number' : '• 1+ number'}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md border transition-all ${
                    hasSpecialChar 
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}>
                    {hasSpecialChar ? '✓ 1+ special char (!@#$)' : '• 1+ special char (!@#$)'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authState !== 'idle'}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold font-mono transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,212,255,0.25)] ${
                  authState === 'authenticating'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 cursor-wait'
                    : 'bg-gradient-to-r from-[#00D4FF] via-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 hover:shadow-[0_0_35px_rgba(0,212,255,0.4)] active:scale-[0.99]'
                }`}
              >
                {authState === 'authenticating' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : mode === 'register' ? (
                  <>
                    <span>Submit Registration</span>
                    <UserPlus className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs font-mono text-slate-400">
              {mode === 'login' ? (
                <span>If not registered? <button type="button" onClick={() => { setMode('register'); setEmail(''); setRegEmail(''); setPassword(''); setRegPassword(''); setErrorMessage(null); setSuccessMessage(null); }} className="text-[#00D4FF] hover:underline font-bold cursor-pointer">Register</button></span>
              ) : (
                <span>Already registered? <button type="button" onClick={() => { setMode('login'); setEmail(''); setRegEmail(''); setPassword(''); setRegPassword(''); setErrorMessage(null); setSuccessMessage(null); }} className="text-[#00D4FF] hover:underline font-bold cursor-pointer">Login</button></span>
              )}
            </div>
          </div>
        </motion.div>

        </div> {/* Close Grid wrapper */}

        {/* Footer */}
        <div className="text-xs text-slate-500 font-mono text-center pt-2">
          © 2026 SentinelX Inc. Enterprise Intrusion Detection System
        </div>

      </div>

      {/* Full-Screen Security Engine Loading Screen */}
      <AnimatePresence>
        {authState === 'initializing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070b14] flex flex-col items-center justify-center p-6 text-center font-mono selection:bg-[#00D4FF]"
          >
            <div className="absolute inset-0 bg-cyber-grid bg-[size:40px_40px] opacity-20 pointer-events-none" />
            <div className="absolute w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-md w-full glass-card p-8 rounded-3xl border border-[#00D4FF]/40 bg-slate-950/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,212,255,0.25)] space-y-6">
              
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#00D4FF]"
                />
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-600/30 border border-[#00D4FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.4)]">
                  <Shield className="w-7 h-7 text-[#00D4FF]" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white tracking-wide">
                  Initializing SOC Dashboard
                </h3>
                <p className="text-xs text-slate-400 mt-1">Authenticating User Identity & Dashboard Details</p>
              </div>

              <div className="space-y-3 text-left bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
                
                <div className={`flex items-center justify-between transition-colors ${initStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                  <span className="flex items-center gap-2">
                    {initStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    <span>Validated Account Credentials</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono">{initStep >= 1 ? 'OK' : 'WAIT'}</span>
                </div>

                <div className={`flex items-center justify-between transition-colors ${initStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                  <span className="flex items-center gap-2">
                    {initStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    <span>Loaded User Profile & Role Permissions</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono">{initStep >= 2 ? 'OK' : 'WAIT'}</span>
                </div>

                <div className={`flex items-center justify-between transition-colors ${initStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                  <span className="flex items-center gap-2">
                    {initStep >= 3 ? <Sparkles className="w-4 h-4 text-purple-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    <span>Connecting Gemini AI Copilot</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono">{initStep >= 3 ? 'OK' : 'WAIT'}</span>
                </div>

                <div className={`flex items-center justify-between transition-colors ${initStep >= 4 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                  <span className="flex items-center gap-2">
                    {initStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    <span>Opening Personalized Dashboard</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono">{initStep >= 4 ? 'READY' : 'WAIT'}</span>
                </div>

              </div>

              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-[#00D4FF] via-cyan-400 to-emerald-400 h-full rounded-full shadow-[0_0_12px_#00D4FF]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(initStep / 4) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 font-mono text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-[#00D4FF]" />
                Password Reset Protocol
              </span>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <div className="font-bold">Reset Link Sent</div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Instructions have been sent to your registered corporate email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-slate-400 font-sans">
                  Enter your registered corporate email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-sans"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00D4FF] text-slate-950 font-bold hover:bg-cyan-300 cursor-pointer"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
