'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, lazy } from 'react';
import { LayoutDashboard, Users, BookOpen, UsersRound, Settings, DollarSign, GraduationCap, Crown, Award, BookMarked, Building2, Calendar, CheckCircle, Timer, History } from 'lucide-react';

// Lazy load components
const AdminSidebar = lazy(() => import('./admin/AdminSidebar'));
const AdminHeader = lazy(() => import('./admin/AdminHeader'));
const AdminFooter = lazy(() => import('./admin/AdminFooter'));

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, hasRole } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen);
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user || (!user.roles.includes('Coaching Admin') && !user.roles.includes('Super Admin')))) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (!user.roles.includes('Coaching Admin') && !user.roles.includes('Super Admin'))) {
    return null;
  }

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/branches',
      label: 'Branches',
      icon: Building2,
    },
    {
      href: '/admin/students',
      label: 'Students',
      icon: Users,
    },
    {
      href: '/admin/teachers',
      label: 'Teachers',
      icon: GraduationCap,
    },
    {
      href: '/admin/qualifications',
      label: 'Qualifications',
      icon: Award,
    },
    {
      href: '/admin/specializations',
      label: 'Specializations',
      icon: BookMarked,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/courses',
      label: 'Courses',
      icon: BookOpen,
    },
    {
      href: '/admin/batches',
      label: 'Batches',
      icon: UsersRound,
    },
    {
      href: '/admin/shifts',
      label: 'Shifts',
      icon: Timer,
    },
    {
      href: '/admin/holidays',
      label: 'Holidays',
      icon: Calendar,
    },
    {
      href: '/admin/payments',
      label: 'Payment Due',
      icon: DollarSign,
    },
    {
      href: '/admin/attendance/approve',
      label: 'Approvals',
      icon: CheckCircle,
    },
    {
      href: '/admin/attendance/history',
      label: 'History',
      icon: History,
    },
    {
      href: '/admin/subscription',
      label: 'Subscription',
      icon: Crown,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

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
        <AdminSidebar menuItems={menuItems} onSidebarToggle={handleSidebarToggle} />
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
          <AdminHeader menuItems={menuItems} />
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

