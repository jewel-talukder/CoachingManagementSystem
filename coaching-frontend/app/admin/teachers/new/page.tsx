'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { teachersApi, branchesApi, qualificationsApi, specializationsApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useBranchStore } from '@/lib/store/branchStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTeacherPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const { selectedBranch } = useBranchStore();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    branchId: selectedBranch?.id || 0,
    employeeCode: '',
    qualificationId: 0,
    specializationId: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: '1', // 1 = FullTime, 2 = PerClass
    salary: '',
  });

  useEffect(() => {
    fetchBranches();
    fetchQualifications();
    fetchSpecializations();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data);
      if (!formData.branchId && response.data.length > 0) {
        const defaultBranch = response.data.find((b: any) => b.isDefault) || response.data[0];
        setFormData({ ...formData, branchId: defaultBranch.id });
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchQualifications = async () => {
    try {
      const response = await qualificationsApi.getAll({ isActive: true });
      setQualifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch qualifications:', error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await specializationsApi.getAll({ isActive: true });
      setSpecializations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await teachersApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        branchId: formData.branchId,
        employeeCode: formData.employeeCode || null,
        qualificationId: formData.qualificationId > 0 ? formData.qualificationId : null,
        specializationId: formData.specializationId > 0 ? formData.specializationId : null,
        joiningDate: formData.joiningDate || null,
        employmentType: parseInt(formData.employmentType),
        salary: formData.salary ? parseFloat(formData.salary) : null,
      });

      addToast('Teacher created successfully!', 'success');
      router.push('/admin/teachers');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create teacher', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <Link
          href="/admin/teachers"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teachers
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Teacher</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new teacher account for your coaching center
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
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
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm">
                  Will be auto-generated (e.g., emp-01)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <select
                  value={formData.qualificationId}
                  onChange={(e) => setFormData({ ...formData, qualificationId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">Select Qualification</option>
                  {qualifications.map((qual) => (
                    <option key={qual.id} value={qual.id}>
                      {qual.name} {qual.description ? `(${qual.description})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  value={formData.specializationId}
                  onChange={(e) => setFormData({ ...formData, specializationId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">Select Specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name} {spec.description ? `(${spec.description})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">Full Time</option>
                  <option value="2">Per Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary {formData.employmentType === '1' ? '(Monthly)' : '(Per Class)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder={formData.employmentType === '1' ? 'Monthly salary' : 'Per class rate'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

