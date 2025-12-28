'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AdminLayout from '@/components/layouts/AdminLayout';
import { qualificationsApi } from '@/lib/api';

const qualificationSchema = z.object({
  name: z.string().min(1, 'Qualification name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type QualificationFormData = z.infer<typeof qualificationSchema>;

export default function EditQualificationPage() {
  const params = useParams();
  const router = useRouter();
  const qualificationId = Number(params.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qualification, setQualification] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchQualification();
  }, [qualificationId]);

  const fetchQualification = async () => {
    try {
      const response = await qualificationsApi.getById(qualificationId);
      const data = response.data;
      setQualification(data);
      reset({
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Failed to fetch qualification:', error);
      setError('Failed to load qualification');
    } finally {
      setFetchLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QualificationFormData>({
    resolver: zodResolver(qualificationSchema),
  });

  const onSubmit = async (data: QualificationFormData) => {
    setError(null);
    setLoading(true);

    try {
      await qualificationsApi.update(qualificationId, data);
      router.push('/admin/qualifications');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update qualification');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!qualification) {
    return (
      <AdminLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Qualification not found
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Qualification</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Qualification Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="e.g., B.Sc., M.A., Ph.D."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Optional description for this qualification"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Inactive qualifications cannot be assigned to new teachers
              </p>
            </div>

            {qualification.teacherCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <p className="text-sm">
                  This qualification is currently assigned to {qualification.teacherCount} teacher(s).
                  You cannot delete it until all teachers are reassigned.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Qualification'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

