import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-canvas border-t border-hairline px-8 py-12 md:py-16 md:px-12 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center font-bold text-xs text-white">
              C
            </div>
            <span className="text-sm font-bold text-ink tracking-tight">
              CampusConnect
            </span>
          </div>
          <p className="text-xs text-ink-subtle leading-relaxed max-w-[240px]">
            A premium full-stack university placement engine bridging top-tier candidates and enterprise recruiters.
          </p>
        </div>

        {/* Resources Link Grid */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Resources</h4>
          <ul className="flex flex-col gap-2">
            <li><a href="/login" className="text-xs text-ink-subtle hover:text-ink transition-colors">Jobs Feed</a></li>
            <li><a href="/#statistics" className="text-xs text-ink-subtle hover:text-ink transition-colors">Placement Analytics</a></li>
            <li><a href="/#faq" className="text-xs text-ink-subtle hover:text-ink transition-colors">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Support</h4>
          <ul className="flex flex-col gap-2">
            <li><span className="text-xs text-ink-subtle">Office: Placement Cell, Block 3</span></li>
            <li><a href="mailto:admin@campusconnect.edu" className="text-xs text-ink-subtle hover:text-ink transition-colors">admin@campusconnect.edu</a></li>
            <li><span className="text-xs text-ink-subtle">Phone: +91 80 4911-3000</span></li>
          </ul>
        </div>

        {/* Social / Info Column */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li><span className="text-xs text-ink-subtle hover:text-ink cursor-pointer transition-colors">Terms of Service</span></li>
            <li><span className="text-xs text-ink-subtle hover:text-ink cursor-pointer transition-colors">Privacy Policy</span></li>
            <li><span className="text-xs text-ink-subtle hover:text-ink cursor-pointer transition-colors">University Guidelines</span></li>
          </ul>
        </div>

      </div>

      <hr className="border-hairline max-w-7xl mx-auto my-8" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-ink-tertiary">
        <span>&copy; {currentYear} CampusConnect. All rights reserved.</span>
        <span>Designed in alignment with Linear software documentation craft system.</span>
      </div>
    </footer>
  );
}
