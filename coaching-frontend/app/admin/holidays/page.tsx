'use client';

import { useEffect, useState } from 'react';
import { holidaysApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useToastStore } from '@/lib/store/toastStore';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await holidaysApi.getAll();
      setHolidays(response.data || []);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      addToast('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await holidaysApi.delete(id);
      addToast('Holiday deleted successfully', 'success');
      fetchHolidays();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete holiday', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    if (!endDate) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDayNames = (daysOfWeek: string | null) => {
    if (!daysOfWeek) return '';
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayNumbers = JSON.parse(daysOfWeek) as number[];
      return dayNumbers.map((d) => days[d]).join(', ');
    } catch {
      return '';
    }
  };

  const isUpcoming = (startDate: string, endDate: string | null) => {
    const checkDate = endDate ? new Date(endDate) : new Date(startDate);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate >= today;
  };

  const getHolidayTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SingleDay: { label: 'Single Day', className: 'bg-blue-100 text-blue-800' },
      DateRange: { label: 'Date Range', className: 'bg-purple-100 text-purple-800' },
      WeeklyOff: { label: 'Weekly Off', className: 'bg-green-100 text-green-800' },
      Government: { label: 'Government', className: 'bg-yellow-100 text-yellow-800' },
      Religious: { label: 'Religious', className: 'bg-pink-100 text-pink-800' },
    };
    return badges[type] || { label: type, className: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Holidays</h1>
        <Link
          href="/admin/holidays/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Holiday
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {holidays.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No holidays found</p>
            <Link
              href="/admin/holidays/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Holiday
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {holidays.map((holiday) => (
              <li key={holiday.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isUpcoming(holiday.startDate, holiday.endDate)
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                          }`}>
                          <Calendar className={`h-5 w-5 ${isUpcoming(holiday.startDate, holiday.endDate)
                              ? 'text-blue-600'
                              : 'text-gray-600'
                            }`} />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {holiday.name}
                          </div>
                          {(() => {
                            const typeBadge = getHolidayTypeBadge(holiday.holidayType || 'SingleDay');
                            return (
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeBadge.className}`}>
                                {typeBadge.label}
                              </span>
                            );
                          })()}
                          {holiday.isRecurring && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Recurring
                            </span>
                          )}
                          {!holiday.isActive && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {holiday.holidayType === 'WeeklyOff' && holiday.daysOfWeek ? (
                            <span className="font-medium">Every {getDayNames(holiday.daysOfWeek)}</span>
                          ) : (
                            <span className="font-medium">
                              {formatDateRange(holiday.startDate, holiday.endDate)}
                            </span>
                          )}
                          {holiday.branchName && (
                            <span className="ml-2">• {holiday.branchName}</span>
                          )}
                        </div>
                        {holiday.description && (
                          <div className="mt-1 text-sm text-gray-500">
                            {holiday.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/holidays/${holiday.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(holiday.id, holiday.name)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
