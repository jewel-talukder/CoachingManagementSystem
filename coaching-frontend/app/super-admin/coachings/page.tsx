'use client';

import { useEffect, useState } from 'react';
import { superAdminApi } from '@/lib/api';
import { Shield, Ban, CheckCircle } from 'lucide-react';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function CoachingsPage() {
  const [coachings, setCoachings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoachings();
  }, []);

  const fetchCoachings = async () => {
    try {
      const response = await superAdminApi.getCoachings();
      setCoachings(response.data);
    } catch (error) {
      console.error('Failed to fetch coachings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await superAdminApi.activateCoaching(id);
      fetchCoachings();
      alert('Coaching activated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to activate coaching');
    }
  };

  const handleBlock = async (id: number) => {
    if (!confirm('Are you sure you want to block this coaching?')) return;
    try {
      await superAdminApi.blockCoaching(id);
      fetchCoachings();
      alert('Coaching blocked successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to block coaching');
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Coachings</h1>
          <p className="text-gray-600 mt-2">View and manage all coaching centers</p>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coachings.length > 0 ? (
                  coachings.map((coaching) => (
                    <tr key={coaching.Id || coaching.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {coaching.Name || coaching.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coaching.Email || coaching.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coaching.City && coaching.State
                          ? `${coaching.City}, ${coaching.State}`
                          : coaching.city && coaching.state
                          ? `${coaching.city}, ${coaching.state}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (coaching.IsActive || coaching.isActive) && !(coaching.IsBlocked || coaching.isBlocked)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {coaching.IsBlocked || coaching.isBlocked
                            ? 'Blocked'
                            : coaching.IsActive || coaching.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{coaching.PlanName || coaching.planName || 'No Plan'}</div>
                          <div className="text-xs text-gray-400">
                            {coaching.SubscriptionStatus || coaching.subscriptionStatus}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(!(coaching.IsActive || coaching.isActive) || (coaching.IsBlocked || coaching.isBlocked)) && (
                            <button
                              onClick={() => handleActivate(coaching.Id || coaching.id)}
                              className="text-green-600 hover:text-green-900 inline-flex items-center px-2 py-1 rounded hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </button>
                          )}
                          {(coaching.IsActive || coaching.isActive) && !(coaching.IsBlocked || coaching.isBlocked) && (
                            <button
                              onClick={() => handleBlock(coaching.Id || coaching.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 rounded hover:bg-red-50"
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Block
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const planId = prompt('Enter Plan ID:');
                              if (planId) {
                                superAdminApi
                                  .assignPlan(coaching.Id || coaching.id, { planId: Number(planId), autoRenew: false })
                                  .then(() => {
                                    alert('Plan assigned successfully!');
                                    fetchCoachings();
                                  })
                                  .catch((error) => {
                                    alert(error.response?.data?.message || 'Failed to assign plan');
                                  });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Assign Plan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No coachings found
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

