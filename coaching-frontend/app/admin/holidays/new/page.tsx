'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { holidaysApi, branchesApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHolidayPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    branchId: '',
    name: '',
    description: '',
    holidayType: 'SingleDay', // 'SingleDay', 'DateRange', 'WeeklyOff', 'Government', 'Religious'
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    daysOfWeek: [] as number[],
    isRecurring: false,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data || []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        branchId: formData.branchId ? parseInt(formData.branchId) : null,
        name: formData.name,
        description: formData.description || null,
        holidayType: formData.holidayType,
        startDate: formData.startDate,
        isRecurring: formData.isRecurring,
      };

      // Add end date for date range holidays
      if (formData.holidayType === 'DateRange' && formData.endDate) {
        payload.endDate = formData.endDate;
      }

      // Add days of week for weekly off holidays
      if (formData.holidayType === 'WeeklyOff' && formData.daysOfWeek.length > 0) {
        payload.daysOfWeek = formData.daysOfWeek;
      }

      await holidaysApi.create(payload);
      addToast('Holiday created successfully!', 'success');
      router.push('/admin/holidays');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create holiday', 'error');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeekArr = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <Link
        href="/admin/holidays"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Holidays
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Holiday</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new holiday to your calendar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holiday Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Eid-ul-Azha, Government Holiday, Weekly Off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holiday Type <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.holidayType}
            onChange={(e) => {
              setFormData({
                ...formData,
                holidayType: e.target.value,
                endDate: '', // Reset end date when type changes
                daysOfWeek: [], // Reset days of week when type changes
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="SingleDay">Single Day Holiday</option>
            <option value="DateRange">Date Range (Multi-day Event)</option>
            <option value="WeeklyOff">Weekly Off Day</option>
            <option value="Government">Government Holiday</option>
            <option value="Religious">Religious Holiday</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.holidayType === 'DateRange' && 'For holidays spanning multiple days (e.g., Eid-ul-Azha)'}
            {formData.holidayType === 'WeeklyOff' && 'For weekly recurring off days (e.g., Saturday, Sunday)'}
            {formData.holidayType === 'SingleDay' && 'For single day holidays'}
          </p>
        </div>

        {formData.holidayType === 'WeeklyOff' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Weekly Off Days <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-gray-300 rounded-md bg-gray-50">
              {daysOfWeekArr.map((day) => (
                <label key={day.value} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={day.value}
                    checked={formData.daysOfWeek.includes(parseInt(day.value))}
                    onChange={(e) => {
                      const dayNum = parseInt(day.value);
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          daysOfWeek: [...formData.daysOfWeek, dayNum].sort((a, b) => a - b),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          daysOfWeek: formData.daysOfWeek.filter((d) => d !== dayNum),
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            {formData.daysOfWeek.length === 0 && (
              <p className="mt-1 text-xs text-red-500">Please select at least one day</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Selected days will be off every week
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.holidayType === 'DateRange' ? 'Start Date' : 'Holiday Date'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {formData.holidayType === 'DateRange' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  End date must be after or equal to start date
                </p>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch (Optional)
          </label>
          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.isDefault && '(Default)'}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to apply this holiday to all branches
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional description or notes about this holiday"
          />
        </div>

        {formData.holidayType !== 'WeeklyOff' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Recurring Holiday (Repeat Every Year)
            </label>
          </div>
        )}
        {formData.holidayType !== 'WeeklyOff' && (
          <p className="text-xs text-gray-500 -mt-4">
            If checked, this holiday will repeat every year on the same date(s)
          </p>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/holidays')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Holiday'}
          </button>
        </div>
      </form>
    </div>
  );
}
