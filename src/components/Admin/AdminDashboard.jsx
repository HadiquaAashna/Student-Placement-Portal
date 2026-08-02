import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, Building, Briefcase, FileText, CheckCircle, 
  XCircle, ToggleLeft, ToggleRight, Trash2, Search, MapPin, 
  ExternalLink, Download, FileCode, Check, RefreshCw, BarChart2, Globe
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { isAuthenticated, getRole, clearSession } from '../../utils/auth.js';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, students, companies, jobs
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Search filters
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchJob, setSearchJob] = useState('');

  // Status indicators
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    if (getRole() !== 'admin') {
      clearSession();
      window.location.href = '/login';
      return;
    }
    fetchAdminData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setApiError('');
    try {
      // 1. Fetch Stats
      const metrics = await api.admin.getStats();
      setStats(metrics);

      // 2. Fetch Students
      const studs = await api.admin.getStudents();
      setStudents(studs);

      // 3. Fetch Companies
      const comps = await api.admin.getCompanies();
      setCompanies(comps);

      // 4. Fetch Jobs
      const jobList = await api.admin.getJobs();
      setJobs(jobList);

    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Failed to load administrator records.');
    } finally {
      setLoading(false);
    }
  };

  // Approve Company Registration
  const handleApproveCompany = async (companyId, decision) => {
    try {
      const res = await api.admin.approveCompany(companyId, decision);
      showToast(res.message);
      
      // Update local state
      setCompanies(prev => 
        prev.map(c => c._id === companyId ? { ...c, status: decision, user: { ...c.user, isApproved: decision === 'approved' } } : c)
      );

      // Refresh general metrics
      const metrics = await api.admin.getStats();
      setStats(metrics);
    } catch (err) {
      showToast('Failed to complete approval decision', 'error');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-surface-1 rounded w-1/4" />
        <div className="h-96 bg-surface-1 rounded" />
      </div>
    );
  }

  // Filter lists
  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.skills.some(skill => skill.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  const filteredCompanies = companies.filter(c => 
    c.companyName.toLowerCase().includes(searchCompany.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchCompany.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchJob.toLowerCase()) ||
    j.company?.companyName.toLowerCase().includes(searchJob.toLowerCase())
  );

  const pendingCompanies = companies.filter(c => c.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative select-none">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-50 px-5 py-3 rounded-lg border text-xs font-semibold flex items-center gap-2 shadow-2xl ${toast.type === 'success' ? 'bg-green-950/40 border-green-900/50 text-green-300' : 'bg-red-950/40 border-red-900/50 text-red-300'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-hairline pb-6 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Shield className="text-primary" size={20} />
            <span>Placement Cell Administrator Dashboard</span>
          </h1>
          <p className="text-xs text-ink-subtle mt-1 font-mono">Control Desk • Vercel style interface</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdminData}
            className="p-2 bg-surface-1 border border-hairline rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-950/50 rounded-lg text-xs text-red-400">
          {apiError}
        </div>
      )}

      {/* Tab Select Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 p-1 bg-surface-1 border border-hairline rounded-lg mb-8 gap-1">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart2 },
          { id: 'approvals', name: 'Approvals Queue', count: pendingCompanies.length, icon: CheckCircle },
          { id: 'students', name: 'Students Register', icon: Users },
          { id: 'companies', name: 'Companies Directory', icon: Building },
          { id: 'jobs', name: 'Placements Registry', icon: Briefcase }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded cursor-pointer transition-all ${activeTab === tab.id ? 'bg-canvas border border-hairline text-ink' : 'text-ink-subtle hover:text-ink hover:bg-canvas/30'}`}
          >
            <tab.icon size={14} />
            <span>{tab.name}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panels content */}
      <div className="min-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            
            {/* TAB 1: OVERVIEW METRICS & CHARTS */}
            {activeTab === 'overview' && stats && (
              <div className="flex flex-col gap-8">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Enrolled Students', value: stats.summary?.totalStudents, icon: Users },
                    { label: 'Corporate Recruiters', value: stats.summary?.totalCompanies, icon: Building },
                    { label: 'Active Placement Posts', value: stats.summary?.totalJobs, icon: Briefcase },
                    { label: 'Candidate Applications', value: stats.summary?.totalApplications, icon: FileText }
                  ].map((metric, i) => (
                    <div key={i} className="bg-surface-1 border border-hairline rounded-lg p-5 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-ink-subtle uppercase font-semibold">{metric.label}</span>
                        <div className="text-2xl font-bold text-ink mt-2 font-mono">{metric.value}</div>
                      </div>
                      <div className="p-2 bg-surface-2 rounded-md border border-hairline-strong text-primary shrink-0">
                        <metric.icon size={16} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Application breakdown charts (Vercel minimal progress bars) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Status Chart */}
                  <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                    <h3 className="text-xs font-bold text-ink mb-6 uppercase tracking-wider text-ink-subtle">Applications Funnel Stage</h3>
                    <div className="flex flex-col gap-4 text-xs">
                      {Object.entries(stats.applicationStatus || {}).map(([status, count]) => {
                        const total = stats.summary?.totalApplications || 1;
                        const percentage = ((count / total) * 100).toFixed(0);
                        
                        const progressColors = {
                          pending: 'bg-yellow-500',
                          reviewed: 'bg-blue-500',
                          shortlisted: 'bg-purple-500',
                          accepted: 'bg-green-500',
                          rejected: 'bg-red-500'
                        };

                        return (
                          <div key={status} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-ink-subtle">
                              <span className="capitalize font-mono">{status}</span>
                              <span className="font-semibold text-ink">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-surface-2 border border-hairline rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${progressColors[status] || 'bg-primary'}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Job Type breakdown Chart */}
                  <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                    <h3 className="text-xs font-bold text-ink mb-6 uppercase tracking-wider text-ink-subtle">Placements Vacancies Segment</h3>
                    <div className="flex flex-col gap-4 text-xs">
                      {Object.entries(stats.jobTypes || {}).map(([type, count]) => {
                        const total = stats.summary?.totalJobs || 1;
                        const percentage = ((count / total) * 100).toFixed(0);
                        
                        const progressColors = {
                          'full-time': 'bg-primary',
                          'part-time': 'bg-cyan-500',
                          'internship': 'bg-success-green'
                        };

                        return (
                          <div key={type} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-ink-subtle">
                              <span className="capitalize font-mono">{type}</span>
                              <span className="font-semibold text-ink">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-surface-2 border border-hairline rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${progressColors[type] || 'bg-primary'}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Application logs table */}
                <div className="bg-surface-1 border border-hairline rounded-lg p-6 overflow-x-auto">
                  <h3 className="text-xs font-bold text-ink mb-4 uppercase tracking-wider text-ink-subtle">Recent Activity Log</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-ink-subtle font-mono">
                        <th className="pb-2.5">Candidate</th>
                        <th className="pb-2.5">Opening / Recruiter</th>
                        <th className="pb-2.5">Applied Date</th>
                        <th className="pb-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity?.map(act => (
                        <tr key={act._id} className="border-b border-hairline last:border-b-0 hover:bg-canvas/30">
                          <td className="py-3 font-semibold text-ink">{act.student?.fullName || 'Demo Student'}</td>
                          <td className="py-3 text-ink-subtle">
                            {act.job?.title}
                          </td>
                          <td className="py-3 text-ink-tertiary font-mono">{new Date(act.appliedAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-0.5 rounded bg-surface-2 border border-hairline text-[9px] uppercase font-mono tracking-wider font-bold">
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: RECRUITER VERIFICATION QUEUE */}
            {activeTab === 'approvals' && (
              <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                <h2 className="text-sm font-semibold text-ink mb-6 flex items-center gap-1.5 border-b border-hairline pb-3">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Pending Recruiter Verification Queue</span>
                </h2>

                {pendingCompanies.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle size={32} className="text-success-green/20 mx-auto mb-2" />
                    <p className="text-xs text-ink-subtle">All recruiter applications are verified. Approvals queue is empty.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {pendingCompanies.map(comp => (
                      <div key={comp._id} className="border border-hairline p-4 rounded-lg bg-canvas flex flex-col md:flex-row justify-between gap-6 text-xs text-left">
                        <div className="flex-grow">
                          <h3 className="text-xs font-bold text-ink flex items-center gap-2">
                            <span>{comp.companyName}</span>
                            <span className="px-1.5 py-0.5 rounded bg-yellow-950/20 text-yellow-400 border border-yellow-900/30 text-[9px] uppercase font-mono">
                              Pending Review
                            </span>
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] text-ink-subtle mt-1 font-mono">
                            <span>Sector: {comp.industry}</span>
                            {comp.website && (
                              <a href={comp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary hover:underline">
                                <Globe size={11} />
                                <span>{comp.website.replace('https://', '')}</span>
                              </a>
                            )}
                          </div>
                          <p className="text-[10px] text-ink-subtle mt-3 max-w-xl leading-relaxed">
                            {comp.description}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                          <button 
                            onClick={() => handleApproveCompany(comp._id, 'approved')}
                            className="px-3.5 py-1.5 bg-green-950/20 border border-green-900/40 hover:bg-green-950/30 text-green-300 rounded font-semibold transition-colors cursor-pointer"
                          >
                            Approve Access
                          </button>
                          <button 
                            onClick={() => handleApproveCompany(comp._id, 'rejected')}
                            className="px-3.5 py-1.5 bg-red-950/20 border border-red-900/40 hover:bg-red-950/30 text-red-300 rounded font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STUDENTS DIRECTORY REGISTER */}
            {activeTab === 'students' && (
              <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-hairline pb-4 mb-6 gap-4">
                  <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Users size={16} className="text-primary" />
                    <span>Registered Student Directory</span>
                  </h2>
                  <div className="relative w-full max-w-[280px]">
                    <Search className="absolute left-3 top-2 text-ink-subtle" size={14} />
                    <input 
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Filter by name or skills..."
                      className="w-full bg-surface-2 border border-hairline focus:outline-none rounded pl-8 pr-3 py-1.5 text-[11px] text-ink"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-ink-subtle font-mono">
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Academic Score</th>
                        <th className="pb-3 text-right">Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(stud => (
                        <tr key={stud._id} className="border-b border-hairline last:border-b-0 hover:bg-canvas/30">
                          <td className="py-3 font-semibold text-ink">{stud.fullName}</td>
                          <td className="py-3 text-ink-subtle">{stud.user?.email || 'N/A'}</td>
                          <td className="py-3 text-ink-subtle font-mono">{stud.phone || 'N/A'}</td>
                          <td className="py-3 text-ink font-mono">{stud.cgpa ? `${stud.cgpa} CGPA` : '0.00'}</td>
                          <td className="py-3 text-right">
                            {stud.resumeUrl ? (
                              <a href={stud.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold">
                                <Download size={11} />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-ink-tertiary">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: COMPANIES REGISTER DIRECTORY */}
            {activeTab === 'companies' && (
              <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-hairline pb-4 mb-6 gap-4">
                  <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Building size={16} className="text-primary" />
                    <span>Hiring Corporate Directory</span>
                  </h2>
                  <div className="relative w-full max-w-[280px]">
                    <Search className="absolute left-3 top-2 text-ink-subtle" size={14} />
                    <input 
                      type="text"
                      value={searchCompany}
                      onChange={(e) => setSearchCompany(e.target.value)}
                      placeholder="Filter by name or industry..."
                      className="w-full bg-surface-2 border border-hairline focus:outline-none rounded pl-8 pr-3 py-1.5 text-[11px] text-ink"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-ink-subtle font-mono">
                        <th className="pb-3">Company Name</th>
                        <th className="pb-3">Industry Segment</th>
                        <th className="pb-3">Email Contact</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map(comp => (
                        <tr key={comp._id} className="border-b border-hairline last:border-b-0 hover:bg-canvas/30">
                          <td className="py-3 font-semibold text-ink">{comp.companyName}</td>
                          <td className="py-3 text-ink-subtle">{comp.industry}</td>
                          <td className="py-3 text-ink-subtle font-mono">{comp.user?.email || 'N/A'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${comp.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : comp.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                              {comp.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {comp.status === 'pending' ? (
                              <button 
                                onClick={() => handleApproveCompany(comp._id, 'approved')}
                                className="text-[10px] text-primary font-semibold hover:underline cursor-pointer"
                              >
                                Approve
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApproveCompany(comp._id, comp.status === 'approved' ? 'rejected' : 'approved')}
                                className="text-[10px] text-ink-subtle hover:text-ink font-semibold cursor-pointer"
                              >
                                Toggle Access
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: PLACEMENTS REGISTRY (ALL JOBS) */}
            {activeTab === 'jobs' && (
              <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-hairline pb-4 mb-6 gap-4">
                  <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Briefcase size={16} className="text-primary" />
                    <span>Job Postings System Registry</span>
                  </h2>
                  <div className="relative w-full max-w-[280px]">
                    <Search className="absolute left-3 top-2 text-ink-subtle" size={14} />
                    <input 
                      type="text"
                      value={searchJob}
                      onChange={(e) => setSearchJob(e.target.value)}
                      placeholder="Filter by job title or company..."
                      className="w-full bg-surface-2 border border-hairline focus:outline-none rounded pl-8 pr-3 py-1.5 text-[11px] text-ink"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-ink-subtle font-mono">
                        <th className="pb-3">Listing Title</th>
                        <th className="pb-3">Posted Recruiter</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map(job => (
                        <tr key={job._id} className="border-b border-hairline last:border-b-0 hover:bg-canvas/30">
                          <td className="py-3 font-semibold text-ink">{job.title}</td>
                          <td className="py-3 text-ink-subtle">{job.company?.companyName || 'N/A'}</td>
                          <td className="py-3 text-ink-subtle font-mono">{job.location}</td>
                          <td className="py-3 capitalize font-semibold text-primary">{job.type}</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${job.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
