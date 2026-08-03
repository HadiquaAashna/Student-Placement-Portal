import { getToken, clearSession } from './auth.js';

export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api';

// Build a browser-resolvable URL for locally stored uploads. The backend stores
// relative paths like "/uploads/xyz.pdf"; on the frontend those would resolve to
// the Astro origin instead of the API server, so we prefix the backend origin.
export const fileUrl = (url) => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (url.startsWith('/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
};

/**
 * Custom Fetch Wrapper
 */
const request = async (method, path, body = null, isFormData = false) => {
  const token = getToken();
  
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, config);
    
    // Auto-logout on token expiration / unauthorized response
    if (response.status === 401 && path !== '/auth/login') {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error(`API Error [${method} ${path}]:`, error.message);
    throw error;
  }
};

export const api = {
  auth: {
    login: (credentials) => request('POST', '/auth/login', credentials),
    register: (userData) => request('POST', '/auth/register', userData),
    getProfile: () => request('GET', '/auth/profile')
  },
  jobs: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.limit) params.append('limit', String(filters.limit));
      
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return request('GET', `/jobs${queryStr}`);
    },
    getById: (id) => request('GET', `/jobs/${id}`),
    getCompanyJobs: () => request('GET', '/jobs/company/my-jobs'),
    create: (jobData) => request('POST', '/jobs', jobData),
    update: (id, jobData) => request('PUT', `/jobs/${id}`, jobData),
    delete: (id) => request('DELETE', `/jobs/${id}`)
  },
  students: {
    updateProfile: (profileData) => request('PUT', '/students/profile', profileData),
    uploadFiles: (formData) => request('POST', '/students/upload', formData, true),
    toggleSaveJob: (jobId) => request('POST', `/students/saved-jobs/${jobId}`),
    getSavedJobs: () => request('GET', '/students/saved-jobs'),
    getRecommendedJobs: () => request('GET', '/students/recommended-jobs'),
    getNotifications: () => request('GET', '/students/notifications'),
    markNotificationRead: (id) => request('PUT', `/students/notifications/${id}/read`)
  },
  applications: {
    apply: (applicationData) => request('POST', '/applications', applicationData),
    getStudentApplications: () => request('GET', '/applications/student/my-applications'),
    getJobApplicants: (jobId) => request('GET', `/applications/job/${jobId}`),
    updateStatus: (id, status) => request('PUT', `/applications/${id}/status`, { status })
  },
  admin: {
    getStats: () => request('GET', '/admin/stats'),
    getStudents: () => request('GET', '/admin/students'),
    getCompanies: () => request('GET', '/admin/companies'),
    approveCompany: (id, status) => request('PUT', `/admin/companies/${id}/approve`, { status }),
    getJobs: () => request('GET', '/admin/jobs')
  },
  chatbot: {
    sendMessage: (message) => request('POST', '/chatbot', { message })
  }
};
