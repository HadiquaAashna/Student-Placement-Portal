import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Phone, Globe, Building2, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api.js';
import { setSession, isAuthenticated, getRole } from '../../utils/auth.js';

export default function RegisterPage() {
  const [role, setRole] = useState('student'); // 'student' or 'company'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      const payload = {
        email,
        password,
        role,
        fullName,
        phone,
        companyName,
        website,
        industry,
        description
      };

      const data = await api.auth.register(payload);
      
      // Save credentials in session
      setSession(data.token, data.role, data.email, data.isApproved);
      
      // Redirect based on role
      window.location.href = `/${data.role}`;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[450px] glass p-8 rounded-xl flex flex-col gap-6 shadow-2xl shadow-black animate-slide-up"
      >
        {/* Card Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary mx-auto">
            C
          </div>
          <h2 className="text-xl font-bold text-ink">Create your account</h2>
          <p className="text-xs text-ink-subtle">Get started with CampusConnect placement cell</p>
        </div>

        {/* Tab Toggle between Student and Company */}
        <div className="grid grid-cols-2 p-1 bg-surface-2 border border-hairline rounded-lg">
          <button 
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${role === 'student' ? 'bg-surface-1 border border-hairline text-ink' : 'text-ink-subtle hover:text-ink'}`}
          >
            Student Account
          </button>
          <button 
            type="button"
            onClick={() => { setRole('company'); setError(''); }}
            className={`py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${role === 'company' ? 'bg-surface-1 border border-hairline text-ink' : 'text-ink-subtle hover:text-ink'}`}
          >
            Recruiter Account
          </button>
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
                placeholder={role === 'student' ? 'aarav@placement.edu' : 'hr@ibm.com'}
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

          {/* Student Fields */}
          {role === 'student' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                    placeholder="Aarav Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </>
          )}

          {/* Company Fields */}
          {role === 'company' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                    placeholder="IBM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                    <input 
                      type="url" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded pl-9 pr-3 py-2 text-sm text-ink transition-all"
                      placeholder="https://ibm.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Industry Segment</label>
                  <input 
                    type="text" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm text-ink transition-all"
                    placeholder="Cloud & AI Solutions"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-subtle mb-1.5">Company Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm text-ink resize-none transition-all"
                  placeholder="Provide a brief summary of your company's focus and core products..."
                />
              </div>

              <div className="bg-surface-2 border border-hairline p-3 rounded text-[10px] text-ink-subtle leading-relaxed">
                <span className="font-semibold text-primary">Note for Recruiters:</span> After signup, your profile enters the verification queue. Admin approval is required before you can post job openings.
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-2 rounded-md transition-colors disabled:bg-primary-hover/50 disabled:cursor-not-allowed cursor-pointer mt-2 shadow-md shadow-primary/10"
          >
            {loading ? <span>Creating account...</span> : (
              <>
                <span>Create Account</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <hr className="border-hairline" />

        <div className="text-center text-xs text-ink-subtle">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:text-primary-hover font-medium underline">
            Sign in
          </a>
        </div>
      </motion.div>
    </div>
  );
}
