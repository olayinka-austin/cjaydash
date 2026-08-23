import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  UserPlus, 
  LogIn,
  Sparkles,
  Database
} from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot_password';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInDemo, resetPassword } = useAuth();
  
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (view === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (view === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (view === 'login') {
        await signIn(email.trim(), password);
      } else if (view === 'signup') {
        await signUp(email.trim(), password);
        setSuccessMessage('Account created successfully! Security session activated.');
      } else if (view === 'forgot_password') {
        await resetPassword(email.trim());
        setSuccessMessage('Password reset link sent! Check your inbox.');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let userFriendlyError = 'An error occurred during authentication.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        userFriendlyError = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        userFriendlyError = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyError = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        userFriendlyError = 'Password is too weak. Please choose a stronger password.';
      } else if (err.message) {
        userFriendlyError = err.message;
      }
      setError(userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsSubmitting(true);
    try {
      await signInDemo(email.trim() || undefined);
    } catch (err) {
      console.error('Demo sign in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center p-4 sm:p-6 text-[#1a1c1c] select-none">
      <div className="w-full max-w-md bg-[#ffffff] border border-[#e3e2e1] rounded shadow-sm overflow-hidden">
        
        {/* Terminal Header Branding */}
        <div className="p-6 border-b border-[#e3e2e1] bg-[#faf9f8]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#1a1c1c] text-[#faf9f8] flex items-center justify-center font-bold text-base tracking-tighter">
              II
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-[#1a1c1c]">Investment Intelligence</h1>
              <p className="text-[11px] font-medium tracking-wider uppercase text-[#747878]">Secure Wealth Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#1b6b51] bg-[#1b6b51]/10 px-2 py-0.5 rounded border border-[#1b6b51]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit TLS</span>
          </div>
        </div>

        {/* View Title & Instruction */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold tracking-tight text-[#1a1c1c]">
            {view === 'login' && 'Sign in to Terminal'}
            {view === 'signup' && 'Create Terminal Account'}
            {view === 'forgot_password' && 'Reset Security Credentials'}
          </h2>
          <p className="text-xs text-[#747878] mt-1">
            {view === 'login' && 'Enter your verified credentials to access your synchronized investment ledger.'}
            {view === 'signup' && 'Set up your authenticated portfolio repository and persistent cloud storage.'}
            {view === 'forgot_password' && 'Enter your registered email address to receive secure reset instructions.'}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded text-xs text-[#ba1a1a] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#1b6b51]/10 border border-[#1b6b51]/20 rounded text-xs text-[#1b6b51] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#747878] uppercase flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1a1c1c]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="austinolayinka667@gmail.com"
              className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c] transition-colors"
            />
          </div>

          {view !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[#747878] uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1a1c1c]" />
                  <span>Password</span>
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot_password'); setError(null); setSuccessMessage(null); }}
                    className="text-[11px] text-[#747878] hover:text-[#1a1c1c] underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c] transition-colors"
              />
            </div>
          )}

          {view === 'signup' && (
            <div>
              <label className="text-[11px] font-semibold text-[#747878] uppercase flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1a1c1c]" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#faf9f8] border border-[#e3e2e1] rounded px-3 py-2 text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#1a1c1c] transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1a1c1c] hover:bg-[#2f3130] disabled:bg-[#747878] text-[#faf9f8] py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : (
              <>
                {view === 'login' && <LogIn className="w-3.5 h-3.5" />}
                {view === 'signup' && <UserPlus className="w-3.5 h-3.5" />}
                {view === 'forgot_password' && <KeyRound className="w-3.5 h-3.5" />}
                <span>
                  {view === 'login' && 'Authenticate & Enter'}
                  {view === 'signup' && 'Register Account'}
                  {view === 'forgot_password' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Mode */}
        <div className="px-6 pb-4">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#e3e2e1]"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-[#747878] tracking-wider">
              Or Quick Start
            </span>
            <div className="flex-grow border-t border-[#e3e2e1]"></div>
          </div>

          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isSubmitting}
            className="w-full bg-[#faf9f8] hover:bg-[#f4f3f2] border border-[#e3e2e1] text-[#1a1c1c] py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Instant Terminal Demo Access</span>
          </button>
        </div>

        {/* View Switchers */}
        <div className="px-6 py-4 bg-[#faf9f8] border-t border-[#e3e2e1] flex items-center justify-between text-xs text-[#747878]">
          {view === 'login' && (
            <>
              <span>New to Investment Intelligence?</span>
              <button
                type="button"
                onClick={() => { setView('signup'); setError(null); setSuccessMessage(null); }}
                className="font-semibold text-[#1a1c1c] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </>
          )}

          {view === 'signup' && (
            <>
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccessMessage(null); }}
                className="font-semibold text-[#1a1c1c] hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </>
          )}

          {view === 'forgot_password' && (
            <>
              <span>Remembered your password?</span>
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccessMessage(null); }}
                className="font-semibold text-[#1a1c1c] hover:underline cursor-pointer"
              >
                Back to Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
