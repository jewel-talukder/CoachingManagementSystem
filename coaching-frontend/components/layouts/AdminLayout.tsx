'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import { LayoutDashboard, Users, BookOpen, UsersRound, Settings, DollarSign, GraduationCap, Crown, Award, BookMarked, Building2, Calendar, CheckCircle, Timer, History, ShieldCheck } from 'lucide-react';

import { MenuItem } from './admin/AdminSidebar';

// Lazy load components
const AdminSidebar = lazy(() => import('./admin/AdminSidebar'));
const AdminHeader = lazy(() => import('./admin/AdminHeader'));
const AdminFooter = lazy(() => import('./admin/AdminFooter'));

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ALLOWED_ROLES = ['Coaching Admin', 'Super Admin', 'Manager', 'Receptionist'];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen);
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to find item by path in recursive menu
  const findMenuItemByPath = (items: MenuItem[], path: string): MenuItem | null => {
    for (const item of items) {
      if (item.href === path) return item;
      if (item.children) {
        const found = findMenuItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user || !user.roles.some(role => ALLOWED_ROLES.includes(role))) {
        router.push('/login');
        return;
      }

      // Check if current page is allowed for user role
      // We check if the item is in the menu AND if the user has a required permission
      const currentMenuItem = findMenuItemByPath(menuItems, pathname);
      if (currentMenuItem && currentMenuItem.permission) {
        const isAdmin = user.roles.includes('Super Admin') || user.roles.includes('Coaching Admin');
        if (!isAdmin && !user.permissions.includes(currentMenuItem.permission)) {
          router.push('/admin/dashboard'); // Redirect to dashboard if no access
        }
      }
    }
  }, [mounted, isAuthenticated, user, router, pathname]);

  const menuItems: MenuItem[] = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'Dashboard.View',
    },
    {
      label: 'Academic',
      icon: BookOpen,
      permission: 'Academic.View',
      children: [
        {
          href: '/admin/branches',
          label: 'Branches',
          icon: Building2,
          permission: 'Academic.Branches.View',
        },
        {
          href: '/admin/courses',
          label: 'Courses',
          icon: BookOpen,
          permission: 'Academic.Courses.View',
        },
        {
          href: '/admin/batches',
          label: 'Batches',
          icon: UsersRound,
          permission: 'Academic.Batches.View',
        },
        {
          href: '/admin/shifts',
          label: 'Shifts',
          icon: Timer,
          permission: 'Academic.Shifts.View',
        },
        {
          href: '/admin/holidays',
          label: 'Holidays',
          icon: Calendar,
          permission: 'Academic.Holidays.View',
        },
      ],
    },
    {
      label: 'People',
      icon: Users,
      permission: 'People.View',
      children: [
        {
          href: '/admin/students',
          label: 'Students',
          icon: Users,
          permission: 'People.Students.View',
        },
        {
          href: '/admin/teachers',
          label: 'Teachers',
          icon: GraduationCap,
          permission: 'People.Teachers.View',
        },
        {
          href: '/admin/users',
          label: 'Users',
          icon: Users,
          permission: 'People.Users.View',
        },
      ],
    },
    {
      label: 'Setup',
      icon: Settings,
      permission: 'Setup.View',
      children: [
        {
          href: '/admin/qualifications',
          label: 'Qualifications',
          icon: Award,
          permission: 'Setup.Qualifications.View',
        },
        {
          href: '/admin/specializations',
          label: 'Specializations',
          icon: BookMarked,
          permission: 'Setup.Specializations.View',
        },
      ],
    },
    {
      label: 'Attendance',
      icon: CheckCircle,
      permission: 'Attendance.View',
      children: [
        {
          href: '/admin/attendance/approve',
          label: 'Approvals',
          icon: CheckCircle,
          permission: 'Attendance.Approve',
        },
        {
          href: '/admin/attendance/history',
          label: 'History',
          icon: History,
          permission: 'Attendance.View',
        },
      ],
    },
    {
      label: 'Finance',
      icon: DollarSign,
      permission: 'Finance.View',
      children: [
        {
          href: '/admin/payments',
          label: 'Payment Due',
          icon: DollarSign,
          permission: 'Finance.Payments.View',
        },
        {
          href: '/admin/subscription',
          label: 'Subscription',
          icon: Crown,
          permission: 'Finance.Subscription.View',
        },
      ],
    },
    {
      href: '/admin/roles',
      label: 'Roles & Permissions',
      icon: ShieldCheck,
      permission: 'People.Users.View', // Or dedicated permission
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'Settings.View',
    },
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    if (!user) return [];

    const hasAccess = (item: MenuItem) => {
      if (!item.permission) return true; // Default to public if no permission defined

      // Admins (Super and Coaching) always have access for now, 
      // but dynamic system is better
      if (user.roles.includes('Super Admin') || user.roles.includes('Coaching Admin')) return true;

      return user.permissions.includes(item.permission);
    };

    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => hasAccess(item))
        .map(item => ({
          ...item,
          children: item.children ? filterItems(item.children) : undefined,
        }))
        .filter(item => !item.children || item.children.length > 0 || item.href);
    };

    return filterItems(menuItems);
  }, [user, menuItems]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.roles.some(role => ALLOWED_ROLES.includes(role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Lazy Loaded */}
      <Suspense
        fallback={
          <aside className="w-64 bg-white shadow-lg fixed h-screen z-30">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </aside>
        }
      >
        <AdminSidebar menuItems={filteredMenuItems} onSidebarToggle={handleSidebarToggle} />
      </Suspense>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header - Lazy Loaded */}
        <Suspense
          fallback={
            <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </header>
          }
        >
          <AdminHeader menuItems={filteredMenuItems} />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Footer - Lazy Loaded */}
        <Suspense
          fallback={
            <footer className="bg-white border-t border-gray-200 py-4 px-6">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
            </footer>
          }
        >
          <AdminFooter />
        </Suspense>
      </div>
    </div>
  );
}
