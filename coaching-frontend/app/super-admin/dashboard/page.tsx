'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { superAdminApi } from '@/lib/api';
import { Building2, Users, GraduationCap, BookOpen, Shield } from 'lucide-react';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setError('');
      const response = await superAdminApi.getDashboard();
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  const stats = [
    {
      name: 'Total Coachings',
      value: data?.Summary?.TotalCoachings || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Coachings',
      value: data?.Summary?.ActiveCoachings || 0,
      icon: Shield,
      color: 'bg-green-500',
    },
    {
      name: 'Blocked Coachings',
      value: data?.Summary?.BlockedCoachings || 0,
      icon: Shield,
      color: 'bg-red-500',
    },
    {
      name: 'Total Users',
      value: data?.Summary?.TotalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Students',
      value: data?.Summary?.TotalStudents || 0,
      icon: GraduationCap,
      color: 'bg-orange-500',
    },
    {
      name: 'Total Teachers',
      value: data?.Summary?.TotalTeachers || 0,
      icon: BookOpen,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SaaS Overview</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all coaching centers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`${stat.color} rounded-md p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Coachings
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.Coachings && data.Coachings.length > 0 ? (
                      data.Coachings.map((coaching: any) => (
                        <tr key={coaching.Id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {coaching.Name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                coaching.IsActive && !coaching.IsBlocked
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {coaching.IsBlocked
                                ? 'Blocked'
                                : coaching.IsActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {coaching.SubscriptionStatus}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {coaching.PlanName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {coaching.SubscriptionExpiresAt
                              ? new Date(coaching.SubscriptionExpiresAt).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No coachings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>
    </SuperAdminLayout>
  );
}

