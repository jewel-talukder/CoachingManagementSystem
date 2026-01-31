'use client';

import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import {
    CheckCircle,
    Clock,
    User,
    Calendar,
    AlertCircle,
    MessageSquare
} from 'lucide-react';

export default function AttendanceApprovalPage() {
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToastStore();

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const response = await attendanceApi.getPending();
            setPendingList(response.data);
        } catch (error) {
            console.error('Failed to fetch pending attendance', error);
            // addToast('Failed to load pending requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await attendanceApi.approve(id);
            addToast('Attendance approved successfully', 'success');
            // Remove from list
            setPendingList(prev => prev.filter(item => item.id !== id));
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to approve', 'error');
        }
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <CheckCircle className="w-8 h-8 mr-3 text-blue-600" />
                            Pending Approvals
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Review and approve teacher self-attendance records
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Count</span>
                        <div className="text-2xl font-bold text-blue-600 text-center">{pendingList.length}</div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : pendingList.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                        <div className="mx-auto h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">There are no pending attendance requests to approve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingList.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-3">
                                                {item.teacherName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item.teacherName}</h4>
                                                <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">Teacher</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.status}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            {formatDate(item.attendanceDate)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            {formatTime(item.attendanceDate)}
                                        </div>
                                        {item.remarks ? (
                                            <div className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="italic">"{item.remarks}"</span>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic pl-6">No remarks provided</div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleApprove(item.id)}
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Attendance
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
