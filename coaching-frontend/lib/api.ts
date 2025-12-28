import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7286/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and branchId
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add branchId from store if available
      const branchStorage = localStorage.getItem('branch-storage');
      if (branchStorage) {
        try {
          const branchData = JSON.parse(branchStorage);
          if (branchData.state?.selectedBranch?.id) {
            config.params = config.params || {};
            config.params.branchId = branchData.state.selectedBranch.id;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  registerCoaching: (data: any) =>
    api.post('/auth/register-coaching', data),
  getFirstPlan: (billingPeriod?: string) =>
    api.get('/auth/first-plan', { params: { billingPeriod } }),
};

// Dashboard API
export const dashboardApi = {
  getCoachingAdmin: () => api.get('/dashboard/coaching-admin'),
  getTeacher: () => api.get('/dashboard/teacher'),
  getStudent: () => api.get('/dashboard/student'),
};

// Courses API
export const coursesApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/courses', { params }),
  create: (data: any) => api.post('/courses', data),
  update: (id: number, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

// Batches API
export const batchesApi = {
  getAll: (params?: { courseId?: number; isActive?: boolean }) =>
    api.get('/batches', { params }),
  create: (data: any) => api.post('/batches', data),
  update: (id: number, data: any) => api.put(`/batches/${id}`, data),
  delete: (id: number) => api.delete(`/batches/${id}`),
};

// Users API
export const usersApi = {
  getAll: (params?: { role?: string; isActive?: boolean }) =>
    api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Enrollments API
export const enrollmentsApi = {
  getAll: (params?: { courseId?: number; batchId?: number; studentId?: number; status?: string }) =>
    api.get('/enrollments', { params }),
  getById: (id: number) => api.get(`/enrollments/${id}`),
  create: (data: any) => api.post('/enrollments', data),
  update: (id: number, data: any) => api.put(`/enrollments/${id}`, data),
  delete: (id: number) => api.delete(`/enrollments/${id}`),
  complete: (id: number) => api.put(`/enrollments/${id}/complete`),
  cancel: (id: number) => api.put(`/enrollments/${id}/cancel`),
};

// Attendance API
export const attendanceApi = {
  get: (params: { batchId: number; date?: string }) =>
    api.get('/attendance', { params }),
  mark: (data: any) => api.post('/attendance', data),
  getStudent: (studentId: number, params?: { batchId?: number; startDate?: string; endDate?: string }) =>
    api.get(`/attendance/student/${studentId}`, { params }),
};

// Exams API
export const examsApi = {
  getAll: (params?: { subjectId?: number; isActive?: boolean }) =>
    api.get('/exams', { params }),
  create: (data: any) => api.post('/exams', data),
  getResults: (id: number) => api.get(`/exams/${id}/results`),
  uploadResults: (id: number, data: any) => api.post(`/exams/${id}/results`, data),
  getStudentExams: (studentId: number) => api.get(`/exams/student/${studentId}`),
};

// Branches API
export const branchesApi = {
  getAll: () => api.get('/branches'),
  getById: (id: number) => api.get(`/branches/${id}`),
  create: (data: any) => api.post('/branches', data),
  update: (id: number, data: any) => api.put(`/branches/${id}`, data),
  delete: (id: number) => api.delete(`/branches/${id}`),
};

// Teachers API
export const teachersApi = {
  getAll: (params?: { branchId?: number; isActive?: boolean }) =>
    api.get('/teachers', { params }),
  getById: (id: number) => api.get(`/teachers/${id}`),
  create: (data: any) => api.post('/teachers', data),
  update: (id: number, data: any) => api.put(`/teachers/${id}`, data),
  delete: (id: number) => api.delete(`/teachers/${id}`),
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: () => api.get('/subscriptions/current'),
  getAvailablePlans: (params?: { billingPeriod?: string }) =>
    api.get('/subscriptions/plans', { params }),
  changePlan: (data: { planId: number; autoRenew?: boolean }) =>
    api.put('/subscriptions/change-plan', data),
};

// Qualifications API
export const qualificationsApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/qualifications', { params }),
  getById: (id: number) => api.get(`/qualifications/${id}`),
  create: (data: any) => api.post('/qualifications', data),
  update: (id: number, data: any) => api.put(`/qualifications/${id}`, data),
  delete: (id: number) => api.delete(`/qualifications/${id}`),
};

// Specializations API
export const specializationsApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/specializations', { params }),
  getById: (id: number) => api.get(`/specializations/${id}`),
  create: (data: any) => api.post('/specializations', data),
  update: (id: number, data: any) => api.put(`/specializations/${id}`, data),
  delete: (id: number) => api.delete(`/specializations/${id}`),
};

// Super Admin API
export const superAdminApi = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  getCoachings: (params?: { isActive?: boolean; isBlocked?: boolean }) =>
    api.get('/superadmin/coachings', { params }),
  activateCoaching: (id: number) => api.put(`/superadmin/coachings/${id}/activate`),
  blockCoaching: (id: number) => api.put(`/superadmin/coachings/${id}/block`),
  assignPlan: (id: number, data: any) => api.put(`/superadmin/coachings/${id}/assign-plan`, data),
};

