'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react';
import Link from 'next/link';
import { rolesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';

interface Permission {
    id: number;
    name: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
    coachingId: number | null;
    permissions: Permission[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToastStore();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await rolesApi.getAll();
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
            addToast('Failed to load roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            await rolesApi.delete(id);
            addToast('Role deleted successfully', 'success');
            fetchRoles();
        } catch (error) {
            addToast('Failed to delete role', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-500">Manage user roles and their access levels</p>
                </div>
                <Link
                    href="/admin/roles/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Role</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Role Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Scope</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex justify-center flex-col items-center space-y-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span>Loading roles...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    No roles found.
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{role.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{role.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.coachingId === null
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {role.coachingId === null ? 'System' : 'Coaching'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                href={`/admin/roles/${role.id}/permissions`}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Manage Permissions"
                                            >
                                                <Key className="w-5 h-5" />
                                            </Link>
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-blue-900 font-semibold text-lg">About Dynamic RBAC</h3>
                        <p className="text-blue-800 text-sm mt-1">
                            You can now create custom roles and assign granular permissions. Changes to permissions
                            take effect immediately upon the next user login. System roles are read-only and
                            available to all coachings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
