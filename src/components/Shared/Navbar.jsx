import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, MessageCircle, Briefcase, Award, Settings, Bell } from 'lucide-react';
import { getUser, clearSession, isAuthenticated } from '../../utils/auth.js';
import { api } from '../../utils/api.js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial check
    setUser(getUser());

    // Setup listener for auth state changes if page transitions don't fully reload
    const handleAuthChange = () => {
      setUser(getUser());
    };
    window.addEventListener('storage', handleAuthChange);

    // If logged in, fetch notifications count
    if (isAuthenticated()) {
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }

    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const fetchNotificationsCount = async () => {
    try {
      const data = await api.students.getNotifications();
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      // Fail silently
    }
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  const getDashboardLink = (role) => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'company') return '/company/dashboard';
    if (role === 'admin') return '/admin';
    return '/';
  };

  const renderNavLinks = () => {
    const defaultLinks = [
      { name: 'Home', href: '/' }
    ];

    if (!user) {
      return defaultLinks.map(link => (
        <a key={link.name} href={link.href} className="text-sm font-medium text-ink-subtle hover:text-ink transition-colors duration-150">
          {link.name}
        </a>
      ));
    }

    // Role specific links
    const roleLinks = [];
    if (user.role === 'student') {
      roleLinks.push(
        { name: 'Dashboard', href: '/student/dashboard', icon: Award },
        { name: 'Jobs Feed', href: '/student/dashboard?tab=jobs', icon: Briefcase },
        { name: 'Assistant Chatbot', href: '/student/dashboard?tab=chatbot', icon: MessageCircle }
      );
    } else if (user.role === 'company') {
      roleLinks.push(
        { name: 'Dashboard', href: '/company/dashboard', icon: Briefcase },
        { name: 'Post Job', href: '/company/dashboard?tab=post-job', icon: Settings }
      );
    } else if (user.role === 'admin') {
      roleLinks.push(
        { name: 'Dashboard', href: '/admin', icon: Settings }
      );
    }

    return [...defaultLinks, ...roleLinks].map(link => (
      <a key={link.name} href={link.href} className="flex items-center gap-1.5 text-sm font-medium text-ink-subtle hover:text-ink transition-colors duration-150">
        {link.icon && <link.icon size={15} className="text-primary" />}
        {link.name}
      </a>
    ));
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-canvas/80 backdrop-blur-md border-b border-hairline flex items-center justify-between px-6 md:px-12 select-none">
      {/* Wordmark Logo */}
      <a href="/" className="flex items-center gap-2 group">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-primary/20 group-hover:bg-primary-hover transition-colors">
          C
        </div>
        <span className="text-base font-bold text-ink tracking-tight bg-gradient-to-r from-ink via-ink to-primary bg-clip-text text-transparent group-hover:to-primary-hover transition-colors duration-300">
          CampusConnect
        </span>
      </a>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {renderNavLinks()}
      </div>

      {/* Desktop Auth Section */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {user.role === 'student' && (
              <a href="/student/dashboard?tab=notifications" className="relative p-1.5 rounded-md hover:bg-surface-1 border border-transparent hover:border-hairline transition-all">
                <Bell size={18} className="text-ink-subtle hover:text-ink" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success-green ring-2 ring-canvas" />
                )}
              </a>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-1 border border-hairline rounded-md text-xs font-mono text-ink-subtle">
              <User size={13} className="text-primary" />
              <span>{user.email.split('@')[0]}</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] uppercase font-sans tracking-wide">
                {user.role}
              </span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle hover:text-red-400 bg-surface-1 border border-hairline hover:border-red-950/50 hover:bg-red-950/10 px-3 py-1.5 rounded-md transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a 
              href="/login" 
              className="text-xs font-medium text-white bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary-focus/50 px-4 py-1.5 rounded-md transition-all shadow-md shadow-primary/10"
            >
              Sign in
            </a>
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden p-1.5 rounded-md bg-surface-1 border border-hairline hover:bg-surface-2 text-ink-subtle hover:text-ink transition-all cursor-pointer"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-14 left-0 w-full bg-canvas border-b border-hairline flex flex-col px-6 py-8 gap-6 md:hidden shadow-2xl shadow-black/80"
          >
            <div className="flex flex-col gap-4">
              {renderNavLinks()}
            </div>
            <hr className="border-hairline" />
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-1 border border-hairline rounded-md text-xs font-mono text-ink-subtle">
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-primary" />
                      {user.email}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] uppercase font-sans font-bold">
                      {user.role}
                    </span>
                  </div>
                  {user.role === 'student' && (
                    <a 
                      href="/student/dashboard?tab=notifications" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-sm text-ink-subtle hover:text-ink"
                    >
                      <Bell size={16} />
                      Notifications ({unreadCount} unread)
                    </a>
                  )}
                  <button 
                    onClick={() => { setIsOpen(false); handleLogout(); }} 
                    className="flex items-center justify-center gap-2 text-sm font-medium text-red-400 bg-red-950/10 border border-red-950/30 hover:bg-red-950/20 py-2 rounded-md transition-all cursor-pointer"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <a 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center text-sm font-medium text-white bg-primary hover:bg-primary-hover py-2 rounded-md transition-all"
                  >
                    Sign in
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
