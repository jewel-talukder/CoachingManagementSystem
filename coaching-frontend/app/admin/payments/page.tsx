'use client';

import { useEffect, useState, useMemo } from 'react';
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
    studentId: 0,
    enrollmentId: 0,
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
      const enrollDate = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate) : new Date();
      const monthsSinceEnrollment = Math.max(1, Math.ceil(
        (new Date().getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
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

  const openPaymentModal = (enrollment?: any) => {
    if (enrollment) {
      const payment = calculatePaymentDue(enrollment);
      setSelectedEnrollment(enrollment);
      setPaymentForm({
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        amount: payment.due > 0 ? payment.due : 0,
        paymentMethod: 'Cash',
        remarks: '',
        transactionId: '',
      });
    } else {
      setSelectedEnrollment(null);
      setPaymentForm({
        studentId: 0,
        enrollmentId: 0,
        amount: 0,
        paymentMethod: 'Cash',
        remarks: '',
        transactionId: '',
      });
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.studentId || paymentForm.amount <= 0) {
      addToast('Please select a student and enter a valid amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await paymentsApi.create({
        studentId: paymentForm.studentId,
        enrollmentId: paymentForm.enrollmentId || undefined,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        remarks: paymentForm.remarks,
        transactionId: paymentForm.transactionId,
      });

      addToast('Payment recorded successfully!', 'success');
      setShowPaymentModal(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const studentEnrollments = useMemo(() => {
    if (!paymentForm.studentId) return [];
    return enrollments.filter(e => e.studentId === paymentForm.studentId);
  }, [paymentForm.studentId, enrollments]);

  const selectedStudentTotalDue = useMemo(() => {
    if (!paymentForm.studentId) return 0;
    return studentEnrollments.reduce((sum, e) => sum + calculatePaymentDue(e).due, 0);
  }, [studentEnrollments]);

  // Handle student change
  const handleStudentChange = (studentId: number) => {
    const enrollmentsForStudent = enrollments.filter(e => e.studentId === studentId);
    const totalDue = enrollmentsForStudent.reduce((sum, e) => sum + calculatePaymentDue(e).due, 0);

    setPaymentForm(prev => ({
      ...prev,
      studentId: studentId,
      enrollmentId: enrollmentsForStudent.length === 1 ? enrollmentsForStudent[0].id : 0,
      amount: totalDue > 0 ? totalDue : 0
    }));
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-8 h-8 mr-3 text-blue-600" />
              Payment Due
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Payment Mode: <span className="font-semibold capitalize">{paymentMode}</span> - View and manage student payment dues
            </p>
          </div>
          <button
            onClick={() => openPaymentModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HandCoins className="w-5 h-5 mr-2" />
            New Payment
          </button>
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
                <p className="text-sm font-medium text-gray-600">Paid Items</p>
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
                <p className="text-sm font-medium text-gray-600">Total Pending Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingPayments.reduce((sum, e) => sum + calculatePaymentDue(e).due, 0).toFixed(0)} TK
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {paymentMode === 'monthly' ? 'Monthly Target' : 'Total Course Fee'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div>{enrollment.courseName || enrollment.course?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Batch: {enrollment.batchName || enrollment.batch?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-center">
                        {payment.total.toFixed(0)} TK
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-center">
                        {payment.paid.toFixed(0)} TK
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-bold ${payment.due > 0 ? 'text-red-600' : 'text-green-600'
                            }`}
                        >
                          {payment.due.toFixed(0)} TK
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
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
                        <button
                          onClick={() => openPaymentModal(enrollment)}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${payment.due > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          <HandCoins className="w-4 h-4 mr-1" />
                          Collect
                        </button>
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
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop Overlay */}
              <div
                className="fixed inset-0 transition-opacity backdrop-blur-[2px]"
                aria-hidden="true"
                onClick={() => setShowPaymentModal(false)}
              >
                <div className="absolute inset-0 bg-slate-900/40"></div>
              </div>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              {/* Modal Content - Added relative z-10 for perfect stacking */}
              <div className="relative z-10 inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:max-w-xl sm:w-full border border-gray-100">
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-5">
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900 flex items-center tracking-tight">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                          <HandCoins className="w-6 h-6 text-blue-600" />
                        </div>
                        Record Payment
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 font-medium">Record a new manual payment transaction</p>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 italic">
                        Select Student <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!!selectedEnrollment}
                        value={paymentForm.studentId}
                        onChange={(e) => handleStudentChange(parseInt(e.target.value))}
                        className="block w-full border-2 border-gray-100 rounded-xl py-3 px-4 text-gray-900 font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white transition-all appearance-none cursor-pointer hover:border-gray-200"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Length: 19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                      >
                        <option value="0">--- Click to Select a Student ---</option>
                        {students.map(s => (
                          <option key={s.id} value={s.studentId || 0}>{s.firstName} {s.lastName} ({s.studentCode || s.phone})</option>
                        ))}
                      </select>
                    </div>

                    {paymentForm.studentId > 0 && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-blue-200/50 transform hover:scale-[1.02] transition-transform">
                        <div className="flex items-center text-white">
                          <div className="p-2 bg-white/20 rounded-lg mr-3 backdrop-blur-md">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-xs uppercase font-bold tracking-widest opacity-80">Payment Due</span>
                            <div className="text-sm font-medium">Outstanding Balance</div>
                          </div>
                        </div>
                        <span className="text-3xl font-black text-white">
                          ৳ {selectedStudentTotalDue.toFixed(0)}
                        </span>
                      </div>
                    )}

                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Assign to Course</label>
                        <select
                          disabled={!!selectedEnrollment || !paymentForm.studentId}
                          value={paymentForm.enrollmentId}
                          onChange={(e) => {
                            const eid = parseInt(e.target.value);
                            const enrollment = studentEnrollments.find(e => e.id === eid);
                            const dueAmt = eid === 0 ? selectedStudentTotalDue : calculatePaymentDue(enrollment).due;
                            setPaymentForm({ ...paymentForm, enrollmentId: eid, amount: dueAmt > 0 ? dueAmt : 0 });
                          }}
                          className="block w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-all"
                        >
                          <option value="0">General Account (Apply to All Dues)</option>
                          {studentEnrollments.map(e => {
                            const p = calculatePaymentDue(e);
                            return (
                              <option key={e.id} value={e.id}>
                                {e.courseName || e.course?.name} - ৳ {p.due.toFixed(0)} Due
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="amount" className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Payment Amount <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <input
                              type="number"
                              id="amount"
                              required
                              min="1"
                              value={paymentForm.amount || ''}
                              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                              className="block w-full pl-11 pr-4 border border-gray-200 rounded-xl py-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg font-bold text-gray-900 shadow-sm transition-all group-hover:border-gray-300"
                              placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-xl font-bold text-gray-300 transition-colors group-focus-within:text-blue-500">৳</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="paymentMethod" className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Method</label>
                          <select
                            id="paymentMethod"
                            value={paymentForm.paymentMethod}
                            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                            className="block w-full border border-gray-200 rounded-xl py-3.5 px-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm font-bold bg-white shadow-sm"
                          >
                            <option value="Cash">Cash (Manual)</option>
                            <option value="Bkash">Bkash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Upay">Upay</option>
                            <option value="Bank">Bank Transfer</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label htmlFor="transactionId" className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Transaction ID / Reference</label>
                        <input
                          type="text"
                          id="transactionId"
                          value={paymentForm.transactionId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                          className="block w-full border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 placeholder-gray-300 bg-white"
                          placeholder="Record external reference if any..."
                        />
                      </div>

                      <div>
                        <label htmlFor="remarks" className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Internal Notes</label>
                        <textarea
                          id="remarks"
                          rows={2}
                          value={paymentForm.remarks}
                          onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                          className="block w-full border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 placeholder-gray-300 bg-white resize-none"
                          placeholder="e.g., Late payment accepted with waiver..."
                        />
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-reverse space-y-3 sm:space-y-0 pt-8 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="inline-flex justify-center items-center px-8 py-3.5 border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all hover:border-gray-300"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center items-center px-10 py-3.5 border border-transparent shadow-[0_10px_30px_rgba(37,99,235,0.3)] text-base font-black rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all transform active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-3"></div>
                            Processing...
                          </>
                        ) : (
                          'Confirm & Save'
                        )}
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

