'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useBranchStore } from '@/lib/store/branchStore';
import { branchesApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Settings, LogOut, Building2 } from 'lucide-react';

import { MenuItem } from './AdminSidebar';

interface AdminHeaderProps {
  menuItems: MenuItem[];
}

export default function AdminHeader({ menuItems }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { branches, selectedBranch, setBranches, setSelectedBranch } = useBranchStore();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBranches();
    }
  }, [user]);

  // Refetch branches when navigating to branches page or when pathname changes
  useEffect(() => {
    if (user && pathname === '/admin/branches') {
      fetchBranches();
    }
  }, [pathname, user]);

  // Listen for branch updates (when branches are added/updated/deleted)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleBranchUpdate = () => {
        if (user) {
          fetchBranches();
        }
      };

      // Listen for custom event when branches are modified
      window.addEventListener('branches-updated', handleBranchUpdate);

      // Also refresh when window regains focus (user might have added branch in another tab)
      const handleFocus = () => {
        if (user) {
          fetchBranches();
        }
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('branches-updated', handleBranchUpdate);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await branchesApi.getAll();
      // Handle both direct array response and wrapped response
      const branchesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleBranchChange = (branch: typeof branches[0]) => {
    setSelectedBranch(branch);
    setBranchDropdownOpen(false);
    // Reload the page to refresh data with new branch
    router.refresh();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const getActiveLabel = (items: MenuItem[]): string | undefined => {
    for (const item of items) {
      if (item.href && isActive(item.href)) {
        return item.label;
      }
      if (item.children) {
        const childLabel = getActiveLabel(item.children);
        if (childLabel) return childLabel;
      }
    }
    return undefined;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {getActiveLabel(menuItems) || 'Admin Panel'}
        </h2>
      </div>

      {/* Branch Selector & Profile Section */}
      <div className="flex items-center space-x-4">
        {/* Branch Selector */}
        {branches.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {selectedBranch?.name || 'Select Branch'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Branch Dropdown */}
            {branchDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setBranchDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Select Branch</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchChange(branch)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedBranch?.id === branch.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                      >
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          {branch.code && (
                            <p className="text-xs text-gray-500">{branch.code}</p>
                          )}
                        </div>
                        {branch.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">Coaching Admin</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/admin/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

