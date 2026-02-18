'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersApi, branchesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditStudentPageClient() {
  const params = useParams();
  const studentId = Number(params.id);
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    branchId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    studentCode: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
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

      const branchId = student.additionalData?.BranchId?.toString() || '';
      const dateOfBirth = student.additionalData?.DateOfBirth || '';

      setFormData({
        branchId: branchId,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        password: '', // Don't pre-fill password
        studentCode: student.additionalData?.StudentCode || '',
        dateOfBirth: dateOfBirth ? dateOfBirth.split('T')[0] : '', // Format date for input
        parentName: student.additionalData?.ParentName || '',
        parentPhone: student.additionalData?.ParentPhone || '',
        isActive: student.isActive !== undefined ? student.isActive : true,
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
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        isActive: formData.isActive,
        roleIds: [4], // Student role ID
        userType: 'Student',
        additionalData: {
          BranchId: formData.branchId ? parseInt(formData.branchId) : null,
          StudentCode: formData.studentCode,
          DateOfBirth: formData.dateOfBirth || null,
          ParentName: formData.parentName,
          ParentPhone: formData.parentPhone,
        },
      };

      // Only include password if it's provided
      if (formData.password && formData.password.length > 0) {
        updateData.password = formData.password;
      }

      await usersApi.update(studentId, updateData);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Link
        href="/admin/students"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Students
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update student information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Student Information</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.isDefault && '(Default)'}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="01XXXXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                Phone number is used as username for login
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only enter if you want to change the password
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="optional@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Code</label>
              <input
                type="text"
                readOnly
                value={formData.studentCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
            <input
              type="text"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
            <input
              type="tel"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/students')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
