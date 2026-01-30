'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { enrollmentsApi, coursesApi, batchesApi, usersApi } from '@/lib/api';

const enrollmentSchema = z.object({
  studentId: z.number().min(1, 'Student is required'),
  courseId: z.number().min(1, 'Course is required'),
  batchId: z.number().min(1, 'Batch is required'),
  feePaid: z.number().min(0).optional(),
  totalFee: z.number().min(0).optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function NewEnrollmentPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll({ isActive: true });
      setCourses(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchesApi.getAll({ isActive: true });
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await usersApi.getAll({ role: 'Student', isActive: true });
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const courseId = watch('courseId');
  const batchId = watch('batchId');

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId, setValue]);

  // Auto-calculate TotalFee when batch or course changes
  useEffect(() => {
    if (batchId && courseId && batches.length > 0 && courses.length > 0) {
      const selectedBatch = batches.find(b => b.id === batchId);
      const selectedCourse = courses.find(c => c.id === courseId);

      if (selectedBatch && selectedCourse && selectedBatch.monthlyFee && selectedCourse.durationMonths) {
        const calculatedTotalFee = selectedBatch.monthlyFee * selectedCourse.durationMonths;
        setValue('totalFee', calculatedTotalFee);
      }
    }
  }, [batchId, courseId, batches, courses, setValue]);

  const onSubmit = async (data: EnrollmentFormData) => {
    setError(null);
    setLoading(true);

    try {
      await enrollmentsApi.create(data);
      router.push('/admin/enrollments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Enrollment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student *
              </label>
              <select
                {...register('studentId', { valueAsNumber: true })}
                id="studentId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.studentId || student.id}>
                    {student.firstName} {student.lastName} {student.studentCode ? `(${student.studentCode})` : ''} - {student.phone}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
              )}
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
                    {course.name} - ₹{course.fee || 0}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">
                Batch *
              </label>
              <select
                {...register('batchId', { valueAsNumber: true })}
                id="batchId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              >
                <option value="">Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.currentStudents}/{batch.maxStudents} students)
                    {batch.monthlyFee ? ` - ${batch.monthlyFee} Taka/month` : ''}
                  </option>
                ))}
              </select>
              {errors.batchId && (
                <p className="mt-1 text-sm text-red-600">{errors.batchId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700">
                Total Fee (Taka) {batchId && courseId && (
                  <span className="text-xs text-gray-500">(Auto-calculated, can be changed)</span>
                )}
              </label>
              <input
                {...register('totalFee', { valueAsNumber: true })}
                type="number"
                id="totalFee"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
              {batchId && courseId && (
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated as: Batch Monthly Fee × Course Duration. You can modify if needed.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="feePaid" className="block text-sm font-medium text-gray-700">
                Fee Paid (₹)
              </label>
              <input
                {...register('feePaid', { valueAsNumber: true })}
                type="number"
                id="feePaid"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
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
              {loading ? 'Creating...' : 'Create Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

