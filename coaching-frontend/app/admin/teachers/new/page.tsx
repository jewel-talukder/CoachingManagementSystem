'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teachersApi, branchesApi, qualificationsApi, specializationsApi, shiftsApi } from '@/lib/api';
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
  const [shifts, setShifts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeCode: '',
    branchId: selectedBranch?.id?.toString() || '',
    qualificationId: '',
    specializationId: '',
    shiftId: '',
    baseSalary: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [branchesRes, qualificationsRes, specializationsRes, shiftsRes] = await Promise.all([
        branchesApi.getAll(),
        qualificationsApi.getAll({ isActive: true }),
        specializationsApi.getAll({ isActive: true }),
        shiftsApi.getAll({ isActive: true }),
      ]);

      setBranches(branchesRes.data || []);
      setQualifications(qualificationsRes.data || []);
      setSpecializations(specializationsRes.data || []);
      setShifts(shiftsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
      addToast('Failed to load form data', 'error');
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
        phone: formData.phone,
        roleIds: [3], // Teacher role ID
        userType: 'Teacher',
        additionalData: {
          BranchId: formData.branchId ? parseInt(formData.branchId) : null,
          EmployeeCode: formData.employeeCode,
          QualificationId: formData.qualificationId ? parseInt(formData.qualificationId) : null,
          SpecializationId: formData.specializationId ? parseInt(formData.specializationId) : null,
          ShiftId: formData.shiftId ? parseInt(formData.shiftId) : null,
          BaseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
          JoiningDate: formData.joiningDate,
        },
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
    <div className="px-4 py-8">
      <Link
        href="/admin/teachers"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Teachers
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Teacher</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new teacher profile</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
            <input
              type="text"
              value={formData.employeeCode}
              onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select
              required
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
            <select
              value={formData.qualificationId}
              onChange={(e) => setFormData({ ...formData, qualificationId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Qualification</option>
              {qualifications.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select
              value={formData.specializationId}
              onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Specialization</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
            <select
              value={formData.shiftId}
              onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Shift</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
            <input
              type="number"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/teachers')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
  );
}
