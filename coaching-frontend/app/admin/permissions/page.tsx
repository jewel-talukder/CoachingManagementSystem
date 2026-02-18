'use client';

import { ShieldCheck, Check, X } from 'lucide-react';

interface PermissionEntry {
    label: string;
    roles: string[];
    isHeader?: boolean;
}

const ALL_ROLES = ['Super Admin', 'Coaching Admin', 'Manager', 'Receptionist'];

export default function PermissionsPage() {
    const permissions: PermissionEntry[] = [
        { label: 'Dashboard', roles: ['Coaching Admin', 'Super Admin', 'Manager', 'Receptionist'] },
        { label: 'Academic', roles: [], isHeader: true },
        { label: 'Academic - Branches', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Academic - Courses', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Academic - Batches', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Academic - Shifts', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Academic - Holidays', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'People', roles: [], isHeader: true },
        { label: 'People - Students', roles: ['Coaching Admin', 'Super Admin', 'Manager', 'Receptionist'] },
        { label: 'People - Teachers', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'People - Users', roles: ['Coaching Admin', 'Super Admin'] },
        { label: 'Setup', roles: [], isHeader: true },
        { label: 'Setup - Qualifications', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Setup - Specializations', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Attendance', roles: [], isHeader: true },
        { label: 'Attendance - Approvals', roles: ['Coaching Admin', 'Super Admin', 'Manager'] },
        { label: 'Attendance - History', roles: ['Coaching Admin', 'Super Admin', 'Manager', 'Receptionist'] },
        { label: 'Finance', roles: [], isHeader: true },
        { label: 'Finance - Payment Due', roles: ['Coaching Admin', 'Super Admin', 'Manager', 'Receptionist'] },
        { label: 'Finance - Subscription', roles: ['Coaching Admin', 'Super Admin'] },
        { label: 'Settings', roles: ['Coaching Admin', 'Super Admin'] },
        { label: 'Permissions Management', roles: ['Coaching Admin', 'Super Admin'] },
    ];

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <ShieldCheck className="w-8 h-8 mr-3 text-blue-600" />
                    Menu Permissions Control
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    View and manage which roles can access specific menu items across the admin panel.
                </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Menu Item / Module
                                </th>
                                {ALL_ROLES.map(role => (
                                    <th key={role} className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {role}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {permissions.map((item, idx) => (
                                <tr key={idx} className={item.isHeader ? 'bg-gray-50/50' : 'hover:bg-gray-50 transition-colors'}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.isHeader ? 'font-black text-gray-900' : 'font-medium text-gray-600 pl-10'}`}>
                                        {item.label}
                                    </td>
                                    {ALL_ROLES.map(role => (
                                        <td key={role} className="px-6 py-4 whitespace-nowrap text-center">
                                            {!item.isHeader && (
                                                <div className="flex justify-center">
                                                    {item.roles.includes(role) ? (
                                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center opacity-50">
                                                            <X className="h-4 w-4 text-red-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-blue-800 font-bold flex items-center mb-2">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Note on Security
                </h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                    These permissions define menu visibility in the frontend. Backend API endpoints are also secured with corresponding role checks to ensure data integrity.
                    Administrator roles (Super Admin, Coaching Admin) have full override access.
                </p>
            </div>
        </div>
    );
}
