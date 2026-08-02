import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api.js';
import { setSession, isAuthenticated, getRole } from '../../utils/auth.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      const role = getRole();
      window.location.href = `/${role}`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.login({ email, password });
      
      // Save credentials in session
      setSession(data.token, data.role, data.email, data.isApproved);
      
      // Redirect based on role (admins use the separate admin portal)
      window.location.href = data.role === 'admin' ? '/admin' : `/${data.role}`;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] glass p-8 rounded-xl flex flex-col gap-6 shadow-2xl shadow-black"
      >
        {/* Card Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary mx-auto">
            C
          </div>
          <h2 className="text-xl font-bold text-ink">Sign in to CampusConnect</h2>
          <p className="text-xs text-ink-subtle">Enter your credentials to access your dashboard</p>
        </div>

        {/* Demo credentials callout */}
        <div className="bg-surface-2 border border-hairline rounded-lg p-3 text-[10px] text-ink-subtle leading-relaxed">
          <div className="font-semibold text-primary mb-1">Demo Credentials:</div>
          <div className="grid grid-cols-2 gap-x-2">
            <span>• Student: student1@placement.edu</span>
            <span>(password123)</span>
            <span>• Company: hr@ibm.com</span>
            <span>(password123)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-hairline">
            Administrators sign in at the{' '}
            <a href="/admin" className="text-primary hover:underline font-semibold">Admin Portal</a>.
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-950/50 rounded-lg text-xs text-red-400">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                placeholder="aarav@placement.edu"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-ink-subtle">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-2 rounded-md transition-colors disabled:bg-primary-hover/50 disabled:cursor-not-allowed cursor-pointer mt-2 shadow-md shadow-primary/10"
          >
            {loading ? <span>Signing in...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>



        <div className="text-center text-[10px] text-ink-tertiary">
          <a href="/admin" className="hover:text-primary transition-colors">
            Administrator? Go to Admin Portal
          </a>
        </div>
      </motion.div>
    </div>
  );
}
