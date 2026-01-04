'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { usersApi, branchesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';

export default function EditStudentPageClient() {
  const params = useParams();
  const studentId = Number(params.id);
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    branchId: 0,
    isActive: true,
  });

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      fetchBranches();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setFetching(true);
      const response = await usersApi.getById(studentId);
      const student = response.data;
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || '',
        branchId: student.branchId || 0,
        isActive: student.isActive,
      });
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to load student', 'error');
      router.push('/admin/students');
    } finally {
      setFetching(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.update(studentId, formData);
      addToast('Student updated successfully!', 'success');
      router.push('/admin/students');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update student', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Student</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

