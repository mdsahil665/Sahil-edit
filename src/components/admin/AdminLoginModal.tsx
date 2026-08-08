import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight, X, LogIn, Eye, EyeOff, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { promptStore } from '../../services/promptStore';
import { useToast } from '../Toast';
import { signInWithGoogle, sendAdminPasswordReset } from '../../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Forgot Passcode state
  const [isForgotPasscode, setIsForgotPasscode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptStore.verifyAdminPasscode(passcode.trim())) {
      setError(false);
      showToast('✓ Admin Login Successful', 'Welcome back!');
      onLoginSuccess();
    } else {
      setError(true);
      showToast('Incorrect Passcode', 'Please check your admin passcode and try again.', 'error');
    }
  };

  const handleForgotPasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Please enter your admin email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendAdminPasswordReset(forgotEmail);
      setForgotSuccess('Password reset link sent to your email.');
      showToast('Reset Link Sent', 'Password reset link sent to your email.');
    } catch (err: any) {
      setForgotError('Admin account not found.');
      showToast('Error', 'Admin account not found.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        promptStore.setAdminLoggedIn(true);
        showToast('✓ Firebase Auth Successful', `Signed in as ${user.displayName || user.email}`);
        onLoginSuccess();
      }
    } catch (err: any) {
      console.warn('Google Sign-In notice in Admin Modal:', err?.code || 'no-code', err?.message || err);
      const errStr = String(err?.message || err || '');
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        errStr.includes('closing') ||
        errStr.includes('hidden')
      ) {
        return;
      }
      const code = err?.code ? `[${err.code}] ` : '';
      const message = err?.message || String(err);
      showToast('Google Sign-In Error', `${code}${message}`, 'error');
    } finally {
      setLoadingGoogle(false);
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  {isForgotPasscode ? 'Forgot Passcode' : 'Admin Login'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {isForgotPasscode ? 'Recover admin account' : 'Authorized Admin & Firebase Auth'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isForgotPasscode ? (
            /* Forgot Passcode Recovery Form */
            <form onSubmit={handleForgotPasscodeSubmit} className="space-y-4">
              {forgotError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    placeholder="Enter registered admin email..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>{forgotLoading ? 'Verifying...' : 'Send Password Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasscode(false);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className="text-xs font-semibold text-zinc-400 hover:text-blue-500 underline transition-colors"
                >
                  Back to Admin Passcode
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Firebase Google Auth */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingGoogle}
                  className="w-full py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-3 transition-all"
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
                  <span>{loadingGoogle ? 'Connecting Firebase...' : 'Sign in with Google'}</span>
                </button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 absolute">OR PASSCODE</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Admin Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setError(false);
                      }}
                      placeholder="Enter admin passcode..."
                      className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none transition-all ${
                        error
                          ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
                      aria-label={showPasscode ? 'Hide password' : 'Show password'}
                      title={showPasscode ? 'Hide password' : 'Show password'}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-rose-500 mt-1.5 font-medium">
                      Invalid admin passcode.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Unlock Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasscode(true);
                      setError(false);
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-blue-500 underline transition-colors"
                  >
                    Forgot Passcode?
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

