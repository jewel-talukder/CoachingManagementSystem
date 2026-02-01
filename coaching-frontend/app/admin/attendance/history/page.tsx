'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { attendanceApi, branchesApi } from '@/lib/api';
import { useBranchStore } from '@/lib/store/branchStore';
import {
    Calendar,
    Search,
    Filter,
    Download,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

export default function AttendanceHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Global Branch Store
    const { selectedBranch } = useBranchStore();
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);

    // Sync global branch change
    useEffect(() => {
        if (selectedBranch) {
            setSelectedBranchId(selectedBranch.id.toString());
        }
    }, [selectedBranch]);

    useEffect(() => {
        fetchBranches();
        if (selectedBranchId || selectedBranch) {
            fetchHistory();
        }
    }, [page, limit, selectedBranchId]); // Refetch when local state updates (which comes from global)

    const fetchBranches = async () => {
        try {
            const response = await branchesApi.getAll();
            setBranches(response.data);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            // Prefer local state if set (which links to global), or fallback to global direct usage
            const branchIdToUse = selectedBranchId || selectedBranch?.id;
            if (branchIdToUse) params.branchId = branchIdToUse;

            const response = await attendanceApi.getTeacherHistory(params);

            if (response.data && Array.isArray(response.data.data)) {
                setHistory(response.data.data);
                setTotal(response.data.total);
            } else {
                setHistory(Array.isArray(response.data) ? response.data : []);
                setTotal(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error('Failed to fetch attendance history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on filter
        fetchHistory();
    };

    // Pagination Handlers
    const totalPages = Math.ceil(total / limit);

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'late': return 'bg-yellow-100 text-yellow-800';
            case 'absent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <HistoryIcon className="w-8 h-8 mr-3 text-blue-600" />
                                Attendance History
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                View and filter approved teacher attendance records
                            </p>
                        </div>
                        {/* <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </button> */}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStartDate(''); setEndDate(''); setSelectedBranchId(''); fetchHistory(); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                                <p>Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Info</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                            {record.teacherName.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{record.teacherName}</div>
                                                            <div className="text-xs text-gray-500">Teacher</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                        {formatDate(record.attendanceDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{record.shiftName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {record.shiftStartTime?.substring(0, 5)} - {record.shiftEndTime?.substring(0, 5)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                        {formatTime(record.attendanceDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                    {record.remarks && (
                                                        <div className="text-xs text-gray-500 mt-1 italic max-w-[150px] truncate">
                                                            "{record.remarks}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                        {record.approvedBy}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function HistoryIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
