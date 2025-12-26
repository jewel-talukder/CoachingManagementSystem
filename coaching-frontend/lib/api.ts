import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7286/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Enrollments API
export const enrollmentsApi = {
  getAll: (params?: { courseId?: number; batchId?: number; studentId?: number; status?: string }) =>
    api.get('/enrollments', { params }),
  create: (data: any) => api.post('/enrollments', data),
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

// Super Admin API
export const superAdminApi = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  getCoachings: (params?: { isActive?: boolean; isBlocked?: boolean }) =>
    api.get('/superadmin/coachings', { params }),
  activateCoaching: (id: number) => api.put(`/superadmin/coachings/${id}/activate`),
  blockCoaching: (id: number) => api.put(`/superadmin/coachings/${id}/block`),
  assignPlan: (id: number, data: any) => api.put(`/superadmin/coachings/${id}/assign-plan`, data),
};

