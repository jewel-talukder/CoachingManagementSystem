'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useToastStore } from '@/lib/store/toastStore';
import { Save, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { paymentMode, setPaymentMode } = useSettingsStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'batch' | 'monthly'>(paymentMode);

  useEffect(() => {
    setSelectedMode(paymentMode);
  }, [paymentMode]);

  const handleSave = async () => {
    setLoading(true);
    try {
      setPaymentMode(selectedMode);
      addToast('Settings saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your coaching center settings
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set how student payments should be calculated and displayed
            </p>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Mode
              </label>
              <div className="space-y-4">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="batch"
                    checked={selectedMode === 'batch'}
                    onChange={() => setSelectedMode('batch')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">Batch-wise Payment</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Students pay fees based on the batch/course they are enrolled in. 
                      Payment is calculated per batch enrollment.
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="monthly"
                    checked={selectedMode === 'monthly'}
                    onChange={() => setSelectedMode('monthly')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">Monthly Payment</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Students pay fees on a monthly basis. 
                      Payment is calculated per month regardless of batch enrollment.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={loading || selectedMode === paymentMode}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

