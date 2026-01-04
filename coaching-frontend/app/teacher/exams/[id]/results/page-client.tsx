'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { examsApi } from '@/lib/api';

export default function ExamResultsPageClient() {
  const params = useParams();
  const examId = Number(params.id);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (examId) {
      fetchExam();
      fetchResults();
    }
  }, [examId]);

  const fetchExam = async () => {
    try {
      setFetching(true);
      const response = await examsApi.getAll();
      const exams = response.data.data || response.data;
      const foundExam = Array.isArray(exams) ? exams.find((e: any) => e.id === examId) : null;
      if (foundExam) {
        setExam(foundExam);
      }
    } catch (error) {
      console.error('Failed to fetch exam:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await examsApi.getResults(examId);
      setResults(response.data || []);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Exam Results</h1>
      {exam && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">{exam.name}</h2>
          <p className="text-gray-600">{exam.description}</p>
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Results</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">No results available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result: any) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{result.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.marksObtained} / {result.totalMarks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.marksObtained >= result.passingMarks ? (
                        <span className="text-green-600">Pass</span>
                      ) : (
                        <span className="text-red-600">Fail</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

