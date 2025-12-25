'use client';

import { useEffect, useState } from 'react';
import { examsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { FileText, Calendar, Award } from 'lucide-react';

export default function StudentExamsPage() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await examsApi.getStudentExams(user.id);
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
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

  const upcomingExams = exams.filter(
    (exam) => new Date(exam.examDate) >= new Date() && !exam.result
  );
  const pastExams = exams.filter(
    (exam) => new Date(exam.examDate) < new Date() || exam.result
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">My Exams</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {upcomingExams.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Exams</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <FileText className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
                        <p className="text-sm text-gray-500">{exam.subjectName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(exam.examDate).toLocaleDateString()}
                      </div>
                      {exam.startTime && exam.endTime && (
                        <p className="text-sm text-gray-600">
                          Time: {exam.startTime} - {exam.endTime}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Total Marks: {exam.totalMarks} | Passing: {exam.passingMarks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastExams.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Exams & Results</h2>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastExams.map((exam) => (
                      <tr key={exam.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {exam.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.result ? (
                            <>
                              {exam.result.marksObtained} / {exam.result.totalMarks}
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exam.result ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                exam.result.grade === 'A+' || exam.result.grade === 'A'
                                  ? 'bg-green-100 text-green-800'
                                  : exam.result.grade === 'B+' || exam.result.grade === 'B'
                                  ? 'bg-blue-100 text-blue-800'
                                  : exam.result.grade === 'C+' || exam.result.grade === 'C'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {exam.result.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {exams.length === 0 && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exams found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

