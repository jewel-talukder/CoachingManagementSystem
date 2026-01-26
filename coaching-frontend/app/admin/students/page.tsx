'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { usersApi, enrollmentsApi } from '@/lib/api';
import { Plus, Search, DollarSign, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useToastStore } from '@/lib/store/toastStore';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { paymentMode } = useSettingsStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, enrollmentsRes] = await Promise.all([
        usersApi.getAll({ role: 'Student' }),
        enrollmentsApi.getAll({ status: 'Active' }),
      ]);
      setStudents(studentsRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email?.toLowerCase() || '';
    const phone = student.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  // Get student enrollments
  const getStudentEnrollments = (studentId: number) => {
    return enrollments.filter((e) => e.studentId === studentId);
  };

  const handleDelete = async (studentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(studentId);
    try {
      await usersApi.delete(studentId);
      addToast('Student deleted successfully', 'success');
      fetchData(); // Refresh the list
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete student', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate payment due for a student
  const calculatePaymentDue = (student: any) => {
    const studentEnrollments = getStudentEnrollments(student.id);
    if (studentEnrollments.length === 0) {
      return { due: 0, status: 'no-enrollment', text: 'No Enrollment' };
    }

    let totalDue = 0;
    let totalPaid = 0;
    let totalFee = 0;

    studentEnrollments.forEach((enrollment) => {
      const fee = parseFloat(enrollment.totalFee) || 0;
      const paid = parseFloat(enrollment.feePaid) || 0;

      if (paymentMode === 'monthly') {
        // For monthly: calculate monthly fee
        const monthlyFee = fee / 12; // Assuming 12 months
        const monthsSinceEnrollment = Math.ceil(
          (new Date().getTime() - new Date(enrollment.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        const totalDueForEnrollment = monthlyFee * monthsSinceEnrollment;
        totalDue += Math.max(0, totalDueForEnrollment - paid);
        totalPaid += paid;
        totalFee += totalDueForEnrollment;
      } else {
        // For batch-wise: show batch/course fee
        totalDue += Math.max(0, fee - paid);
        totalPaid += paid;
        totalFee += fee;
      }
    });

    return {
      due: totalDue,
      paid: totalPaid,
      total: totalFee,
      status: totalDue > 0 ? 'pending' : 'paid',
      text: totalDue > 0 ? `$${totalDue.toFixed(2)} Due` : 'Paid',
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="mt-1 text-sm text-gray-500">
              Payment Mode: <span className="font-semibold capitalize">{paymentMode}</span>
            </p>
          </div>
          <Link
            href="/admin/students/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Student
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Due
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {student.phone || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const payment = calculatePaymentDue(student);
                        return (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'no-enrollment'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.text}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const payment = calculatePaymentDue(student);
                        if (payment.status === 'no-enrollment') {
                          return <span className="text-gray-400">-</span>;
                        }
                        return (
                          <div className="flex items-center">
                            <DollarSign className={`h-4 w-4 mr-1 ${payment.due > 0 ? 'text-red-500' : 'text-green-500'}`} />
                            <span className={payment.due > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                              ${payment.due.toFixed(2)}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/students/${student.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                          disabled={deletingId === student.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

