'use client';

import { useEffect, useState } from 'react';
import { subscriptionsApi } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { Check, Crown, Calendar, Users, BookOpen, GraduationCap, UserCheck, Loader2 } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  billingPeriod: string;
  trialDays: number;
  maxUsers: number | null;
  maxCourses: number | null;
  maxStudents: number | null;
  maxTeachers: number | null;
}

interface CurrentSubscription {
  subscriptionId: number;
  plan: Plan;
  startDate: string;
  endDate: string;
  trialEndDate: string | null;
  status: string;
  amount: number;
  autoRenew: boolean;
  subscriptionExpiresAt: string | null;
}

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Yearly' | 'All'>('All');
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchData();
  }, [billingPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [currentRes, plansRes] = await Promise.all([
        subscriptionsApi.getCurrent(),
        subscriptionsApi.getAvailablePlans(billingPeriod !== 'All' ? { billingPeriod } : undefined),
      ]);
      setCurrentSubscription(currentRes.data);
      setAvailablePlans(plansRes.data);
    } catch (error: any) {
      console.error('Failed to fetch subscription data:', error);
      if (error.response?.status !== 404) {
        addToast('Failed to load subscription information', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to change your plan? This will update your subscription immediately.')) {
      return;
    }

    try {
      setChangingPlan(planId);
      await subscriptionsApi.changePlan({ planId, autoRenew: false });
      addToast('Plan changed successfully!', 'success');
      fetchData(); // Refresh data
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to change plan', 'error');
    } finally {
      setChangingPlan(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCurrentPlan = (planId: number) => {
    return currentSubscription?.plan.id === planId;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription & Plans</h1>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                currentSubscription.status
              )}`}
            >
              {currentSubscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{currentSubscription.plan.name}</h3>
              <p className="text-gray-600 mb-4">{currentSubscription.plan.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Started: {formatDate(currentSubscription.startDate)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Expires: {formatDate(currentSubscription.endDate)}
                  </span>
                </div>
                {currentSubscription.trialEndDate && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Trial ends: {formatDate(currentSubscription.trialEndDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  ₹{currentSubscription.plan.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  per {currentSubscription.plan.billingPeriod.toLowerCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentSubscription.plan.maxUsers && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Max Users: {currentSubscription.plan.maxUsers === null ? 'Unlimited' : currentSubscription.plan.maxUsers}
                    </span>
                  </div>
                )}
                {currentSubscription.plan.maxCourses && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Max Courses: {currentSubscription.plan.maxCourses === null ? 'Unlimited' : currentSubscription.plan.maxCourses}
                    </span>
                  </div>
                )}
                {currentSubscription.plan.maxStudents && (
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Max Students: {currentSubscription.plan.maxStudents === null ? 'Unlimited' : currentSubscription.plan.maxStudents}
                    </span>
                  </div>
                )}
                {currentSubscription.plan.maxTeachers && (
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Max Teachers: {currentSubscription.plan.maxTeachers === null ? 'Unlimited' : currentSubscription.plan.maxTeachers}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setBillingPeriod('All')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${billingPeriod === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('Monthly')}
              className={`-ml-px px-4 py-2 text-sm font-medium ${billingPeriod === 'Monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('Yearly')}
              className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md ${billingPeriod === 'Yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {availablePlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No plans available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-6 ${isCurrentPlan(plan.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {isCurrentPlan(plan.id) && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{plan.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {plan.billingPeriod.toLowerCase()}
                  </div>
                  {plan.billingPeriod === 'Yearly' && (
                    <div className="text-xs text-green-600 mt-1">
                      Save 17% compared to monthly
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Users: {plan.maxUsers === null ? 'Unlimited' : plan.maxUsers}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Courses: {plan.maxCourses === null ? 'Unlimited' : plan.maxCourses}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Students: {plan.maxStudents === null ? 'Unlimited' : plan.maxStudents}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      Teachers: {plan.maxTeachers === null ? 'Unlimited' : plan.maxTeachers}
                    </span>
                  </div>
                  {plan.trialDays > 0 && (
                    <div className="flex items-center text-blue-600">
                      <Check className="h-4 w-4 mr-2" />
                      <span>{plan.trialDays} days free trial</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={isCurrentPlan(plan.id) || changingPlan === plan.id}
                  className={`w-full py-2 px-4 rounded-md font-medium ${isCurrentPlan(plan.id)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : changingPlan === plan.id
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {changingPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </span>
                  ) : isCurrentPlan(plan.id) ? (
                    'Current Plan'
                  ) : (
                    'Change to This Plan'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
