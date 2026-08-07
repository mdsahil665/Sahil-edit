import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, KeyRound, ArrowRight, X, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from './Toast';
import { promptStore } from '../services/promptStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (isAdmin: boolean) => void;
  initialMode?: 'login' | 'register';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [usePasscodeMode, setUsePasscodeMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const formatFirebaseError = (err: any): string => {
    if (!err) return 'An error occurred during authentication.';
    const code = err?.code ? `[${err.code}] ` : '';
    const message = err?.message || String(err);
    if (err?.code === 'auth/unauthorized-domain') {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
      return `${code}${message} (Fix: Add "${currentDomain}" to Firebase Console > Authentication > Settings > Authorized domains)`;
    }
    return `${code}${message}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await loginWithEmail(email, password);
        const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || promptStore.isAdminLoggedIn();
        showToast(
          'Login Successful',
          isAdminUser ? 'Welcome back, Sahil! Opening Admin Dashboard...' : `Welcome back, ${user.displayName || user.email}!`
        );
        onLoginSuccess(isAdminUser);
      } else {
        const user = await registerWithEmail(email, password);
        const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || promptStore.isAdminLoggedIn();
        showToast('Account Created!', `Welcome to Sahil Edits, ${user.displayName || user.email}`);
        onLoginSuccess(isAdminUser);
      }
      onClose();
    } catch (err: any) {
      const msg = formatFirebaseError(err);
      setErrorMsg(msg);
      showToast('Authentication Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputPasscode = passcode.trim() || 'sahil2026';
    if (promptStore.verifyAdminPasscode(inputPasscode)) {
      promptStore.setAdminLoggedIn(true);
      showToast('✓ Admin Login Successful', 'Welcome back, Sahil!');
      onLoginSuccess(true);
      onClose();
    } else {
      setErrorMsg('Invalid admin passcode. Try "sahil2026".');
      showToast('Incorrect Passcode', 'Try "sahil2026" or your custom admin passcode', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || promptStore.isAdminLoggedIn();
        showToast(
          '✓ Google Sign-In Successful',
          isAdminUser ? 'Welcome Admin! Opening Dashboard...' : `Signed in as ${user.displayName || user.email}`
        );
        onLoginSuccess(isAdminUser);
        onClose();
      }
    } catch (err: any) {
      console.error('Google Sign-In Error Code:', err?.code, 'Message:', err?.message, err);
      const msg = formatFirebaseError(err);
      setErrorMsg(msg);
      showToast('Google Sign-In Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 space-y-6"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  {usePasscodeMode ? 'Admin Passcode' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {usePasscodeMode ? 'Enter master passcode to unlock' : 'Firebase Authentication Engine'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!usePasscodeMode && (
            /* Mode Switcher Tabs */
            <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {!usePasscodeMode ? (
            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase absolute">
                  OR EMAIL & PASSWORD
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={mode === 'login' ? 'e.g., mdsahil012002@gmail.com' : 'your@email.com'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Firebase Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUsePasscodeMode(true)}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 underline transition-colors"
                >
                  Admin Passcode Option
                </button>
              </div>
            </div>
          ) : (
            /* Passcode Form */
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>Admin Credentials</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-[10px] font-mono">SAHIL EDITS</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  <strong>Admin Email:</strong> <code className="text-blue-500 font-mono">mdsahil012002@gmail.com</code>
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  <strong>Admin Passcode:</strong> <code className="text-blue-500 font-mono">sahil2026</code>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Master Admin Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUsePasscodeMode(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Firebase Auth
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Unlock Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
