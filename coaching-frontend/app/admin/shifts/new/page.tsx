'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { shiftsApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft } from 'lucide-react';

export default function NewShiftPage() {
    const router = useRouter();
    const { addToast } = useToastStore();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        graceTimeMinutes: 15
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Validate times
        if (formData.startTime >= formData.endTime) {
            addToast('Start time must be before end time', 'error');
            setSaving(false);
            return;
        }

        try {
            await shiftsApi.create({
                name: formData.name,
                startTime: formData.startTime,
                endTime: formData.endTime,
                graceTimeMinutes: parseInt(formData.graceTimeMinutes.toString())
            });

            addToast('Shift created successfully!', 'success');
            router.push('/admin/shifts');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to create shift', 'error');
        } finally {
            setSaving(false);
        }
    };

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
                <h1 className="text-3xl font-bold text-gray-900">Add New Shift</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Create a new working shift for teachers
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
                            placeholder="e.g. Morning Shift"
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
                        <p className="text-xs text-gray-500 mb-2">Allowed delay before marking as "Late"</p>
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
                            {saving ? 'Creating...' : 'Create Shift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
