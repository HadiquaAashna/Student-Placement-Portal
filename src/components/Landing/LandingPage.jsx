import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, ShieldCheck, Zap, Sparkles, LineChart, 
  HelpCircle, ChevronDown, Send, ArrowRight, Star 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full bg-canvas overflow-hidden">
      <HeroSection />
      <RecruitersMarquee />
      <FeaturesSection />
      <StatisticsSection />
      <FaqSection />
      <ContactSection />
    </div>
  );
}

// 1. Aceternity UI style Hero Section with Mock Dashboard Preview
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center z-10">
      {/* Background soft lavender glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Eyebrow badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-1.5 px-3 py-1 bg-surface-1 border border-hairline rounded-full text-xs font-medium text-ink-subtle mb-6 tracking-wide"
      >
        <Sparkles size={12} className="text-primary" />
        <span>University Placement Cycle 2026 is Live</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-4xl text-4xl md:text-7xl font-bold tracking-tight text-ink leading-[1.1] mb-6 text-glow"
      >
        Where Student Talent <br />
        <span className="bg-gradient-to-r from-primary via-primary-hover to-white bg-clip-text text-transparent">
          Connects with Enterprise
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-2xl text-base md:text-lg text-ink-muted mb-10 leading-relaxed font-sans"
      >
        CampusConnect streamlines college recruitment. Upload your profile, track applications in real-time, and get guidance from our AI Placement Assistant.
      </motion.p>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <a 
          href="/student" 
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover px-6 py-3 rounded-md transition-all duration-150 shadow-lg shadow-primary/20 cursor-pointer"
        >
          <span>Student Portal</span>
          <ArrowRight size={15} />
        </a>
        <a 
          href="/company" 
          className="w-full sm:w-auto text-sm font-medium text-ink bg-surface-1 border border-hairline hover:bg-surface-2 hover:border-hairline-strong px-6 py-3 rounded-md transition-all duration-150 cursor-pointer"
        >
          Recruiter Portal
        </a>
      </motion.div>

      {/* Product Dashboard Preview (Canonical Linear Screenshot style) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-5xl bg-surface-1 border border-hairline rounded-xl p-4 shadow-2xl shadow-black"
      >
        <div className="w-full rounded-lg bg-canvas border border-hairline overflow-hidden select-none">
          {/* Mock Dashboard Top Chrome Header */}
          <div className="w-full h-9 bg-surface-2 border-b border-hairline flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="text-[10px] font-mono text-ink-tertiary">campusconnect.edu/student/dashboard</div>
            <div className="w-4 h-4" />
          </div>
          
          {/* Mock Dashboard Layout */}
          <div className="w-full p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface-1/40">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col gap-4 border-r border-hairline pr-6">
              <div className="flex items-center gap-2 px-2 py-1 bg-surface-2/60 border border-hairline rounded text-[11px] font-mono text-ink-subtle">
                <div className="w-2 h-2 rounded-full bg-success-green" />
                Aarav Sharma (7.92 CGPA)
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold">Menu</div>
                <div className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-1.5 rounded">Dashboard</div>
                <div className="text-[11px] font-medium text-ink-subtle px-2 py-1 hover:text-ink">Jobs Listings</div>
                <div className="text-[11px] font-medium text-ink-subtle px-2 py-1 hover:text-ink">My Applications</div>
                <div className="text-[11px] font-medium text-ink-subtle px-2 py-1 hover:text-ink">Saved Openings</div>
              </div>
            </div>

            {/* Main Stats Frame */}
            <div className="md:col-span-3 flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-2/40 border border-hairline rounded-lg p-4">
                  <div className="text-[10px] text-ink-subtle uppercase">Applied Positions</div>
                  <div className="text-xl font-bold text-ink mt-1">12</div>
                  <div className="text-[9px] text-success-green mt-1">4 Active Shortlists</div>
                </div>
                <div className="bg-surface-2/40 border border-hairline rounded-lg p-4">
                  <div className="text-[10px] text-ink-subtle uppercase">Average CTC</div>
                  <div className="text-xl font-bold text-ink mt-1">₹8.5 LPA</div>
                  <div className="text-[9px] text-ink-tertiary mt-1">For CSE Graduates</div>
                </div>
                <div className="bg-surface-2/40 border border-hairline rounded-lg p-4">
                  <div className="text-[10px] text-ink-subtle uppercase">Shortlist Rate</div>
                  <div className="text-xl font-bold text-ink mt-1">82%</div>
                  <div className="text-[9px] text-success-green mt-1">Profile Strength: High</div>
                </div>
              </div>

              {/* Mock Job Applications List */}
              <div className="bg-surface-2/30 border border-hairline rounded-lg p-4">
                <div className="text-[11px] font-semibold text-ink mb-3">Recent Application Status</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 bg-surface-2/60 border border-hairline rounded text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center font-bold text-[10px] text-primary">IBM</span>
                      <div>
                        <div className="font-semibold text-ink">Software Developer Intern</div>
                        <div className="text-[9px] text-ink-tertiary">Applied 3 days ago</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 font-mono text-[9px] uppercase">Shortlisted</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-2/60 border border-hairline rounded text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center font-bold text-[10px] text-yellow-500">TCS</span>
                      <div>
                        <div className="font-semibold text-ink">System Architect Associate</div>
                        <div className="text-[9px] text-ink-tertiary">Applied 1 week ago</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-success-green/20 text-success-green font-mono text-[9px] uppercase">Accepted Offer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// 2. Infinite Recruiting Companies Marquee
function RecruitersMarquee() {
  const companies = ['IBM', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Capgemini'];
  
  return (
    <section className="w-full bg-surface-1 border-y border-hairline py-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 mb-3">
        <h3 className="text-center text-[10px] uppercase tracking-widest font-bold text-ink-tertiary">
          Trusted by Top Global Recruitment Partners
        </h3>
      </div>
      
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Gradients to mask sides */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee gap-8">
          {[...companies, ...companies].map((name, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 px-8 py-3 bg-canvas border border-hairline rounded-lg text-ink font-mono font-bold text-sm tracking-wide shadow-sm"
            >
              <div className="w-3.5 h-3.5 bg-primary rounded-sm flex items-center justify-center text-[8px] text-white">★</div>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. Card-based Features Grid
function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "No more black-box waiting. Instantly see when recruiter teams view, shortlist, or update your application."
    },
    {
      icon: ShieldCheck,
      title: "Vetted Companies Only",
      description: "Our Placement Cell approves registrations. Every job listing is legitimate, verified, and active."
    },
    {
      icon: Briefcase,
      title: "One-Click Application",
      description: "Upload your photo and resume once. Apply to multiple job posts instantly with customized cover letters."
    },
    {
      icon: Sparkles,
      title: "AI Chatbot Assistant",
      description: "Get immediate replies to recruitment timelines, resume criteria, placement records, and FAQ guidance."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">Platform Core</span>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-ink mt-2">
          Engineered for Modern College Placements
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="glass glass-lift p-6 rounded-lg flex flex-col gap-4">
            <div className="w-10 h-10 rounded-md bg-surface-2 border border-hairline-strong flex items-center justify-center text-primary">
              <feat.icon size={20} />
            </div>
            <h3 className="text-base font-semibold text-ink">{feat.title}</h3>
            <p className="text-xs text-ink-subtle leading-relaxed">{feat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// 4. Statistics Section
function StatisticsSection() {
  const stats = [
    { value: "₹32 LPA", label: "Highest CTC Offered" },
    { value: "₹8.5 LPA", label: "Average CTC Package" },
    { value: "98.2%", label: "2025 Placement Rate" },
    { value: "10+", label: "Fortune 500 Recruiters" }
  ];

  return (
    <section id="statistics" className="py-20 bg-surface-1/40 border-y border-hairline px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-ink font-mono bg-gradient-to-b from-ink to-ink-muted bg-clip-text text-transparent">
              {stat.value}
            </span>
            <span className="text-xs text-ink-subtle font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// 5. Accordion FAQs Section
function FaqSection() {
  const faqs = [
    {
      q: "How do students get access to CampusConnect?",
      a: "All final-year students of the university are eligible. Register using your university email address. The Placement Cell automatically syncs and approves student registration records."
    },
    {
      q: "Can external companies recruit via CampusConnect?",
      a: "Yes. External companies register via the portal. Registrations enter a pending state and are reviewed by the Placement Cell Admin. Approved companies can post jobs immediately."
    },
    {
      q: "Where is my resume hosted?",
      a: "Your resume is stored securely. In production, we integrate with Cloudinary to handle PDF streams. If credentials are empty during development, files store locally on the server."
    },
    {
      q: "How does the AI Assistant Chatbot work?",
      a: "The chatbot provides instant responses to campus placements, eligibility criteria, average packages, and resume tips. It is built prepared for full IBM Watson Assistant integration."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (idx) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-surface-1 border border-hairline rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <ChevronDown 
                size={16} 
                className={`text-ink-subtle transform transition-transform duration-250 ${activeIndex === idx ? 'rotate-180 text-primary' : ''}`} 
              />
            </button>
            
            {activeIndex === idx && (
              <div className="p-5 border-t border-hairline bg-canvas/30 text-xs text-ink-subtle leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// 6. Contact Section with Glassmorphic Form
function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSent(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setSent(false);
      }, 3000);
    }
  };

  return (
    <section className="py-24 px-6 max-w-xl mx-auto relative">
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
          Contact Placement Cell
        </h2>
        <p className="text-xs text-ink-subtle mt-2">
          Recruiters, faculty members, and student coordinators can message us here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-xl flex flex-col gap-5">
        <div>
          <label className="block text-xs font-medium text-ink-subtle mb-1.5">Full Name</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm text-ink transition-all"
            placeholder="Aarav Sharma"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-subtle mb-1.5">Email Address</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm text-ink transition-all"
            placeholder="aarav@placement.edu"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-subtle mb-1.5">Your Message</label>
          <textarea 
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm text-ink resize-none transition-all"
            placeholder="Hello, I would like to query about recruitment timelines..."
          />
        </div>

        <button 
          type="submit" 
          disabled={sent}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover py-2.5 rounded-md transition-colors disabled:bg-success-green disabled:cursor-default cursor-pointer mt-2"
        >
          {sent ? (
            <span>Message Sent Successfully!</span>
          ) : (
            <>
              <span>Send Message</span>
              <Send size={14} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
