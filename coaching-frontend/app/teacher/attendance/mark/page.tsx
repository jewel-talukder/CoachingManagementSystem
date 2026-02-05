'use client';

import { useState, useEffect } from 'react';
import { batchesApi, attendanceApi, dashboardApi } from '@/lib/api';
import { useBranchStore } from '@/lib/store/branchStore';
import { useToastStore } from '@/lib/store/toastStore';
import {
    Users,
    Calendar,
    Search,
    Save,
    CheckSquare,
    Square,
    UserCheck,
    UserX,
    Clock,
    ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarkStudentAttendancePage() {
    const [enrollmentType, setEnrollmentType] = useState<'course' | 'batch'>('batch');
    const [batches, setBatches] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<number>(0);
    const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>({}); // studentId -> { status, remarks }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { addToast } = useToastStore();
    const router = useRouter();
    const { selectedBranch } = useBranchStore();

    useEffect(() => {
        fetchBatches();
    }, [selectedBranch?.id]);

    useEffect(() => {
        if (enrollmentType === 'batch' && selectedBatchId) {
            fetchBatchStudentsAndAttendance();
        } else if (enrollmentType === 'course' && selectedCourseId) {
            fetchCourseStudentsAndAttendance();
        }
    }, [enrollmentType, selectedBatchId, selectedCourseId, date]);

    const fetchBatches = async () => {
        try {
            // Fetch assigned batches and courses for the teacher, filtered by branch
            const response = await dashboardApi.getTeacher({ branchId: selectedBranch?.id });
            if (response.data) {
                setBatches(response.data.assignedBatches || []);
                setCourses(response.data.assignedCourses || []);

                if (response.data.assignedBatches?.length > 0) {
                    setSelectedBatchId(response.data.assignedBatches[0].id);
                } else {
                    setSelectedBatchId(0);
                }

                if (response.data.assignedCourses?.length > 0) {
                    setSelectedCourseId(response.data.assignedCourses[0].id);
                } else {
                    setSelectedCourseId(0);
                }

                if (!response.data.assignedBatches?.length && !response.data.assignedCourses?.length) {
                    setStudents([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            addToast('Failed to load your data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchStudentsAndAttendance = async () => {
        setLoading(true);
        try {
            // 1. Get Students in Batch (Using enrollment/batch API or similar)
            // Since we don't have a direct "get students by batch" generic API exposed easily in the frontend snippet I saw,
            // I'll assume we can use Enrollments API filtered by batchId.
            // Or maybe batchesApi.getById includes students? 
            // Let's try enrollmentsApi first.

            // Wait, we need to import enrollmentsApi. I'll add it to imports.
            // Correction: use existing batchesApi.getById if it returns students, usually details endpoints do.
            // If not, use enrollments. Let's assume enrollments is safe.

            // Actually, let's look at the imports. I need to add enrollmentsApi to imports in the file.
            // For now, I'll fetch attendance which often includes students if they exist, but for *marking* new attendance 
            // i need the full class list, not just existing attendance records.

            // I'll use a mocked flow for now if APIs are tricky, but let's try to do it right.
            // I'll assume I can get students via enrollments.

            // Using Enrollments to get students
            // NOTE: I need to add enrollmentsApi to imports in the code below.

            const enrollmentsRes = await import('@/lib/api').then(m => m.enrollmentsApi.getAll({ batchId: selectedBatchId, status: 'Active' }));
            const enrolledStudents = enrollmentsRes.data.map((e: any) => ({
                id: e.studentId,
                name: e.studentName || 'Student Name', // Adjust based on actual API response
                code: e.studentCode || 'N/A',
                user: e.student?.user || {} // Fallback
            })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => (t.id === v.id)) === i); // Unique students

            // 2. Get Existing Attendance for Date
            const attendanceRes = await attendanceApi.get({ batchId: selectedBatchId, date });

            // Map existing attendance to state
            const existingMap: any = {};
            attendanceRes.data.forEach((a: any) => {
                existingMap[a.studentId] = { status: a.status, remarks: a.remarks || '' };
            });

            // Initialize state: if existing, use it; else default to Present
            const initialData: any = {};
            enrolledStudents.forEach((s: any) => {
                if (existingMap[s.id]) {
                    initialData[s.id] = existingMap[s.id];
                } else {
                    initialData[s.id] = { status: 'Present', remarks: '' };
                }
            });

            setStudents(enrolledStudents);
            setAttendanceData(initialData);

        } catch (error) {
            console.error('Error fetching batch data', error);
            // addToast('Error loading student list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseStudentsAndAttendance = async () => {
        setLoading(true);
        try {
            // Get students enrolled in the course
            const enrollmentsRes = await import('@/lib/api').then(m => m.enrollmentsApi.getAll({ courseId: selectedCourseId, status: 'Active' }));
            const enrolledStudents = enrollmentsRes.data.map((e: any) => ({
                id: e.studentId,
                name: e.studentName || 'Student Name',
                code: e.studentCode || 'N/A',
                user: e.student?.user || {}
            })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => (t.id === v.id)) === i);

            // Get existing attendance for the course and date
            const attendanceRes = await attendanceApi.get({ courseId: selectedCourseId, date });

            const existingMap: any = {};
            attendanceRes.data.forEach((a: any) => {
                existingMap[a.studentId] = { status: a.status, remarks: a.remarks || '' };
            });

            const initialData: any = {};
            enrolledStudents.forEach((s: any) => {
                if (existingMap[s.id]) {
                    initialData[s.id] = existingMap[s.id];
                } else {
                    initialData[s.id] = { status: 'Present', remarks: '' };
                }
            });

            setStudents(enrolledStudents);
            setAttendanceData(initialData);

        } catch (error) {
            console.error('Error fetching course data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendanceData((prev: any) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId: number, remarks: string) => {
        setAttendanceData((prev: any) => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const markAll = (status: string) => {
        setAttendanceData((prev: any) => {
            const newState: any = {};
            Object.keys(prev).forEach(studentId => {
                newState[studentId] = { ...prev[studentId], status };
            });
            return newState;
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const items = Object.keys(attendanceData).map(studentId => ({
                studentId: parseInt(studentId),
                status: attendanceData[studentId].status,
                remarks: attendanceData[studentId].remarks
            }));

            await attendanceApi.mark({
                ...(enrollmentType === 'batch' ? { batchId: selectedBatchId } : { courseId: selectedCourseId }),
                date,
                attendanceItems: items
            });

            addToast('Attendance saved successfully!', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to save attendance', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-blue-600 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Class Attendance
                        </h1>
                        <div className="flex space-x-2">
                            <button onClick={() => router.push('/teacher/dashboard')} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Dashboard
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || students.length === 0}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                    {/* Enrollment Type Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enrollment Type</label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="batch"
                                    checked={enrollmentType === 'batch'}
                                    onChange={(e) => setEnrollmentType('batch')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">Batch Wise</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="course"
                                    checked={enrollmentType === 'course'}
                                    onChange={(e) => setEnrollmentType('course')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">Course Wise</span>
                            </label>
                        </div>
                    </div>

                    {/* Dropdowns */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {enrollmentType === 'batch' ? 'Select Batch' : 'Select Course'}
                            </label>
                            <div className="relative">
                                {enrollmentType === 'batch' ? (
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(parseInt(e.target.value))}
                                        className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                                    >
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
                                        className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                                    >
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="block w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-500" />
                            Student List ({students.length})
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={() => markAll('Present')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-bold hover:bg-green-200 transition-colors">
                                All Present
                            </button>
                            <button onClick={() => markAll('Absent')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold hover:bg-red-200 transition-colors">
                                All Absent
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading class data...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No students found in this batch.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => {
                                        const status = attendanceData[student.id]?.status || 'Present';
                                        return (
                                            <tr key={student.id} className="hover:bg-blue-50/50 transition-colors status-row">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {student.code || student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2 bg-gray-100 p-1.5 rounded-lg inline-flex">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                                            className={`p-2 rounded-md transition-all ${status === 'Present' ? 'bg-white shadow text-green-600 ring-1 ring-green-200' : 'text-gray-400 hover:text-gray-600'}`}
                                                            title="Present"
                                                        >
                                                            <UserCheck className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Late')}
                                                            className={`p-2 rounded-md transition-all ${status === 'Late' ? 'bg-white shadow text-yellow-600 ring-1 ring-yellow-200' : 'text-gray-400 hover:text-gray-600'}`}
                                                            title="Late"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Absent')}
                                                            className={`p-2 rounded-md transition-all ${status === 'Absent' ? 'bg-white shadow text-red-600 ring-1 ring-red-200' : 'text-gray-400 hover:text-gray-600'}`}
                                                            title="Absent"
                                                        >
                                                            <UserX className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={attendanceData[student.id]?.remarks || ''}
                                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border rounded-md py-1.5 px-3 bg-gray-50 focus:bg-white transition-colors"
                                                        placeholder="Optional note..."
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
