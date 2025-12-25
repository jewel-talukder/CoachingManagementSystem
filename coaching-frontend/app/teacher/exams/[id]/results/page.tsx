'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { examsApi, usersApi } from '@/lib/api';
import { Save } from 'lucide-react';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [examResponse, resultsResponse, studentsResponse] = await Promise.all([
        examsApi.getResults(examId),
        examsApi.getResults(examId),
        usersApi.getAll({ role: 'Student', isActive: true }),
      ]);

      setExam(examResponse.data.exam || examResponse.data);
      setResults(examResponse.data.results || []);
      setStudents(studentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId: number, marks: number) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.studentId === studentId);
      if (existing) {
        return prev.map((r) =>
          r.studentId === studentId ? { ...r, marksObtained: marks } : r
        );
      } else {
        return [...prev, { studentId, marksObtained: marks, totalMarks: exam?.totalMarks || 100 }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resultsData = results.map((r) => ({
        studentId: r.studentId,
        marksObtained: r.marksObtained || 0,
        remarks: r.remarks || '',
      }));

      await examsApi.uploadResults(examId, { results: resultsData });
      alert('Results saved successfully!');
      router.push('/teacher/exams');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const studentsWithResults = students.map((student) => {
    const result = results.find((r) => r.studentId === student.id);
    return {
      ...student,
      marksObtained: result?.marksObtained || 0,
      totalMarks: exam?.totalMarks || 100,
      grade: result?.grade || '',
      remarks: result?.remarks || '',
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                {exam?.name || 'Exam'} - Results
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">{exam?.name}</h2>
            <p className="text-sm text-gray-500">
              Total Marks: {exam?.totalMarks} | Passing Marks: {exam?.passingMarks}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks Obtained
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsWithResults.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max={exam?.totalMarks || 100}
                        value={student.marksObtained}
                        onChange={(e) =>
                          handleMarksChange(student.id, Number(e.target.value))
                        }
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.marksObtained > 0
                        ? calculateGrade(student.marksObtained, student.totalMarks, exam?.passingMarks || 40)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => {
                          setResults((prev) =>
                            prev.map((r) =>
                              r.studentId === student.id
                                ? { ...r, remarks: e.target.value }
                                : r
                            )
                          );
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                        placeholder="Remarks"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function calculateGrade(marksObtained: number, totalMarks: number, passingMarks: number): string {
  const percentage = (marksObtained / totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= passingMarks) return 'C';
  return 'F';
}

