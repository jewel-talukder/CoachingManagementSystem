'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { examsApi } from '@/lib/api';
import { api } from '@/lib/api';

const examSchema = z.object({
  subjectId: z.number().min(1, 'Subject is required'),
  teacherId: z.number().optional(),
  name: z.string().min(1, 'Exam name is required'),
  description: z.string().optional(),
  examType: z.enum(['Regular', 'MidTerm', 'Final']),
  examDate: z.string().min(1, 'Exam date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalMarks: z.number().min(1, 'Total marks is required'),
  passingMarks: z.number().min(0, 'Passing marks is required'),
});

type ExamFormData = z.infer<typeof examSchema>;

export default function NewExamPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      // Note: You may need to create a subjects API endpoint
      // For now, we'll use a placeholder
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      // Set empty array if endpoint doesn't exist yet
      setSubjects([]);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      examType: 'Regular',
    },
  });

  const onSubmit = async (data: ExamFormData) => {
    setError(null);
    setLoading(true);

    try {
      const examData = {
        ...data,
        examDate: new Date(data.examDate).toISOString(),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
      };
      await examsApi.create(examData);
      router.push('/teacher/exams');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Create Exam</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Exam Name *
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
                <label htmlFor="examType" className="block text-sm font-medium text-gray-700">
                  Exam Type *
                </label>
                <select
                  {...register('examType')}
                  id="examType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="Regular">Regular</option>
                  <option value="MidTerm">Mid-Term</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div>
                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <select
                  {...register('subjectId', { valueAsNumber: true })}
                  id="subjectId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="examDate" className="block text-sm font-medium text-gray-700">
                  Exam Date *
                </label>
                <input
                  {...register('examDate')}
                  type="date"
                  id="examDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
                {errors.examDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.examDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  {...register('startTime')}
                  type="time"
                  id="startTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  {...register('endTime')}
                  type="time"
                  id="endTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">
                  Total Marks *
                </label>
                <input
                  {...register('totalMarks', { valueAsNumber: true })}
                  type="number"
                  id="totalMarks"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
                {errors.totalMarks && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalMarks.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="passingMarks" className="block text-sm font-medium text-gray-700">
                  Passing Marks *
                </label>
                <input
                  {...register('passingMarks', { valueAsNumber: true })}
                  type="number"
                  id="passingMarks"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
                {errors.passingMarks && (
                  <p className="mt-1 text-sm text-red-600">{errors.passingMarks.message}</p>
                )}
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
                {loading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

