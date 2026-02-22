'use client';

import { useEffect, useState } from 'react';
import { enrollmentsApi } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToastStore } from '@/lib/store/toastStore';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentsApi.getAll();
      setEnrollments(response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      addToast('Failed to fetch enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      setDeletingId(id);
      await enrollmentsApi.delete(id);
      addToast('Enrollment deleted successfully', 'success');
      fetchEnrollments();
    } catch (error: any) {
      console.error('Failed to delete enrollment:', error);
      addToast(error.response?.data?.message || 'Failed to delete enrollment', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
        <Link
          href="/admin/enrollments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Enrollment
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrollment Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No enrollments found
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {enrollment.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.batchName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.enrollmentType === 'BatchWise' ? 'Monthly' : 'Course Wise'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{enrollment.feePaid || 0} / ₹{enrollment.totalFee || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enrollment.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : enrollment.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/admin/enrollments/${enrollment.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        disabled={deletingId === enrollment.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {enrollment.status === 'Active' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await enrollmentsApi.complete(enrollment.id);
                                addToast('Enrollment completed successfully', 'success');
                                fetchEnrollments();
                              } catch (error: any) {
                                addToast(error.response?.data?.message || 'Failed to complete enrollment', 'error');
                              }
                            }}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Complete
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await enrollmentsApi.cancel(enrollment.id);
                                addToast('Enrollment cancelled successfully', 'success');
                                fetchEnrollments();
                              } catch (error: any) {
                                addToast(error.response?.data?.message || 'Failed to cancel enrollment', 'error');
                              }
                            }}
                            className="text-orange-600 hover:text-orange-900 text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
