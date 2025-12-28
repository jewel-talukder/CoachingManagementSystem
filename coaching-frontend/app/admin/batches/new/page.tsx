'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { batchesApi, coursesApi } from '@/lib/api';

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
}

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  courseId: z.number().min(1, 'Course is required'),
  teacherId: z.number().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
  scheduleDays: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function NewBatchPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll({ isActive: true });
      setCourses(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  const toggleDay = (day: string) => {
    setDaySchedules(prev => {
      const existing = prev.find(ds => ds.day === day);
      if (existing) {
        // Remove day
        return prev.filter(ds => ds.day !== day);
      } else {
        // Add day with default times
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
            startTime: ds.startTime + ':00', // Add seconds for backend
            endTime: ds.endTime + ':00'
          })))
        : null;

      const batchData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
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
      await batchesApi.create(batchData);
      router.push('/admin/batches');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Batch</h1>

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
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                Course *
              </label>
              <select
                {...register('courseId', { valueAsNumber: true })}
                id="courseId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
              )}
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Schedule Days & Times *
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
                    {daySchedules.map((schedule, index) => (
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
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

