'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AdminLayout from '@/components/layouts/AdminLayout';
import { specializationsApi } from '@/lib/api';

const specializationSchema = z.object({
  name: z.string().min(1, 'Specialization name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type SpecializationFormData = z.infer<typeof specializationSchema>;

export default function EditSpecializationPage() {
  const params = useParams();
  const router = useRouter();
  const specializationId = Number(params.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchSpecialization();
  }, [specializationId]);

  const fetchSpecialization = async () => {
    try {
      const response = await specializationsApi.getById(specializationId);
      const data = response.data;
      setSpecialization(data);
      reset({
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Failed to fetch specialization:', error);
      setError('Failed to load specialization');
    } finally {
      setFetchLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpecializationFormData>({
    resolver: zodResolver(specializationSchema),
  });

  const onSubmit = async (data: SpecializationFormData) => {
    setError(null);
    setLoading(true);

    try {
      await specializationsApi.update(specializationId, data);
      router.push('/admin/specializations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update specialization');
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

  if (!specialization) {
    return (
      <AdminLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Specialization not found
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Specialization</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Specialization Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="e.g., Mathematics, Physics, Chemistry"
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
                placeholder="Optional description for this specialization"
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
                Inactive specializations cannot be assigned to new teachers
              </p>
            </div>

            {specialization.teacherCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <p className="text-sm">
                  This specialization is currently assigned to {specialization.teacherCount} teacher(s).
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
              {loading ? 'Updating...' : 'Update Specialization'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

