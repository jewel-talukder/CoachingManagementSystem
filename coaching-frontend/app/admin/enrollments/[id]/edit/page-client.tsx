'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { enrollmentsApi } from '@/lib/api';

export default function EditEnrollmentPageClient() {
  const params = useParams();
  const enrollmentId = Number(params.id);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    feePaid: 0,
    totalFee: 0,
  });

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollment();
    }
  }, [enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      setFetching(true);
      const response = await enrollmentsApi.getById(enrollmentId);
      const enrollment = response.data;
      setFormData({
        feePaid: enrollment.feePaid || 0,
        totalFee: enrollment.totalFee || 0,
      });
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enrollmentsApi.update(enrollmentId, formData);
      router.push('/admin/enrollments');
    } catch (error: any) {
      console.error('Failed to update enrollment:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Enrollment</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee (Taka)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Paid (Taka)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.feePaid}
                onChange={(e) => setFormData({ ...formData, feePaid: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              {loading ? 'Updating...' : 'Update Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

