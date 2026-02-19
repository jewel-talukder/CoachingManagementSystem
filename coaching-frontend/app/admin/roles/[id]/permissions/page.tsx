'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { rolesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';

interface Permission {
    id: number;
    name: string;
    description: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

export default function RolePermissionsPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id;
    const { addToast } = useToastStore();

    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all available permissions
                const permsResponse = await rolesApi.getAllPermissions();
                setPermissions(permsResponse.data);

                // Fetch current role and its assigned permissions
                const rolesResponse = await rolesApi.getAll();
                const currentRole = rolesResponse.data.find((r: any) => r.id === Number(roleId));

                if (currentRole) {
                    setRole(currentRole);
                    setSelectedPermissions(currentRole.permissions.map((p: any) => p.id));
                } else {
                    addToast('Role not found', 'error');
                    router.push('/admin/roles');
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                addToast('Failed to load permissions data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roleId, router]);

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await rolesApi.updatePermissions(Number(roleId), selectedPermissions);
            addToast('Permissions updated successfully', 'success');
            router.push('/admin/roles');
        } catch (error) {
            console.error('Failed to save permissions', error);
            addToast('Failed to save permissions', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Group permissions
    const groups = Array.from(new Set(permissions.map(p => p.group)));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/roles" className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Permissions</h1>
                        <p className="text-gray-500">Configuring permissions for <span className="font-semibold text-blue-600">{role?.name}</span></p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
                </button>
            </div>

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
    );
}
