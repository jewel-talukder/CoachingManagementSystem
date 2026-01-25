'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { branchesApi } from '@/lib/api';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data || []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, isDefault: boolean) => {
    if (isDefault) {
      alert('Cannot delete default branch');
      return;
    }

    if (!confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      await branchesApi.delete(id);
      // Dispatch event to notify header to refresh branches
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('branches-updated'));
      }
      fetchBranches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete branch');
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
          <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
          <Link
            href="/admin/branches/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Branch
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {branches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No branches found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {branch.name}
                            </div>
                            {branch.isDefault && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {branch.code && <span className="mr-2">Code: {branch.code}</span>}
                            {branch.address && (
                              <span className="flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {branch.address}
                                {branch.city && `, ${branch.city}`}
                                {branch.state && `, ${branch.state}`}
                              </span>
                            )}
                          </div>
                          {(branch.phone || branch.email) && (
                            <div className="text-xs text-gray-400 mt-1">
                              {branch.phone && <span>Phone: {branch.phone}</span>}
                              {branch.phone && branch.email && <span className="mx-2">•</span>}
                              {branch.email && <span>Email: {branch.email}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            branch.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/branches/${branch.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(branch.id, branch.isDefault)}
                            className="text-red-600 hover:text-red-800"
                            disabled={branch.isDefault}
                            title={
                              branch.isDefault
                                ? 'Cannot delete default branch'
                                : 'Delete branch'
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

