'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { usersApi, coursesApi, batchesApi, enrollmentsApi, branchesApi } from '@/lib/api';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useToastStore } from '@/lib/store/toastStore';
import { useBranchStore } from '@/lib/store/branchStore';
import { ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewStudentPage() {
  const router = useRouter();
  const { paymentMode } = useSettingsStore();
  const { addToast } = useToastStore();
  const { selectedBranch } = useBranchStore();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [paymentDue, setPaymentDue] = useState<number | null>(null);
  const [enableEnrollment, setEnableEnrollment] = useState(false);

  const [formData, setFormData] = useState({
    branchId: selectedBranch?.id?.toString() || '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    studentCode: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    courseId: '',
    batchId: '',
    totalFee: '',
    feePaid: '',
  });

  useEffect(() => {
    fetchBranches();
    fetchCourses();
  }, []);

  useEffect(() => {
    // Update branchId in formData when selectedBranch changes (only if not already set)
    if (selectedBranch?.id && !formData.branchId) {
      setFormData((prev) => ({ ...prev, branchId: selectedBranch.id.toString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedCourse) {
      fetchBatches(selectedCourse);
    } else {
      setBatches([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (enableEnrollment) {
      calculatePaymentDue();
    } else {
      setPaymentDue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableEnrollment, formData.courseId, formData.batchId, formData.totalFee, formData.feePaid, paymentMode, courses.length, batches.length]);

  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll();
      const branchesData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data) 
        ? response.data.data 
        : [];
      setBranches(branchesData);
      
      // Set default branch if not already set
      if (branchesData.length > 0) {
        setFormData((prev) => {
          if (!prev.branchId) {
            const defaultBranch = branchesData.find((b: any) => b.isDefault) || branchesData[0];
            return { ...prev, branchId: defaultBranch.id.toString() };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      addToast('Failed to load branches', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll({ isActive: true });
      // Handle different response structures
      const coursesData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data) 
        ? response.data.data 
        : [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
      addToast('Failed to load courses', 'error');
    }
  };

  const fetchBatches = async (courseId: number) => {
    try {
      const response = await batchesApi.getAll({ courseId, isActive: true });
      // Handle different response structures
      const batchesData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data) 
        ? response.data.data 
        : [];
      setBatches(batchesData);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      setBatches([]);
    }
  };

  const calculatePaymentDue = () => {
    if (!formData.courseId || !formData.batchId || courses.length === 0) {
      setPaymentDue(null);
      return;
    }

    try {
      const courseId = parseInt(formData.courseId);
      const batchId = parseInt(formData.batchId);

      if (isNaN(courseId) || isNaN(batchId)) {
        setPaymentDue(null);
        return;
      }

      const course = courses.find((c) => c.id === courseId);
      const batch = batches.find((b) => b.id === batchId);

      if (course && batch) {
        const totalFee = parseFloat(formData.totalFee) || parseFloat(course.fee) || 0;
        const feePaid = parseFloat(formData.feePaid) || 0;

        if (paymentMode === 'monthly') {
          // For monthly: calculate monthly fee (assuming course fee is total, divide by months)
          // You can adjust this logic based on your business rules
          const monthlyFee = totalFee / 12; // Assuming 12 months
          setPaymentDue(Math.max(0, monthlyFee - feePaid));
        } else {
          // For batch-wise: show batch/course fee
          setPaymentDue(Math.max(0, totalFee - feePaid));
        }
      } else {
        setPaymentDue(null);
      }
    } catch (error) {
      console.error('Error calculating payment due:', error);
      setPaymentDue(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create student user
      const userResponse = await usersApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        roleIds: [4], // Student role ID - adjust if needed
        userType: 'Student',
        additionalData: {
          BranchId: formData.branchId ? parseInt(formData.branchId) : null,
          StudentCode: formData.studentCode,
          DateOfBirth: formData.dateOfBirth,
          ParentName: formData.parentName,
          ParentPhone: formData.parentPhone,
        },
      });

      const studentId = userResponse.data?.id || userResponse.data?.data?.id;

      if (!studentId) {
        throw new Error('Failed to get student ID from response');
      }

      // Create enrollment if enabled and course and batch are selected
      if (enableEnrollment && formData.courseId && formData.batchId) {
        const courseId = parseInt(formData.courseId);
        const batchId = parseInt(formData.batchId);
        
        if (isNaN(courseId) || isNaN(batchId)) {
          throw new Error('Invalid course or batch ID');
        }

        await enrollmentsApi.create({
          studentId: studentId,
          courseId: courseId,
          batchId: batchId,
          totalFee: formData.totalFee ? parseFloat(formData.totalFee) : null,
          feePaid: formData.feePaid ? parseFloat(formData.feePaid) : null,
        });
        addToast('Student enrolled successfully!', 'success');
      }

      addToast('Student created successfully!', 'success');
      router.push('/admin/students');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <Link
          href="/admin/students"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
          <p className="mt-1 text-sm text-gray-500">
            Payment Mode: <span className="font-semibold capitalize">{paymentMode}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Student Information</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} {branch.isDefault && '(Default)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Code</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Enrollment & Payment</h2>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableEnrollment}
                      onChange={(e) => {
                        setEnableEnrollment(e.target.checked);
                        if (!e.target.checked) {
                          // Clear enrollment fields when unchecked
                          setFormData({ ...formData, courseId: '', batchId: '', totalFee: '', feePaid: '' });
                          setSelectedCourse(null);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enroll Student</span>
                  </label>
                </div>
                
                {enableEnrollment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => {
                        setSelectedCourse(parseInt(e.target.value));
                        setFormData({ ...formData, courseId: e.target.value, batchId: '' });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select
                      value={formData.batchId}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      disabled={!selectedCourse}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name} ({batch.currentStudents}/{batch.maxStudents})
                        </option>
                      ))}
                    </select>
                  </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.totalFee}
                          onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Paid</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.feePaid}
                          onChange={(e) => setFormData({ ...formData, feePaid: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Enable enrollment to assign course and batch to this student
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>

          {/* Payment Due Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Payment Information
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Payment Mode</div>
                  <div className="text-lg font-semibold text-blue-900 capitalize">{paymentMode}</div>
                </div>

                {enableEnrollment && paymentDue !== null ? (
                  <>
                    <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {paymentMode === 'monthly' ? 'Monthly Payment Due' : 'Batch Payment Due'}
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        ${paymentDue !== null ? paymentDue.toFixed(2) : '0.00'}
                      </div>
                    </div>

                    {formData.totalFee && !isNaN(parseFloat(formData.totalFee)) && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Fee</div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${parseFloat(formData.totalFee).toFixed(2)}
                        </div>
                      </div>
                    )}

                    {formData.feePaid && !isNaN(parseFloat(formData.feePaid)) && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Fee Paid</div>
                        <div className="text-lg font-semibold text-green-900">
                          ${parseFloat(formData.feePaid).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </>
                ) : enableEnrollment ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Select course and batch to calculate payment due
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Enable enrollment to see payment information
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

