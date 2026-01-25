'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { batchesApi } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToastStore } from '@/lib/store/toastStore';

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await batchesApi.getAll();
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      addToast('Failed to load batches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete batch "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await batchesApi.delete(id);
      addToast('Batch deleted successfully', 'success');
      fetchBatches();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete batch';
      addToast(errorMessage, 'error');
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
          <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
          <Link
            href="/admin/batches/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Batch
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <li key={batch.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                        {batch.code && (
                          <span className="ml-2 text-xs text-gray-500">({batch.code})</span>
                        )}
                      </div>
                      {batch.description && (
                        <div className="text-sm text-gray-500 mt-1">{batch.description}</div>
                      )}
                      {batch.teacherName && (
                        <div className="text-sm text-gray-500 mt-1">Teacher: {batch.teacherName}</div>
                      )}
                      {batch.monthlyFee && (
                        <div className="text-sm text-gray-500 mt-1">
                          Monthly Fee: {batch.monthlyFee} Taka
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Students: {batch.currentStudents}/{batch.maxStudents}
                        </div>
                        {batch.startDate && (
                          <div className="text-xs text-gray-400 mt-1">
                            Start: {new Date(batch.startDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          batch.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/batches/${batch.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit batch"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(batch.id, batch.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete batch"
                          disabled={batch.currentStudents > 0}
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
        </div>
      </div>
    </AdminLayout>
  );
}

