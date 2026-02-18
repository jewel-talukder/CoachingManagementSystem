'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { shiftsApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

const convertTo24Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours}:${minutes}`;
};

export default function EditShiftPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { addToast } = useToastStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        graceTimeMinutes: 15
    });

    useEffect(() => {
        const fetchShift = async () => {
            try {
                const { data } = await shiftsApi.getById(parseInt(id));
                setFormData({
                    name: data.name,
                    startTime: convertTo24Hour(data.startTime),
                    endTime: convertTo24Hour(data.endTime),
                    graceTimeMinutes: data.graceTimeMinutes
                });
            } catch (error) {
                console.error('Failed to fetch shift:', error);
                addToast('Failed to load shift details', 'error');
                router.push('/admin/shifts');
            } finally {
                setLoading(false);
            }
        };
        fetchShift();
    }, [id, router, addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await shiftsApi.update(parseInt(id), {
                name: formData.name,
                startTime: formData.startTime,
                endTime: formData.endTime,
                graceTimeMinutes: parseInt(formData.graceTimeMinutes.toString())
            });

            addToast('Shift updated successfully!', 'success');
            router.push('/admin/shifts');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to update shift', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0">
            <Link
                href="/admin/shifts"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shifts
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Shift</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Update shift details and timings
                </p>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shift Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grace Time (Minutes)
                        </label>
                        <input
                            type="number"
                            min="0"
                            required
                            value={formData.graceTimeMinutes}
                            onChange={(e) => setFormData({ ...formData, graceTimeMinutes: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {saving ? 'Save Changes' : 'Update Shift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
