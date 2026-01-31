'use client';

import { useState, useEffect } from 'react';
import { attendanceApi, dashboardApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import {
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    MapPin,
    User,
    LogOut,
    History,
    Coffee
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
    name: string;
    employeeCode: string;
    shift?: {
        id: number;
        name: string;
        startTime: string; // TimeSpan string "hh:mm:ss"
        endTime: string;
        graceTimeMinutes: number;
    };
}

export default function TeacherSelfAttendancePage() {
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [remarks, setRemarks] = useState('');
    const [calculatedStatus, setCalculatedStatus] = useState<string>('Present');
    const { addToast } = useToastStore();
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchProfile();
        return () => clearInterval(timer);
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await dashboardApi.getTeacher();
            setProfile(data.profile);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    // Calculate status in real-time for UI feedback
    useEffect(() => {
        if (!profile?.shift) return;

        const checkStatus = () => {
            try {
                // Parse shift start string "08:00:00" or similar to Date object for today
                // Backend TimeSpan usually comes as "HH:mm:ss" or "HH:mm"
                const [time] = profile.shift!.startTime.split('.'); // Handle potential ss.fff
                const [hoursStr, minutesStr] = time.split(':');

                const hours = parseInt(hoursStr, 10);
                const minutes = parseInt(minutesStr, 10);

                const shiftDate = new Date();
                shiftDate.setHours(hours, minutes, 0, 0);

                // Add grace time from profile
                const graceMinutes = profile.shift?.graceTimeMinutes || 0;
                shiftDate.setMinutes(shiftDate.getMinutes() + graceMinutes);

                if (currentTime > shiftDate) {
                    setCalculatedStatus('Late');
                } else {
                    setCalculatedStatus('Present');
                }
            } catch (e) {
                console.error("Error parsing time", e);
            }
        };

        checkStatus();
    }, [currentTime, profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // calculated "status" here is just for display, backend recalculates it to be safe
            await attendanceApi.submitSelf({
                date: new Date().toISOString(),
                status: calculatedStatus, // Backend ignores this usually or uses as fallback
                remarks
            });
            addToast('Attendance submitted successfully! Pending Admin Approval.', 'success');
            setRemarks('');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to submit attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar - mimicking Dashboard style */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-blue-600 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Teacher Portal
                        </h1>
                        <div className="flex space-x-4">
                            <button onClick={() => router.push('/teacher/dashboard')} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Dashboard
                            </button>
                            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Clock & Status */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-8 text-white text-center">
                                <h2 className="text-5xl font-extrabold tracking-tight mb-2 font-mono">
                                    {timeString}
                                </h2>
                                <p className="text-blue-100 font-medium text-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    {dateString}
                                </p>
                                {profile?.shift && (
                                    <div className="mt-4 flex flex-col items-center justify-center space-y-2">
                                        <span className="px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm flex items-center">
                                            <Coffee className="w-4 h-4 mr-2" />
                                            Shift: {profile.shift.name} ({profile.shift.startTime} - {profile.shift.endTime})
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${calculatedStatus === 'Late' ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'
                                            }`}>
                                            Current Status: {calculatedStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remarks (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Reason for late entry or generic notes..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white transition-all
                                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <MapPin className="w-5 h-5 mr-2" />
                                            Check In Now
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Info & Tips */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <History className="w-5 h-5 mr-2 text-indigo-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {/* Placeholder for recent history - could fetch from API if needed */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                                            P
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Yesterday</p>
                                            <p className="text-xs text-gray-500">9:00 AM Check-in</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Approved</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                    <Coffee className="w-4 h-4 mr-2 text-orange-500" />
                                    Attendance Rules
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                    <li>Mark attendance immediately upon arrival.</li>
                                    <li>For "Late" entry, please provide a valid reason in remarks.</li>
                                    <li>Attendance requires <span className="font-bold text-blue-600">Admin Approval</span> to be finalized.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
