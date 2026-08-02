import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

const portals = [
  {
    key: 'student',
    name: 'Student Portal',
    desc: 'Browse placements, apply for jobs, and manage your professional profile.',
    href: '/student',
    icon: GraduationCap,
    accent: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20'
  },
  {
    key: 'company',
    name: 'Recruiter Portal',
    desc: 'Post vacancies, filter candidates, and shortlist top campus talent.',
    href: '/company',
    icon: Building2,
    accent: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20'
  },
  {
    key: 'admin',
    name: 'Admin Portal',
    desc: 'Placement cell control desk. Local database sign-in.',
    href: '/admin',
    icon: ShieldCheck,
    accent: 'from-primary/20 to-primary/5 text-primary border-primary/20'
  }
];

export default function PortalChooser() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl flex flex-col gap-6"
      >
        <div className="text-center flex flex-col gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary mx-auto">
            C
          </div>
          <h2 className="text-xl font-bold text-ink">Sign in to CampusConnect</h2>
          <p className="text-xs text-ink-subtle">Choose the portal that matches your role</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portals.map((portal, i) => (
            <motion.a
              key={portal.key}
              href={portal.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group glass rounded-xl border border-hairline hover:border-hairline-strong p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center border ${portal.accent}`}>
                <portal.icon size={19} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-ink">{portal.name}</h3>
                <p className="text-[11px] text-ink-subtle leading-relaxed">{portal.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 transition-all">
                Sign in <ArrowRight size={12} />
              </span>
            </motion.a>
          ))}
        </div>

        <p className="text-center text-[11px] text-ink-tertiary">
          Student and Recruiter portals use IBM App ID single sign-on. Admin portal uses the placement cell database.
        </p>
      </motion.div>
    </div>
  );
}
