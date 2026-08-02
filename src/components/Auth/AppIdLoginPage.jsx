import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

export default function AppIdLoginPage({ role = 'student' }) {
  const isCompany = role === 'company';
  const loginUrl = `${API_BASE_URL}/auth/appid/login?role=${role}`;
  const otherPath = isCompany ? '/student' : '/company';
  const otherLabel = isCompany ? 'Student Portal' : 'Recruiter Portal';

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] glass p-8 rounded-xl flex flex-col gap-6 shadow-2xl shadow-black"
      >
        {/* Card Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            {isCompany ? <Building2 size={20} /> : <GraduationCap size={20} />}
          </div>
          <h2 className="text-xl font-bold text-ink">
            {isCompany ? 'Recruiter Login' : 'Student Login'}
          </h2>
          <p className="text-xs text-ink-subtle">
            {isCompany
              ? 'Sign in to publish vacancies and manage campus applications'
              : 'Sign in to explore placements, apply for jobs, and build your profile'}
          </p>
        </div>

        {/* IBM App ID sign-in callout */}
        <div className="bg-surface-2 border border-hairline rounded-lg p-3 text-[10px] text-ink-subtle leading-relaxed">
          <div className="font-semibold text-primary mb-1 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Secure enterprise sign-in
          </div>
          This portal authenticates through IBM App ID (Cloud Directory).
          You will be taken to the IBM Cloud login screen to verify your identity.
        </div>

        <a
          href={loginUrl}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-2.5 rounded-md transition-colors shadow-md shadow-primary/10 cursor-pointer"
        >
          <ExternalLink size={14} />
          <span>Login with IBM App ID</span>
        </a>

        <hr className="border-hairline" />

        <div className="flex flex-col gap-3 text-xs text-ink-subtle">
          <a href={otherPath} className="text-center hover:text-ink transition-colors">
            Switching roles? Go to the <span className="text-primary font-medium underline">{otherLabel}</span>
          </a>
          <a href="/admin" className="text-center hover:text-ink transition-colors flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-primary" />
            <span>
              Administrator? Use the <span className="text-primary font-medium underline">Admin Portal</span>
            </span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
