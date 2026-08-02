import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Briefcase, MessageCircle, User, Bell, Bookmark, FileText, 
  Search, MapPin, Building, Calendar, DollarSign, Upload, Plus, Trash2, 
  Send, ShieldAlert, CheckCircle, Clock, X, ChevronRight, RefreshCw
} from 'lucide-react';
import { api, fileUrl } from '../../utils/api.js';
import { getUser, isAuthenticated, getRole, getEmail, applyAuthFromUrl } from '../../utils/auth.js';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, jobs, applications, saved, chatbot, notifications
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLoc, setFilterLoc] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Status flags
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your CampusConnect Placement Assistant. Ask me anything about job listings, average salary packages, or resume reviews. Try asking: "What jobs are open?"' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCgpa, setEditCgpa] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editEducation, setEditEducation] = useState([]);
  const [editProjects, setEditProjects] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [modalResumeFile, setModalResumeFile] = useState(null);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalChangingResume, setModalChangingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    applyAuthFromUrl();

    if (!isAuthenticated()) {
      window.location.href = '/student';
      return;
    }
    if (getRole() !== 'student') {
      window.location.href = getRole() === 'admin' ? '/admin' : '/company';
      return;
    }

    // Deep-link tab sync
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }

    fetchInitialData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setApiError('');
    try {
      // 1. Fetch Profile
      const authData = await api.auth.getProfile();
      const pData = authData.profile || {};
      setProfile(pData);
      
      // Populate edit fields
      setEditName(pData.fullName || '');
      setEditPhone(pData.phone || '');
      setEditCgpa(pData.cgpa || '');
      setEditSkills(pData.skills ? pData.skills.join(', ') : '');
      setEditEducation(pData.education || []);
      setEditProjects(pData.projects || []);

      // Pre-fill contact info for applications
      setContactEmail(getEmail() || '');
      setContactPhone(pData.phone || '');

      // 2. Fetch Jobs
      const allJobs = await api.jobs.getAll();
      setJobs(allJobs);

      // 3. Fetch Recommendations
      const recJobs = await api.students.getRecommendedJobs();
      setRecommended(recJobs);

      // 4. Fetch Saved Jobs
      const sJobs = await api.students.getSavedJobs();
      setSavedJobs(sJobs);

      // 5. Fetch Applications
      const apps = await api.applications.getStudentApplications();
      setApplications(apps);

      // 6. Fetch Notifications
      const notifs = await api.students.getNotifications();
      setNotifications(notifs);

    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Failed to fetch portal data.');
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setApiError('');
    try {
      const updated = await api.students.updateProfile({
        fullName: editName,
        phone: editPhone,
        cgpa: parseFloat(editCgpa),
        skills: editSkills,
        education: editEducation,
        projects: editProjects
      });
      setProfile(updated);
      showToast('Profile updated successfully');
    } catch (err) {
      setApiError(err.message || 'Failed to update profile');
      window.scrollTo(0, 0);
    }
  };

  // Files upload handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!photoFile && !resumeFile) return;
    setUploadProgress(true);
    try {
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      if (resumeFile) formData.append('resume', resumeFile);

      const response = await api.students.uploadFiles(formData);
      
      setProfile(prev => ({
        ...prev,
        photoUrl: response.photoUrl || prev.photoUrl,
        resumeUrl: response.resumeUrl || prev.resumeUrl
      }));
      
      setPhotoFile(null);
      setResumeFile(null);
      showToast('Files uploaded successfully');
    } catch (err) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  // Resume upload straight from the Apply modal
  const handleModalResumeUpload = async () => {
    if (!modalResumeFile) return;
    setModalUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', modalResumeFile);

      const response = await api.students.uploadFiles(formData);

      setProfile(prev => ({
        ...prev,
        resumeUrl: response.resumeUrl || prev.resumeUrl
      }));
      setModalResumeFile(null);
      showToast('Resume uploaded successfully');
    } catch (err) {
      showToast(err.message || 'Resume upload failed', 'error');
    } finally {
      setModalUploading(false);
    }
  };

  // Job apply handler
  const handleApplyJob = async () => {
    if (!selectedJob) return;
    if (submitting) return;
    setApiError('');
    setSubmitting(true);
    try {
      await api.applications.apply({
        jobId: selectedJob._id,
        coverLetter,
        contactEmail,
        contactPhone
      });
      
      showToast(`Successfully applied for ${selectedJob.title}`);
      setSelectedJob(null);
      setCoverLetter('');
      setModalResumeFile(null);
      setModalChangingResume(false);
      
      // Refresh applications list
      const apps = await api.applications.getStudentApplications();
      setApplications(apps);
    } catch (err) {
      showToast(err.message || 'Failed to apply.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.students.toggleSaveJob(jobId);
      showToast(res.message);
      
      // Refresh list
      const sJobs = await api.students.getSavedJobs();
      setSavedJobs(sJobs);
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  // Notification read handler
  const handleMarkRead = async (id) => {
    try {
      await api.students.markNotificationRead(id);
      
      // Update state local
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      // Fail silently
    }
  };

  // Chatbot submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const data = await api.chatbot.sendMessage(userMessage);
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am facing communication issues with the placement API. Please try again later.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-surface-1 rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-40 bg-surface-1 rounded-md" />
          <div className="md:col-span-3 h-80 bg-surface-1 rounded-md" />
        </div>
      </div>
    );
  }

  // Filtered jobs matching state
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesLoc = filterLoc === 'all' || job.location.toLowerCase().includes(filterLoc.toLowerCase());
    
    return matchesSearch && matchesType && matchesLoc;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative">
      {/* Toast popup */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-50 px-5 py-3 rounded-lg border text-xs font-semibold flex items-center gap-2 shadow-2xl ${toast.type === 'success' ? 'bg-green-950/40 border-green-900/50 text-green-300' : 'bg-red-950/40 border-red-900/50 text-red-300'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <ShieldAlert size={15} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-hairline pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back, {profile?.fullName}</h1>
          <p className="text-xs text-ink-subtle mt-1 font-mono">Student Account • CGPA: {profile?.cgpa || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInitialData} 
            className="p-2 bg-surface-1 border border-hairline rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-950/50 rounded-lg text-xs text-red-400 flex items-start gap-2 max-w-xl">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tab Navigation Sidebar */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-ink-tertiary tracking-wider px-2.5 mb-1">Navigation</div>
          {[
            { id: 'overview', name: 'Overview', icon: Award },
            { id: 'profile', name: 'Student Profile', icon: User },
            { id: 'jobs', name: 'Jobs Feed', icon: Briefcase },
            { id: 'applications', name: 'My Applications', icon: FileText },
            { id: 'saved', name: 'Saved Openings', icon: Bookmark },
            { id: 'chatbot', name: 'Placement Bot', icon: MessageCircle },
            { id: 'notifications', name: 'Notifications', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium cursor-pointer transition-all ${activeTab === tab.id ? 'bg-primary/10 border border-primary/20 text-primary' : 'text-ink-subtle hover:text-ink hover:bg-surface-1 border border-transparent'}`}
            >
              <span className="flex items-center gap-2">
                <tab.icon size={15} />
                <span>{tab.name}</span>
              </span>
              {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-success-green/20 text-success-green text-[9px] font-bold">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="lg:col-span-3 min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-8">
                  {/* Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-1 border border-hairline rounded-lg p-5">
                      <div className="text-[10px] text-ink-subtle uppercase">Applied Positions</div>
                      <div className="text-2xl font-bold text-ink mt-1.5">{applications.length}</div>
                      <div className="text-[10px] text-success-green mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{applications.filter(a => a.status === 'shortlisted').length} shortlisted</span>
                      </div>
                    </div>
                    <div className="bg-surface-1 border border-hairline rounded-lg p-5">
                      <div className="text-[10px] text-ink-subtle uppercase">Academic Score</div>
                      <div className="text-2xl font-bold text-ink mt-1.5">{profile?.cgpa ? `${profile.cgpa} CGPA` : 'N/A'}</div>
                      <div className="text-[10px] text-ink-tertiary mt-1">Scale: 10.0 Max</div>
                    </div>
                    <div className="bg-surface-1 border border-hairline rounded-lg p-5">
                      <div className="text-[10px] text-ink-subtle uppercase">Saved Openings</div>
                      <div className="text-2xl font-bold text-ink mt-1.5">{savedJobs.length}</div>
                      <div className="text-[10px] text-ink-tertiary mt-1">Shortlist candidates: Vetted</div>
                    </div>
                  </div>

                  {/* Profile Health check warning */}
                  {(!profile?.resumeUrl || profile.skills.length === 0) && (
                    <div className="bg-yellow-950/10 border border-yellow-950/30 rounded-lg p-4 flex items-start gap-3">
                      <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <div className="text-xs font-semibold text-yellow-500">Complete Your Placement Profile</div>
                        <p className="text-[10px] text-ink-subtle mt-1">Your profile is missing a resume PDF or technical skills. Recruiters prioritize complete profiles. Head over to the "Student Profile" tab to upload your files.</p>
                      </div>
                    </div>
                  )}

                  {/* Recommended Jobs */}
                  <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-1.5">
                      <Briefcase size={15} className="text-primary" />
                      <span>Recommended for Your Skills</span>
                    </h3>
                    {recommended.length === 0 ? (
                      <p className="text-xs text-ink-subtle">No jobs match your skills currently, showing general openings.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommended.slice(0, 4).map(job => (
                          <div key={job._id} className="p-4 bg-canvas border border-hairline rounded-md hover:border-hairline-strong transition-all flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-semibold text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded capitalize">
                                  {job.type}
                                </span>
                                <span className="text-[10px] font-mono text-ink-subtle">{job.location}</span>
                              </div>
                              <h4 className="text-xs font-bold text-ink hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedJob(job); setActiveTab('jobs'); }}>
                                {job.title}
                              </h4>
                              <p className="text-[10px] text-ink-subtle mt-1">{job.company?.companyName}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-hairline pt-3">
                              <span className="text-[10px] font-mono font-bold text-ink">{job.salary}</span>
                              <button onClick={() => { setSelectedJob(job); setActiveTab('jobs'); }} className="text-[10px] font-semibold text-primary hover:text-white flex items-center gap-0.5 cursor-pointer">
                                <span>Details</span>
                                <ChevronRight size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE EDIT & UPLOAD */}
              {activeTab === 'profile' && (
                <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                  <h2 className="text-sm font-semibold text-ink mb-6 flex items-center gap-1.5 border-b border-hairline pb-3">
                    <User size={16} className="text-primary" />
                    <span>Manage Professional Resume & Profile</span>
                  </h2>

                  {/* Photo & Resume Upload section */}
                  <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-hairline pb-8">
                    <div>
                      <label className="block text-xs font-medium text-ink-subtle mb-2">Profile Picture (Image)</label>
                      <div className="flex items-center gap-4">
                        {profile?.photoUrl ? (
                          <img src={fileUrl(profile.photoUrl)} alt="Avatar" className="w-12 h-12 rounded-full border border-hairline-strong object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full border border-hairline bg-surface-2 flex items-center justify-center text-ink-subtle font-bold shrink-0">
                            P
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setPhotoFile(e.target.files[0])}
                          className="text-xs text-ink-subtle file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-2 file:text-ink hover:file:bg-surface-3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink-subtle mb-2">Resume Document (PDF Only)</label>
                      <div className="flex flex-col gap-2">
                        {profile?.resumeUrl && (
                          <a href={fileUrl(profile.resumeUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                            <FileText size={13} />
                            <span>View Uploaded Resume</span>
                          </a>
                        )}
                        <input 
                          type="file" 
                          accept="application/pdf"
                          onChange={(e) => setResumeFile(e.target.files[0])}
                          className="text-xs text-ink-subtle file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-2 file:text-ink hover:file:bg-surface-3"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        disabled={uploadProgress || (!photoFile && !resumeFile)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-md transition-colors disabled:bg-primary-hover/40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>{uploadProgress ? 'Uploading...' : 'Upload Files'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Profile Edit fields Form */}
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-ink-subtle mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-xs text-ink transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-subtle mb-1.5">Phone Number</label>
                        <input 
                          type="text" 
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-xs text-ink transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-subtle mb-1.5">CGPA</label>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          max="10"
                          required
                          value={editCgpa}
                          onChange={(e) => setEditCgpa(e.target.value)}
                          className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-xs text-ink transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink-subtle mb-1.5">Skills (comma-separated list)</label>
                      <input 
                        type="text" 
                        value={editSkills}
                        onChange={(e) => setEditSkills(e.target.value)}
                        placeholder="React.js, Node.js, Python, MongoDB"
                        className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none focus:ring-1 focus:ring-primary rounded px-3 py-2 text-xs text-ink transition-all"
                      />
                    </div>

                    {/* Education Items List */}
                    <div>
                      <div className="flex items-center justify-between border-t border-hairline pt-4 mt-2 mb-3">
                        <label className="text-xs font-semibold text-ink">Education Milestones</label>
                        <button 
                          type="button"
                          onClick={() => setEditEducation([...editEducation, { school: '', degree: '', year: '' }])}
                          className="flex items-center gap-1 text-[10px] text-primary hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add Row</span>
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {editEducation.map((edu, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-surface-2/40 border border-hairline p-3 rounded">
                            <input 
                              type="text" 
                              required
                              value={edu.school}
                              onChange={(e) => {
                                const newEdu = [...editEducation];
                                newEdu[idx].school = e.target.value;
                                setEditEducation(newEdu);
                              }}
                              placeholder="School / University"
                              className="flex-grow bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                            />
                            <input 
                              type="text" 
                              required
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...editEducation];
                                newEdu[idx].degree = e.target.value;
                                setEditEducation(newEdu);
                              }}
                              placeholder="Degree (e.g. B.Tech)"
                              className="flex-grow bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                            />
                            <input 
                              type="text" 
                              required
                              value={edu.year}
                              onChange={(e) => {
                                const newEdu = [...editEducation];
                                newEdu[idx].year = e.target.value;
                                setEditEducation(newEdu);
                              }}
                              placeholder="Grad Year"
                              className="w-20 bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                            />
                            <button 
                              type="button" 
                              onClick={() => setEditEducation(editEducation.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects Items List */}
                    <div>
                      <div className="flex items-center justify-between border-t border-hairline pt-4 mt-2 mb-3">
                        <label className="text-xs font-semibold text-ink">Project Repositories</label>
                        <button 
                          type="button"
                          onClick={() => setEditProjects([...editProjects, { title: '', description: '', link: '' }])}
                          className="flex items-center gap-1 text-[10px] text-primary hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add Row</span>
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {editProjects.map((proj, idx) => (
                          <div key={idx} className="flex flex-col gap-2 bg-surface-2/40 border border-hairline p-3 rounded">
                            <div className="flex items-center gap-3">
                              <input 
                                type="text" 
                                required
                                value={proj.title}
                                onChange={(e) => {
                                  const newProj = [...editProjects];
                                  newProj[idx].title = e.target.value;
                                  setEditProjects(newProj);
                                }}
                                placeholder="Project Title"
                                className="flex-grow bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                              />
                              <input 
                                type="url" 
                                value={proj.link}
                                onChange={(e) => {
                                  const newProj = [...editProjects];
                                  newProj[idx].link = e.target.value;
                                  setEditProjects(newProj);
                                }}
                                placeholder="Repository Link (Optional)"
                                className="flex-grow bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                              />
                              <button 
                                type="button" 
                                onClick={() => setEditProjects(editProjects.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <input 
                              type="text" 
                              required
                              value={proj.description}
                              onChange={(e) => {
                                const newProj = [...editProjects];
                                newProj[idx].description = e.target.value;
                                setEditProjects(newProj);
                              }}
                              placeholder="Brief description of project technical stack and purpose..."
                              className="w-full bg-surface-2 border border-hairline rounded px-2.5 py-1.5 text-[11px] text-ink"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-hairline pt-4 mt-2">
                      <button 
                        type="submit"
                        className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-md transition-colors cursor-pointer"
                      >
                        Save Profile Data
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: JOBS FEED */}
              {activeTab === 'jobs' && (
                <div className="flex flex-col gap-6">
                  {/* Search and Filters Strip */}
                  <div className="bg-surface-1 border border-hairline rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-2.5 text-ink-subtle" size={16} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs by title, description or skills..."
                        className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none rounded pl-9 pr-3 py-1.5 text-xs text-ink transition-all"
                      />
                    </div>
                    <div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-surface-2 border border-hairline focus:outline-none rounded px-3 py-1.5 text-xs text-ink transition-all cursor-pointer"
                      >
                        <option value="all">All Job Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={filterLoc}
                        onChange={(e) => setFilterLoc(e.target.value)}
                        className="w-full bg-surface-2 border border-hairline focus:outline-none rounded px-3 py-1.5 text-xs text-ink transition-all cursor-pointer"
                      >
                        <option value="all">All Locations</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Noida">Noida</option>
                        <option value="Mumbai">Mumbai</option>
                      </select>
                    </div>
                  </div>

                  {/* Listings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.length === 0 ? (
                      <div className="md:col-span-2 bg-surface-1 border border-hairline rounded-lg p-10 text-center">
                        <Briefcase size={32} className="text-ink-tertiary mx-auto mb-2" />
                        <p className="text-xs text-ink-subtle">No job postings found matching your search filters.</p>
                      </div>
                    ) : (
                      filteredJobs.map(job => {
                        const isJobSaved = savedJobs.some(s => s._id === job._id);
                        const isJobApplied = applications.some(a => a.job?._id === job._id);
                        
                        return (
                          <div key={job._id} className="bg-surface-1 border border-hairline rounded-lg p-5 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[9px] font-semibold text-primary px-2 py-0.5 bg-primary/10 border border-primary/20 rounded capitalize">
                                  {job.type}
                                </span>
                                <button 
                                  onClick={() => handleToggleSave(job._id)}
                                  className="text-ink-subtle hover:text-primary transition-colors p-1 cursor-pointer"
                                >
                                  <Bookmark size={15} fill={isJobSaved ? 'var(--color-primary)' : 'none'} className={isJobSaved ? 'text-primary' : ''} />
                                </button>
                              </div>
                              <h3 className="text-sm font-bold text-ink">{job.title}</h3>
                              <div className="flex items-center gap-1 text-[10px] text-ink-subtle mt-1">
                                <Building size={11} />
                                <span>{job.company?.companyName}</span>
                                <span>•</span>
                                <MapPin size={11} />
                                <span>{job.location}</span>
                              </div>
                              <p className="text-[11px] text-ink-subtle leading-relaxed mt-3 line-clamp-3">
                                {job.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {job.skills.map((skill, idx) => (
                                  <span key={idx} className="text-[9px] font-mono text-ink-subtle bg-surface-2 px-2 py-0.5 border border-hairline rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-hairline pt-4 mt-2">
                              <span className="text-xs font-mono font-bold text-ink">{job.salary}</span>
                              {isJobApplied ? (
                                <span className="text-[10px] font-semibold text-success-green flex items-center gap-1 bg-success-green/10 border border-success-green/20 px-3 py-1.5 rounded">
                                  <CheckCircle size={12} />
                                  <span>Applied</span>
                                </span>
                              ) : (
                                <button 
                                  onClick={() => setSelectedJob(job)}
                                  className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-1.5 rounded transition-all cursor-pointer shadow-md shadow-primary/10"
                                >
                                  Apply Now
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MY APPLICATIONS */}
              {activeTab === 'applications' && (
                <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                  <h2 className="text-sm font-semibold text-ink mb-6 flex items-center gap-1.5 border-b border-hairline pb-3">
                    <FileText size={16} className="text-primary" />
                    <span>Job Applications Tracker</span>
                  </h2>

                  {applications.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText size={32} className="text-ink-tertiary mx-auto mb-2" />
                      <p className="text-xs text-ink-subtle">You haven't submitted any job applications yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {applications.map(app => {
                        const statusColors = {
                          pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                          reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                          shortlisted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                          accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
                          rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
                        };
                        
                        return (
                          <div key={app._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-canvas border border-hairline rounded-lg gap-4">
                            <div>
                              <h3 className="text-xs font-bold text-ink">{app.job?.title}</h3>
                              <p className="text-[10px] text-ink-subtle mt-1 font-mono">{app.job?.company?.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                              {app.coverLetter && (
                                <p className="text-[10px] text-ink-tertiary mt-2 bg-surface-1 border border-hairline p-2 rounded max-w-xl italic">
                                  "{app.coverLetter}"
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center justify-between md:justify-end gap-3">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase font-bold border ${statusColors[app.status]}`}>
                                {app.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SAVED JOBS */}
              {activeTab === 'saved' && (
                <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                  <h2 className="text-sm font-semibold text-ink mb-6 flex items-center gap-1.5 border-b border-hairline pb-3">
                    <Bookmark size={16} className="text-primary" />
                    <span>Saved Job Listings</span>
                  </h2>

                  {savedJobs.length === 0 ? (
                    <div className="text-center py-10">
                      <Bookmark size={32} className="text-ink-tertiary mx-auto mb-2" />
                      <p className="text-xs text-ink-subtle">You don't have any saved job listings.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedJobs.map(job => (
                        <div key={job._id} className="p-4 bg-canvas border border-hairline rounded-lg flex flex-col justify-between gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-ink hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedJob(job); setActiveTab('jobs'); }}>{job.title}</h3>
                            <p className="text-[10px] text-ink-subtle mt-1">{job.company?.companyName}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-hairline pt-3">
                            <button 
                              onClick={() => handleToggleSave(job._id)}
                              className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                            >
                              Remove
                            </button>
                            <button 
                              onClick={() => { setSelectedJob(job); setActiveTab('jobs'); }}
                              className="text-[10px] text-primary hover:text-white font-semibold cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: CHATBOT PANEL (WATSON READY MOCK) */}
              {activeTab === 'chatbot' && (
                <div className="bg-surface-1 border border-hairline rounded-lg p-4 flex flex-col h-[60vh]">
                  <div className="border-b border-hairline pb-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-success-green" />
                      <span className="text-xs font-semibold text-ink">AI Placement Cell Assistant</span>
                    </div>
                    <span className="text-[9px] font-mono text-ink-subtle uppercase px-2 py-0.5 bg-surface-2 border border-hairline rounded">
                      Watson Ready
                    </span>
                  </div>

                  {/* Chat messages thread */}
                  <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-3 text-xs mb-4">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`max-w-[80%] rounded px-3.5 py-2.5 border leading-relaxed ${msg.sender === 'bot' ? 'self-start bg-canvas border-hairline text-ink-muted' : 'self-end bg-primary/10 border-primary/20 text-ink'}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="self-start bg-canvas border border-hairline rounded px-3.5 py-2.5 text-ink-subtle animate-pulse">
                        Assistant is typing...
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2 mt-auto border-t border-hairline pt-3">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask bot: 'What jobs are open?' or 'What is the average package?'"
                      className="flex-grow bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none rounded px-3 py-2 text-xs text-ink"
                    />
                    <button 
                      type="submit"
                      className="bg-primary hover:bg-primary-hover p-2 rounded text-white cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-surface-1 border border-hairline rounded-lg p-6">
                  <h2 className="text-sm font-semibold text-ink mb-6 border-b border-hairline pb-3 flex items-center gap-1.5">
                    <Bell size={16} className="text-primary" />
                    <span>Notification History</span>
                  </h2>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-ink-subtle text-center py-6">You have no notifications yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {notifications.map(n => (
                        <div 
                          key={n._id}
                          onClick={() => !n.read && handleMarkRead(n._id)}
                          className={`p-4 border rounded-lg transition-all text-xs flex justify-between items-start gap-4 ${n.read ? 'bg-canvas border-hairline text-ink-subtle' : 'bg-primary/5 border-primary/25 text-ink cursor-pointer hover:bg-primary/10'}`}
                        >
                          <div>
                            <div className="font-semibold">{n.title}</div>
                            <p className="mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                          {!n.read && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-success-green mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Apply Modal popup */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[500px] glass rounded-xl p-6 flex flex-col gap-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <h3 className="text-sm font-bold text-ink">Apply for {selectedJob.title}</h3>
                <button type="button" onClick={() => { setSelectedJob(null); setModalResumeFile(null); setModalChangingResume(false); }} className="text-ink-subtle hover:text-ink cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-subtle mb-2">Resume details</label>
                {profile?.resumeUrl ? (
                  <div className="bg-surface-2 border border-hairline p-3 rounded text-[11px] text-ink-subtle flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText size={13} className="text-primary" />
                        Profile Resume attached
                      </span>
                      <a href={fileUrl(profile.resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                        View File
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      {modalChangingResume ? (
                        <>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setModalResumeFile(e.target.files[0])}
                            className="flex-1 text-[11px] text-ink-subtle file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-surface-1 file:text-ink hover:file:bg-surface-3"
                          />
                          <button
                            type="button"
                            onClick={handleModalResumeUpload}
                            disabled={!modalResumeFile || modalUploading}
                            className="flex items-center gap-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded transition-all disabled:bg-primary/30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                          >
                            <Upload size={12} />
                            <span>{modalUploading ? 'Uploading...' : 'Replace Resume'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModalChangingResume(true)}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Change / Re-upload Resume
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-2 border border-hairline p-3 rounded text-[11px] text-ink-subtle flex flex-col gap-2">
                    <span>No Resume on profile! Upload one here to continue with your application.</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setModalResumeFile(e.target.files[0])}
                        className="flex-1 text-[11px] text-ink-subtle file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-surface-1 file:text-ink hover:file:bg-surface-3"
                      />
                      <button
                        type="button"
                        onClick={handleModalResumeUpload}
                        disabled={!modalResumeFile || modalUploading}
                        className="flex items-center gap-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded transition-all disabled:bg-primary/30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                      >
                        <Upload size={12} />
                        <span>{modalUploading ? 'Uploading...' : 'Upload Resume'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-subtle mb-1.5">Cover Letter / Pitch (Optional)</label>
                <textarea 
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Pitch why you are the best fit for this role to the recruiter..."
                  className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none rounded px-3 py-2 text-xs text-ink resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-subtle mb-1.5">Contact Information</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-ink-subtle mb-1">Email</span>
                    <input 
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none rounded px-3 py-2 text-xs text-ink"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-subtle mb-1">Phone Number</span>
                    <input 
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-surface-2 border border-hairline focus:border-hairline-strong focus:outline-none rounded px-3 py-2 text-xs text-ink"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-hairline pt-4">
                <button 
                  type="button"
                  onClick={() => { setSelectedJob(null); setModalResumeFile(null); setModalChangingResume(false); }}
                  className="text-xs font-semibold text-ink hover:bg-surface-2 border border-hairline px-4 py-2 rounded transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleApplyJob}
                  disabled={!profile?.resumeUrl || modalUploading || submitting}
                  className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded transition-all disabled:bg-primary/30 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/10"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
