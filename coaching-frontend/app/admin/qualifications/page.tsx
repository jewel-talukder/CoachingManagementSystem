'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { qualificationsApi } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchQualifications();
  }, [filterActive]);

  const fetchQualifications = async () => {
    try {
      const params = filterActive !== null ? { isActive: filterActive } : {};
      const response = await qualificationsApi.getAll(params);
      setQualifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this qualification?')) {
      return;
    }

    try {
      await qualificationsApi.delete(id);
      fetchQualifications();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete qualification');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Qualifications</h1>
          <Link
            href="/admin/qualifications/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Qualification
          </Link>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilterActive(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterActive === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterActive === true
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterActive === false
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inactive
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {qualifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No qualifications found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {qualifications.map((qualification) => (
                <li key={qualification.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {qualification.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {qualification.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {qualification.description || 'No description'}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            {qualification.teacherCount || 0} teacher(s) assigned
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            qualification.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {qualification.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/qualifications/${qualification.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(qualification.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={qualification.teacherCount > 0}
                            title={
                              qualification.teacherCount > 0
                                ? 'Cannot delete: Qualification is assigned to teachers'
                                : 'Delete qualification'
                            }
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

