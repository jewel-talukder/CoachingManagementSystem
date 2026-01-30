'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { enrollmentsApi, usersApi, paymentsApi } from '@/lib/api';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { DollarSign, Search, AlertCircle, CheckCircle, HandCoins, X } from 'lucide-react';
import { useToastStore } from '@/lib/store/toastStore';

export default function PaymentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'Cash',
    remarks: '',
    transactionId: '',
  });

  const { addToast } = useToastStore();
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
      const monthlyFee = totalFee / 12; // Simplified
      const monthsSinceEnrollment = Math.max(1, Math.ceil(
        (new Date().getTime() - new Date(enrollment.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      ));
      const totalDue = monthlyFee * monthsSinceEnrollment;
      return {
        due: Math.max(0, totalDue - feePaid),
        total: totalDue,
        paid: feePaid,
        status: feePaid >= totalDue ? 'paid' : 'pending',
      };
    } else {
      return {
        due: Math.max(0, totalFee - feePaid),
        total: totalFee,
        paid: feePaid,
        status: feePaid >= totalFee ? 'paid' : 'pending',
      };
    }
  };

  const getStudentInfo = (studentId: number) => {
    return students.find((s) => s.id === studentId || s.studentId === studentId);
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const student = getStudentInfo(enrollment.studentId);
    if (!student) return false;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email?.toLowerCase() || '';
    const phone = student.phone || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  const pendingPayments = filteredEnrollments.filter((e) => {
    const payment = calculatePaymentDue(e);
    return payment.status === 'pending';
  });

  const paidPayments = filteredEnrollments.filter((e) => {
    const payment = calculatePaymentDue(e);
    return payment.status === 'paid';
  });

  const openPaymentModal = (enrollment: any) => {
    const payment = calculatePaymentDue(enrollment);
    setSelectedEnrollment(enrollment);
    setPaymentForm({
      amount: payment.due,
      paymentMethod: 'Cash',
      remarks: '',
      transactionId: '',
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setSubmitting(true);
    try {
      await paymentsApi.create({
        studentId: selectedEnrollment.studentId,
        enrollmentId: selectedEnrollment.id,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        remarks: paymentForm.remarks,
        transactionId: paymentForm.transactionId,
      });

      addToast('Payment collected successfully!', 'success');
      setShowPaymentModal(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
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
                  {pendingPayments.reduce((sum, e) => sum + calculatePaymentDue(e).due, 0).toFixed(2)} Taka
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
              placeholder="Search students by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Payment Due Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md overflow-x-auto">
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
                  {paymentMode === 'monthly' ? 'Monthly Target' : 'Total Course Fee'}
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
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
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Course: {enrollment.courseName || enrollment.course?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Batch: {enrollment.batchName || enrollment.batch?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-center">
                        {payment.total.toFixed(0)} TK
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-center">
                        {payment.paid.toFixed(0)} TK
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-bold ${payment.due > 0 ? 'text-red-600' : 'text-green-600'
                            }`}
                        >
                          {payment.due.toFixed(0)} TK
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.due > 0 && (
                          <button
                            onClick={() => openPaymentModal(enrollment)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <HandCoins className="w-4 h-4 mr-1" />
                            Collect
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <HandCoins className="w-5 h-5 mr-2 text-blue-600" />
                      Collect Payment
                    </h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student</label>
                      <input
                        type="text"
                        disabled
                        value={(() => {
                          const s = getStudentInfo(selectedEnrollment?.studentId);
                          return s ? `${s.firstName} ${s.lastName}` : '';
                        })()}
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course / Batch</label>
                      <input
                        type="text"
                        disabled
                        value={`${selectedEnrollment?.courseName || ''} / ${selectedEnrollment?.batchName || ''}`}
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Collect (TK) *</label>
                      <input
                        type="number"
                        id="amount"
                        required
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <select
                        id="paymentMethod"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank">Bank Transfer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">Transaction ID (Optional)</label>
                      <input
                        type="text"
                        id="transactionId"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g. TRX123456"
                      />
                    </div>

                    <div>
                      <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
                      <textarea
                        id="remarks"
                        rows={2}
                        value={paymentForm.remarks}
                        onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Any additional notes..."
                      />
                    </div>

                    <div className="mt-5 sm:mt-6 flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : 'Collect Payment'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

