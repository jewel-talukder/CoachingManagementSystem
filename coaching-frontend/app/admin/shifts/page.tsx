'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { shiftsApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Clock
} from 'lucide-react';

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToastStore();

    const fetchShifts = async () => {
        try {
            const { data } = await shiftsApi.getAll();
            setShifts(data);
        } catch (error) {
            console.error('Failed to fetch shifts:', error);
            addToast('Failed to load shifts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;

        try {
            await shiftsApi.delete(id);
            addToast('Shift deleted successfully', 'success');
            fetchShifts();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to delete shift', 'error');
        }
    };

    const filteredShifts = shifts.filter(shift =>
        shift.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage teacher working shifts and timing
                    </p>
                </div>
                <Link
                    href="/admin/shifts/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Shift
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search shifts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shift Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Grace Time
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredShifts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No shifts found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredShifts.map((shift) => (
                                <tr key={shift.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{shift.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {shift.startTime} - {shift.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {shift.graceTimeMinutes} mins
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                href={`/admin/shifts/${shift.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(shift.id)}
                                                className="text-red-600 hover:text-red-900"
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
    );
}
