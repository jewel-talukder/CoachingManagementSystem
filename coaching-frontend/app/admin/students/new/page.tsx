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
  const [paymentDue, setPaymentDue] = useState<number | null>(null);
  const [enableEnrollment, setEnableEnrollment] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<'course' | 'batch' | null>(null);

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
    if (enableEnrollment && enrollmentType) {
      if (enrollmentType === 'batch') {
        fetchBatches();
      } else if (enrollmentType === 'course') {
        // For course-wise, we'll fetch batches when course is selected
        setBatches([]);
      }
    } else {
      setBatches([]);
    }
  }, [enableEnrollment, enrollmentType]);

  useEffect(() => {
    if (enableEnrollment && enrollmentType) {
      calculatePaymentDue();
    } else {
      setPaymentDue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableEnrollment, enrollmentType, formData.courseId, formData.batchId, formData.totalFee, formData.feePaid, paymentMode, courses.length, batches.length]);

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

  const fetchBatches = async () => {
    try {
      const response = await batchesApi.getAll({ isActive: true });
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

  // Fetch batches when course is selected (for course-wise enrollment)
  useEffect(() => {
    if (enrollmentType === 'course' && formData.courseId) {
      // For course-wise, fetch all batches (needed for auto-selection in background)
      fetchBatches();
    }
  }, [enrollmentType, formData.courseId]);

  // Fetch courses when batch is selected (for batch-wise enrollment)
  useEffect(() => {
    if (enrollmentType === 'batch' && formData.batchId) {
      // Courses are already loaded, just ensure they're available
    }
  }, [enrollmentType, formData.batchId]);

  // Auto-calculate TotalFee based on enrollment type
  useEffect(() => {
    if (!enableEnrollment || !enrollmentType) {
      setFormData((prev) => ({ ...prev, totalFee: '' }));
      return;
    }

    if (enrollmentType === 'course' && formData.courseId) {
      // Course-wise: Use course fee only
      const courseId = parseInt(formData.courseId);
      if (!isNaN(courseId)) {
        const course = courses.find((c) => c.id === courseId);
        if (course && course.fee) {
          setFormData((prev) => ({ ...prev, totalFee: course.fee.toFixed(2) }));
        }
      }
    } else if (enrollmentType === 'batch' && formData.batchId) {
      // Batch-wise: Use batch monthly fee only (no course shown to user)
      const batchId = parseInt(formData.batchId);
      if (!isNaN(batchId)) {
        const batch = batches.find((b) => b.id === batchId);
        if (batch && batch.monthlyFee) {
          // For batch-wise, use monthly fee as total
          setFormData((prev) => ({ ...prev, totalFee: batch.monthlyFee.toFixed(2) }));
        }
      }
    }
  }, [enrollmentType, formData.courseId, formData.batchId, courses, batches, enableEnrollment]);

  // Auto-select missing field in background (required by API but not shown to user)
  useEffect(() => {
    if (!enableEnrollment || !enrollmentType) return;

    if (enrollmentType === 'course' && formData.courseId && !formData.batchId && batches.length > 0) {
      // Auto-select first batch in background for course-wise
      setFormData((prev) => ({ ...prev, batchId: batches[0].id.toString() }));
    } else if (enrollmentType === 'batch' && formData.batchId && !formData.courseId && courses.length > 0) {
      // Auto-select first course in background for batch-wise
      setFormData((prev) => ({ ...prev, courseId: courses[0].id.toString() }));
    }
  }, [enrollmentType, formData.courseId, formData.batchId, courses, batches, enableEnrollment]);

  const calculatePaymentDue = () => {
    if (!enableEnrollment || !enrollmentType) {
      setPaymentDue(null);
      return;
    }

    try {
      if (enrollmentType === 'course' && formData.courseId) {
        const courseId = parseInt(formData.courseId);
        if (isNaN(courseId)) {
          setPaymentDue(null);
          return;
        }
        const course = courses.find((c) => c.id === courseId);
        if (course) {
          const totalFee = parseFloat(formData.totalFee) || 0;
          const feePaid = parseFloat(formData.feePaid) || 0;
          setPaymentDue(Math.max(0, totalFee - feePaid));
        } else {
          setPaymentDue(null);
        }
      } else if (enrollmentType === 'batch' && formData.batchId) {
        const batchId = parseInt(formData.batchId);
        if (isNaN(batchId)) {
          setPaymentDue(null);
          return;
        }
        const batch = batches.find((b) => b.id === batchId);
        if (batch) {
          const totalFee = parseFloat(formData.totalFee) || 0;
          const feePaid = parseFloat(formData.feePaid) || 0;
          if (paymentMode === 'monthly') {
            // For monthly: calculate monthly fee from batch monthly fee
            const monthlyFee = batch.monthlyFee || 0;
            setPaymentDue(Math.max(0, monthlyFee - feePaid));
          } else {
            // For batch-wise: show total fee minus paid
            setPaymentDue(Math.max(0, totalFee - feePaid));
          }
        } else {
          setPaymentDue(null);
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

      const studentId = userResponse.data?.studentId || userResponse.data?.id || userResponse.data?.data?.id;

      if (!studentId) {
        throw new Error('Failed to get student ID from response');
      }

      // Create enrollment if enabled and enrollment type is selected with required fields
      if (enableEnrollment && enrollmentType) {
        let finalCourseId: number;
        let finalBatchId: number;

        if (enrollmentType === 'course' && formData.courseId) {
          finalCourseId = parseInt(formData.courseId);
          if (isNaN(finalCourseId)) {
            throw new Error('Invalid course ID');
          }
          // For course-wise, use auto-selected batch (should be set by useEffect)
          if (!formData.batchId) {
            if (batches.length === 0) {
              throw new Error('No batches available for enrollment');
            }
            finalBatchId = batches[0].id;
          } else {
            finalBatchId = parseInt(formData.batchId);
          }
        } else if (enrollmentType === 'batch' && formData.batchId) {
          finalBatchId = parseInt(formData.batchId);
          if (isNaN(finalBatchId)) {
            throw new Error('Invalid batch ID');
          }
          // For batch-wise, use auto-selected course (should be set by useEffect)
          if (!formData.courseId) {
            if (courses.length === 0) {
              throw new Error('No courses available for enrollment');
            }
            finalCourseId = courses[0].id;
          } else {
            finalCourseId = parseInt(formData.courseId);
          }
        } else {
          throw new Error('Please select course or batch for enrollment');
        }

        if (isNaN(finalCourseId!) || isNaN(finalBatchId!)) {
          throw new Error('Invalid course or batch ID');
        }

        await enrollmentsApi.create({
          studentId: studentId,
          courseId: finalCourseId!,
          batchId: finalBatchId!,
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
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="01XXXXXXXXX"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Phone number will be used as username for login
                    </p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="optional@example.com"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <p className="text-xs text-gray-500 italic">
                      Student Code will be automatically generated.
                    </p>
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
                          setEnrollmentType(null);
                          setBatches([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enroll Student</span>
                  </label>
                </div>

                {enableEnrollment ? (
                  <div className="space-y-4">
                    {/* Enrollment Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enrollment Type *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="enrollmentType"
                            value="course"
                            checked={enrollmentType === 'course'}
                            onChange={(e) => {
                              setEnrollmentType('course');
                              setFormData({ ...formData, courseId: '', batchId: '', totalFee: '', feePaid: '' });
                              setBatches([]);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Course Wise</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="enrollmentType"
                            value="batch"
                            checked={enrollmentType === 'batch'}
                            onChange={(e) => {
                              setEnrollmentType('batch');
                              setFormData({ ...formData, courseId: '', batchId: '', totalFee: '', feePaid: '' });
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Batch Wise</span>
                        </label>
                      </div>
                    </div>

                    {/* Course Wise Enrollment */}
                    {enrollmentType === 'course' && (
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course *
                          </label>
                          <select
                            value={formData.courseId}
                            onChange={(e) => {
                              setFormData({ ...formData, courseId: e.target.value, batchId: '', totalFee: '' });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name} {course.durationMonths ? `(${course.durationMonths} months)` : ''}
                                {course.fee ? ` - ${course.fee} Taka` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Batch Wise Enrollment */}
                    {enrollmentType === 'batch' && (
                      <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Batch *
                          </label>
                          <select
                            value={formData.batchId}
                            onChange={(e) => {
                              setFormData({ ...formData, batchId: e.target.value, courseId: '', totalFee: '' });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Batch</option>
                            {batches.map((batch) => (
                              <option key={batch.id} value={batch.id}>
                                {batch.name} ({batch.currentStudents}/{batch.maxStudents})
                                {batch.monthlyFee ? ` - ${batch.monthlyFee} Taka/month` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {(enrollmentType === 'course' && formData.courseId) ||
                      (enrollmentType === 'batch' && formData.batchId) ? (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Fee (Taka) <span className="text-xs text-gray-500">(Auto-calculated, can be changed)</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.totalFee}
                            onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          {enrollmentType === 'course' && (
                            <p className="mt-1 text-xs text-gray-500">
                              Auto-calculated from course fee. You can modify if needed.
                            </p>
                          )}
                          {enrollmentType === 'batch' && (
                            <p className="mt-1 text-xs text-gray-500">
                              Auto-calculated from batch monthly fee. You can modify if needed.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fee Paid (Taka)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.feePaid}
                            onChange={(e) => setFormData({ ...formData, feePaid: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : null}
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

                {enableEnrollment && enrollmentType && paymentDue !== null ? (
                  <>
                    <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {paymentMode === 'monthly' ? 'Monthly Payment Due' : 'Batch Payment Due'}
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {paymentDue !== null ? `${paymentDue.toFixed(2)} Taka` : '0.00 Taka'}
                      </div>
                    </div>

                    {formData.totalFee && !isNaN(parseFloat(formData.totalFee)) && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Fee</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {parseFloat(formData.totalFee).toFixed(2)} Taka
                        </div>
                      </div>
                    )}

                    {formData.feePaid && !isNaN(parseFloat(formData.feePaid)) && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Fee Paid</div>
                        <div className="text-lg font-semibold text-green-900">
                          {parseFloat(formData.feePaid).toFixed(2)} Taka
                        </div>
                      </div>
                    )}
                  </>
                ) : enableEnrollment && enrollmentType ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    {enrollmentType === 'course'
                      ? 'Select course and batch to calculate payment due'
                      : 'Select batch and course to calculate payment due'}
                  </div>
                ) : enableEnrollment ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Select enrollment type (Course Wise or Batch Wise)
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

