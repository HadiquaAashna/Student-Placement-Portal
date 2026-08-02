import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, User } from 'lucide-react';
import { api } from '../../utils/api.js';
import { setSession } from '../../utils/auth.js';

export default function AdminLoginPage({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.login({ email, password });

      if (data.role !== 'admin') {
        setError('Access restricted. This portal is for administrators only.');
        setLoading(false);
        return;
      }

      setSession(data.token, data.role, data.email, data.isApproved);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-xl font-bold text-ink">Admin Portal</h2>
          <p className="text-xs text-ink-subtle">Restricted to placement cell administrators</p>
        </div>

        {/* Demo credentials callout */}
        <div className="bg-surface-2 border border-hairline rounded-lg p-3 text-[10px] text-ink-subtle leading-relaxed">
          <div className="font-semibold text-primary mb-1">Demo Admin:</div>
          <div>admin@placement.edu</div>
          <div className="mt-0.5">(admin123)</div>
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
                placeholder="admin@placement.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Password</label>
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
                <span>Sign In to Admin</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <hr className="border-hairline" />

        <div className="text-center text-xs text-ink-subtle">
          Not an administrator?{' '}
          <a href="/login" className="text-primary hover:text-primary-hover font-medium underline">
            User login
          </a>
        </div>
      </motion.div>
    </div>
  );
}
