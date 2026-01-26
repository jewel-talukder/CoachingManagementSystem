'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { batchesApi } from '@/lib/api';

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
}

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  teacherId: z.number().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
  monthlyFee: z.number().min(0, 'Monthly fee must be 0 or greater'),
  scheduleDays: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isActive: z.boolean(),
});

type BatchFormData = z.infer<typeof batchSchema>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditBatchPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = Number(params.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [batch, setBatch] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  useEffect(() => {
    if (batchId) {
      fetchBatch();
    }
  }, [batchId]);

  const fetchBatch = async () => {
    try {
      const response = await batchesApi.getById(batchId);
      const data = response.data;
      setBatch(data);

      // Parse scheduleDays JSON if it exists
      let schedules: DaySchedule[] = [];
      if (data.scheduleDays) {
        try {
          const parsed = JSON.parse(data.scheduleDays);
          if (Array.isArray(parsed)) {
            schedules = parsed.map((s: any) => ({
              day: s.day,
              startTime: s.startTime ? s.startTime.substring(0, 5) : '09:00',
              endTime: s.endTime ? s.endTime.substring(0, 5) : '10:00',
            }));
          }
        } catch (e) {
          console.error('Failed to parse scheduleDays:', e);
        }
      }
      setDaySchedules(schedules);

      // Format dates for input fields
      const startDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '';
      const endDate = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '';

      reset({
        name: data.name || '',
        code: data.code || '',
        description: data.description || '',
        teacherId: data.teacherId || undefined,
        startDate: startDate,
        endDate: endDate || '',
        maxStudents: data.maxStudents || 1,
        monthlyFee: data.monthlyFee || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (error: any) {
      console.error('Failed to fetch batch:', error);
      setError(error.response?.data?.message || 'Failed to load batch');
    } finally {
      setFetchLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setDaySchedules(prev => {
      const existing = prev.find(ds => ds.day === day);
      if (existing) {
        return prev.filter(ds => ds.day !== day);
      } else {
        return [...prev, { day, startTime: '09:00', endTime: '10:00' }];
      }
    });
  };

  const updateDaySchedule = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setDaySchedules(prev =>
      prev.map(ds => ds.day === day ? { ...ds, [field]: value } : ds)
    );
  };

  const onSubmit = async (data: BatchFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Convert day schedules to JSON format
      const scheduleDaysJson = daySchedules.length > 0 
        ? JSON.stringify(daySchedules.map(ds => ({
            day: ds.day,
            startTime: ds.startTime + ':00',
            endTime: ds.endTime + ':00'
          })))
        : null;

      const batchData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        scheduleDays: scheduleDaysJson,
        daySchedules: daySchedules.length > 0 ? daySchedules.map(ds => ({
          day: ds.day,
          startTime: ds.startTime + ':00',
          endTime: ds.endTime + ':00'
        })) : null,
        startTime: null,
        endTime: null,
      };
      await batchesApi.update(batchId, batchData);
      router.push('/admin/batches');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to update batch';
      setError(errorMessage);
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

  if (!batch) {
    return (
      <AdminLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Batch not found
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Batch</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Batch Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Batch Code
              </label>
              <input
                {...register('code')}
                type="text"
                id="code"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
            </div>

            <div>
              <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">
                Max Students *
              </label>
              <input
                {...register('maxStudents', { valueAsNumber: true })}
                type="number"
                id="maxStudents"
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
              {errors.maxStudents && (
                <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700">
                Monthly Fee (Taka) *
              </label>
              <input
                {...register('monthlyFee', { valueAsNumber: true })}
                type="number"
                id="monthlyFee"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="0.00"
              />
              {errors.monthlyFee && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyFee.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Monthly fee per student for this batch
              </p>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="date"
                id="startDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                {...register('endDate')}
                type="date"
                id="endDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Schedule Days & Times
              </label>
              <div className="space-y-4">
                {/* Day Selection Buttons */}
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => {
                    const isSelected = daySchedules.some(ds => ds.day === day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Time Inputs for Selected Days */}
                {daySchedules.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Set times for selected days:
                    </p>
                    {daySchedules.map((schedule) => (
                      <div key={schedule.day} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div className="font-medium text-gray-700">{schedule.day}</div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateDaySchedule(schedule.day, 'startTime', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateDaySchedule(schedule.day, 'endTime', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/batches')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

