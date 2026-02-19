'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rolesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';

interface Permission {
    id: number;
    name: string;
    description: string;
    group: string;
}

export default function NewRolePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToastStore();

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const response = await rolesApi.getAllPermissions();
                setPermissions(response.data);
            } catch (error) {
                console.error('Failed to fetch permissions', error);
                addToast('Failed to load permissions', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            addToast('Role name is required', 'error');
            return;
        }

        setSaving(true);
        try {
            await rolesApi.create({
                name,
                description,
                permissionIds: selectedPermissions
            });
            addToast('Role created successfully', 'success');
            router.push('/admin/roles');
        } catch (error: any) {
            console.error('Failed to create role', error);
            addToast(error.response?.data?.message || 'Failed to create role', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const groups = Array.from(new Set(permissions.map(p => p.group)));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
                <Link href="/admin/roles" className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
                    <p className="text-gray-500">Define a custom role and assign permissions</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Role Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Senior Manager"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                            <input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe what this role does"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Assign Permissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map(group => (
                            <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">{group}</h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    {permissions
                                        .filter(p => p.group === group)
                                        .map(permission => {
                                            const isSelected = selectedPermissions.includes(permission.id);
                                            return (
                                                <button
                                                    key={permission.id}
                                                    type="button"
                                                    onClick={() => togglePermission(permission.id)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                                        ? 'border-blue-200 bg-blue-50'
                                                        : 'border-gray-100 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="text-left">
                                                        <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                                            {permission.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                                                    </div>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span className="font-semibold">{saving ? 'Creating...' : 'Create Role'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
