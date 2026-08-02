// Session manager using localStorage

export const setSession = (token, role, email, isApproved) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_role', role);
    localStorage.setItem('cc_email', email);
    localStorage.setItem('cc_approved', String(isApproved));
  }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_role');
    localStorage.removeItem('cc_email');
    localStorage.removeItem('cc_approved');
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cc_token');
  }
  return null;
};

export const getRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cc_role');
  }
  return null;
};

export const getEmail = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cc_email');
  }
  return null;
};

export const isApproved = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cc_approved') === 'true';
  }
  return false;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (!token) return null;
    return {
      token,
      role: getRole(),
      email: getEmail(),
      isApproved: isApproved()
    };
  }
  return null;
};

// After an IBM App ID login the backend redirects to
// /student/dashboard?token=...&role=...&email=...&approved=...
// This helper captures those credentials into the local session and cleans the URL.
export const applyAuthFromUrl = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return false;

  setSession(
    token,
    params.get('role') || 'student',
    params.get('email') || '',
    params.get('approved') === 'true'
  );

  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
};
