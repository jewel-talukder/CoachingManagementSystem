'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { enrollmentsApi, usersApi } from '@/lib/api';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { DollarSign, Search, AlertCircle, CheckCircle } from 'lucide-react';

export default function PaymentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { paymentMode } = useSettingsStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, studentsRes] = await Promise.all([
        enrollmentsApi.getAll({ status: 'Active' }),
        usersApi.getAll({ role: 'Student' }),
      ]);
      setEnrollments(enrollmentsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate payment due for each enrollment
  const calculatePaymentDue = (enrollment: any) => {
    const totalFee = parseFloat(enrollment.totalFee) || 0;
    const feePaid = parseFloat(enrollment.feePaid) || 0;

    if (paymentMode === 'monthly') {
      // For monthly: calculate monthly fee
      // Assuming course duration is 12 months, adjust as needed
      const monthlyFee = totalFee / 12;
      const monthsSinceEnrollment = Math.ceil(
        (new Date().getTime() - new Date(enrollment.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const totalDue = monthlyFee * monthsSinceEnrollment;
      return {
        due: Math.max(0, totalDue - feePaid),
        total: totalDue,
        paid: feePaid,
        status: feePaid >= totalDue ? 'paid' : 'pending',
      };
    } else {
      // For batch-wise: show batch/course fee
      return {
        due: Math.max(0, totalFee - feePaid),
        total: totalFee,
        paid: feePaid,
        status: feePaid >= totalFee ? 'paid' : 'pending',
      };
    }
  };

  // Get student info
  const getStudentInfo = (studentId: number) => {
    return students.find((s) => s.id === studentId);
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const student = getStudentInfo(enrollment.studentId);
    if (!student) return false;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Group by payment status
  const pendingPayments = filteredEnrollments.filter((e) => {
    const payment = calculatePaymentDue(e);
    return payment.status === 'pending';
  });

  const paidPayments = filteredEnrollments.filter((e) => {
    const payment = calculatePaymentDue(e);
    return payment.status === 'paid';
  });

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-blue-600" />
            Payment Due
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Payment Mode: <span className="font-semibold capitalize">{paymentMode}</span> - View and manage student payment dues
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">{paidPayments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${pendingPayments.reduce((sum, e) => sum + calculatePaymentDue(e).due, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Payment Due Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course/Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {paymentMode === 'monthly' ? 'Monthly Fee' : 'Batch Fee'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No enrollments found matching your search.' : 'No enrollments found.'}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => {
                  const student = getStudentInfo(enrollment.studentId);
                  const payment = calculatePaymentDue(enrollment);
                  if (!student) return null;

                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Course: {enrollment.course?.name || 'N/A'}</div>
                        <div>Batch: {enrollment.batch?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${payment.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${payment.paid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            payment.due > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          ${payment.due.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

