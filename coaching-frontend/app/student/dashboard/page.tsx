'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { BookOpen, Calendar, Award } from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardApi.getStudent();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Student Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-md p-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.enrollments?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Attendance</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.attendanceSummary?.percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-md p-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.upcomingExams?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  My Enrollments
                </h3>
                <div className="space-y-4">
                  {data?.enrollments?.map((enrollment: any) => (
                    <div key={enrollment.id} className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {enrollment.courseName}
                      </h4>
                      <p className="text-sm text-gray-500">{enrollment.batchName}</p>
                      {enrollment.teacherName && (
                        <p className="text-sm text-gray-500">Teacher: {enrollment.teacherName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Upcoming Exams
                </h3>
                <div className="space-y-4">
                  {data?.upcomingExams?.map((exam: any) => (
                    <div key={exam.id} className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900">{exam.name}</h4>
                      <p className="text-sm text-gray-500">{exam.subjectName}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(exam.examDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

