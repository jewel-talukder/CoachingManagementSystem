'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { Calendar, Users, BookOpen, Clock, ChevronRight } from 'lucide-react';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardApi.getTeacher();
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
              <h1 className="text-xl font-bold text-blue-600">Teacher Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => window.location.href = '/teacher/attendance/self'}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md p-4 text-white hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-between group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm mr-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Self Check-In</h3>
                  <p className="text-blue-100 text-sm">Mark your daily attendance</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => window.location.href = '/teacher/attendance/mark'}
              className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-gray-800 hover:shadow-md transition-all transform hover:-translate-y-1 flex items-center justify-between group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Student Attendance</h3>
                  <p className="text-gray-500 text-sm">Mark attendance for batches</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-md p-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Assigned Batches</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.assignedBatches?.length || 0}
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
                    <p className="text-sm font-medium text-gray-500">Today's Classes</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.todayClasses?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-lg font-medium text-gray-900">
                      {data?.totalStudents || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Assigned Batches
              </h3>
              <div className="space-y-4">
                {data?.assignedBatches?.map((batch: any) => (
                  <div key={batch.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{batch.name}</h4>
                        <p className="text-sm text-gray-500">{batch.courseName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Students: {batch.currentStudents}/{batch.maxStudents}
                        </p>
                      </div>
                      <div className="text-right">
                        {batch.startTime && batch.endTime && (
                          <p className="text-sm text-gray-500">
                            {batch.startTime} - {batch.endTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

