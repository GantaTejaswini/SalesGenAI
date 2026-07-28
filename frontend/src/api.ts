/**
 * Central API service - handles auth, request interception, token refresh, toast errors.
 * All backend calls must go through this file.
 */

const BASE_URL = 'http://localhost:8000';

// ─── Token Management ────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('sg_access_token') || localStorage.getItem('token');
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem('sg_access_token', access);
  localStorage.setItem('sg_refresh_token', refresh);
}

export function clearTokens(): void {
  localStorage.removeItem('sg_access_token');
  localStorage.removeItem('sg_refresh_token');
  localStorage.removeItem('sg_user');
}

export function setUser(user: object): void {
  localStorage.setItem('sg_user', JSON.stringify(user));
}

export function getUser(): any {
  const raw = localStorage.getItem('sg_user');
  return raw ? JSON.parse(raw) : null;
}

// ─── Toast Notifications ──────────────────────────────────────────────────────

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
      document.body.appendChild(container);
  }

  const colors: Record<string, string> = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#6366f1',
    warning: '#f59e0b',
  };
  const icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex; align-items: center; gap: 0.75rem;
    background: #1e1e2e; border: 1px solid ${colors[type]};
    color: white; padding: 0.9rem 1.25rem; border-radius: 10px;
    font-size: 0.875rem; font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    transform: translateX(100px); opacity: 0;
    transition: all 0.3s ease; min-width: 280px; max-width: 380px;
    border-left: 4px solid ${colors[type]};
  `;
  toast.innerHTML = `
    <span style="color: ${colors[type]}; font-size: 1.1rem; font-weight: bold;">${icons[type]}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

let isRefreshing = false;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('sg_refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('sg_access_token', data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expired – attempt refresh once
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      if (window.location.pathname !== '/login') {
        (window as any).navigate?.('/login');
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    let errorDetail = `Request failed: ${response.status}`;
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<any> {
  const params = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function apiRegister(data: {
  full_name: string; email: string; password: string; organization_name: string;
}): Promise<any> {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiLogout(): Promise<any> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Logout warning:', e);
  } finally {
    clearTokens();
  }
}

export async function getUserProfile(): Promise<any> {
  return apiFetch('/api/users/profile');
}

export async function updateUserProfile(data: object): Promise<any> {
  return apiFetch('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function uploadAvatar(profilePictureBase64: string): Promise<any> {
  return apiFetch('/api/users/avatar', { method: 'POST', body: JSON.stringify({ profile_picture: profilePictureBase64 }) });
}

export async function removeAvatar(): Promise<any> {
  return apiFetch('/api/users/avatar', { method: 'DELETE' });
}

export async function getNotificationPreferences(): Promise<any> {
  return apiFetch('/api/users/preferences');
}

export async function updateNotificationPreferences(data: object): Promise<any> {
  return apiFetch('/api/users/preferences', { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateOrganizationSettings(data: object): Promise<any> {
  return apiFetch('/api/users/organization', { method: 'PUT', body: JSON.stringify(data) });
}

export async function exportAccountData(): Promise<any> {
  return apiFetch('/api/users/export-data');
}

export async function deleteAccount(): Promise<any> {
  return apiFetch('/api/users/account', { method: 'DELETE' });
}

// Team & RBAC
export async function getTeamMembers(): Promise<any> {
  return apiFetch('/api/team/members');
}

export async function inviteTeamMember(data: { email: string; role: string }): Promise<any> {
  return apiFetch('/api/team/invitations', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMemberRole(userId: string, role: string): Promise<any> {
  return apiFetch(`/api/team/members/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export async function suspendMember(userId: string): Promise<any> {
  return apiFetch(`/api/team/members/${userId}/suspend`, { method: 'POST' });
}

export async function activateMember(userId: string): Promise<any> {
  return apiFetch(`/api/team/members/${userId}/activate`, { method: 'POST' });
}

export async function removeMember(userId: string): Promise<any> {
  return apiFetch(`/api/team/members/${userId}`, { method: 'DELETE' });
}

// Security & Devices
export async function getActiveSessions(): Promise<any> {
  return apiFetch('/api/security/sessions');
}

export async function revokeSession(sessionId: string): Promise<any> {
  return apiFetch(`/api/security/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function revokeOtherSessions(): Promise<any> {
  return apiFetch('/api/security/sessions/others/revoke', { method: 'DELETE' });
}

export async function toggle2FA(enabled: boolean): Promise<any> {
  return apiFetch('/api/security/2fa/toggle', { method: 'POST', body: JSON.stringify({ enabled }) });
}

export async function getLoginHistory(): Promise<any> {
  return apiFetch('/api/security/login-history');
}

export async function changePassword(data: object): Promise<any> {
  return apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
}

// API Keys
export async function getApiKeys(): Promise<any> {
  return apiFetch('/api/api-keys');
}

export async function createApiKey(data: { name: string; scopes?: string }): Promise<any> {
  return apiFetch('/api/api-keys', { method: 'POST', body: JSON.stringify(data) });
}

export async function revokeApiKey(keyId: string): Promise<any> {
  return apiFetch(`/api/api-keys/${keyId}`, { method: 'DELETE' });
}

export async function rotateApiKey(keyId: string): Promise<any> {
  return apiFetch(`/api/api-keys/${keyId}/rotate`, { method: 'POST' });
}

// Audit Logs
export async function getAuditLogs(params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/audit-logs?${qs}`);
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export async function getDashboard(timeframe = 'this_month'): Promise<any> {
  return apiFetch(`/api/dashboard?timeframe=${timeframe}`);
}

// ─── Leads API ────────────────────────────────────────────────────────────────

export async function getLeads(params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/leads?${qs}`);
}

export async function createLead(data: object): Promise<any> {
  return apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateLead(id: string, data: object): Promise<any> {
  return apiFetch(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateLeadStatus(id: string, status: string): Promise<any> {
  return apiFetch(`/api/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ lead_status: status }) });
}

export async function updateLeadOwner(id: string, ownerId: string): Promise<any> {
  return apiFetch(`/api/leads/${id}/owner`, { method: 'PATCH', body: JSON.stringify({ owner_id: ownerId }) });
}

export async function searchLeads(query: string): Promise<any> {
  return apiFetch(`/api/leads/search?q=${encodeURIComponent(query)}`);
}

export async function exportLeads(format: string, params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams({ format, ...params }).toString();
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/leads/export?${qs}`, { headers });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

export async function deleteLead(id: string): Promise<any> {
  return apiFetch(`/api/leads/${id}`, { method: 'DELETE' });
}

// ─── Tasks API ────────────────────────────────────────────────────────────────

export async function getTasks(params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/tasks?${qs}`);
}

export async function createTask(data: object): Promise<any> {
  return apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTask(id: string, data: object): Promise<any> {
  return apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTask(id: string): Promise<any> {
  return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

export async function bulkTasksAction(action: string, taskIds: string[]): Promise<any> {
  return apiFetch('/api/tasks/bulk-actions', { method: 'POST', body: JSON.stringify({ action, task_ids: taskIds }) });
}

// ─── Meetings API ─────────────────────────────────────────────────────────────

export async function getMeetings(params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/meetings?${qs}`);
}

export async function createMeeting(data: object): Promise<any> {
  return apiFetch('/api/meetings', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteMeeting(id: string): Promise<any> {
  return apiFetch(`/api/meetings/${id}`, { method: 'DELETE' });
}

export async function generateMeetingSummary(id: string): Promise<any> {
  return apiFetch(`/api/meetings/${id}/ai-summary`, { method: 'POST' });
}

// ─── Analytics API ────────────────────────────────────────────────────────────

export async function getRevenueAnalytics(): Promise<any> {
  return apiFetch('/api/analytics/revenue');
}

export async function getFunnelAnalytics(): Promise<any> {
  return apiFetch('/api/analytics/funnel');
}

// ─── Reports API ──────────────────────────────────────────────────────────────

export async function exportReport(type: string): Promise<any> {
  return apiFetch(`/api/reports/export?report_type=${encodeURIComponent(type)}`, { method: 'POST' });
}

// ─── Notifications API ────────────────────────────────────────────────────────

export async function getNotifications(params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/notifications?${qs}`);
}

export async function markNotificationRead(id: string): Promise<any> {
  return apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<any> {
  return apiFetch('/api/notifications/read-all', { method: 'POST' });
}

export async function deleteNotification(id: string): Promise<any> {
  return apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
}

// ─── Search API ───────────────────────────────────────────────────────────────

export async function globalSearch(q: string): Promise<any> {
  return apiFetch(`/api/search?q=${encodeURIComponent(q)}`);
}

// ─── Legacy/Generic API Adapter ───────────────────────────────────────────────

export const api = {
  getUser,
  setUser,
  getUserProfile,
  getNotifications,
  markAllNotificationsRead,
  apiLogout,
  get: async (path: string) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    return apiFetch(fullPath);
  },
  post: async (path: string, body?: any, isForm: boolean = false) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    if (isForm) {
      const params = new URLSearchParams(body || {});
      const res = await fetch(`${BASE_URL}${fullPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) {
        let errDetail = 'Request failed';
        try {
          const err = await res.json();
          errDetail = err.detail || errDetail;
        } catch {}
        throw new Error(errDetail);
      }
      return res.json();
    }
    return apiFetch(fullPath, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put: async (path: string, body?: any) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    return apiFetch(fullPath, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch: async (path: string, body?: any) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    return apiFetch(fullPath, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete: async (path: string) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    return apiFetch(fullPath, { method: 'DELETE' });
  },
  postMultiPart: async (path: string, formData: FormData) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${fullPath}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errData.detail || 'Upload failed');
    }
    return res.json();
  },
  getBaseUrl: () => `${BASE_URL}/api`,
};

