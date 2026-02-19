'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';

export interface MenuItem {
  href?: string;
  label: string;
  icon: any;
  permission?: string;
  children?: MenuItem[];
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  onSidebarToggle?: (isOpen: boolean) => void;
}

export default function AdminSidebar({ menuItems, onSidebarToggle }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(sidebarOpen);
    }
  }, [sidebarOpen, onSidebarToggle]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const isChildActive = (item: MenuItem): boolean => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isChildActive(child));
    }
    return false;
  };

  // Automatically open parent menus if a child is active
  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let changed = false;
    menuItems.forEach((item) => {
      if (item.children && isChildActive(item)) {
        if (!newOpenMenus[item.label]) {
          newOpenMenus[item.label] = true;
          changed = true;
        }
      }
    });
    if (changed) {
      setOpenMenus(newOpenMenus);
    }
  }, [pathname, menuItems]);

  return (
    <aside
      className={`${sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 ease-in-out fixed h-screen z-30`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CoachingSheba</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const active = isActive(item.href);
              const childActive = isChildActive(item);
              const isOpen = openMenus[item.label];

              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                      {sidebarOpen && (
                        <span className={`font-medium ${active ? 'text-blue-600' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${childActive && !isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${childActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          {sidebarOpen && (
                            <span className={`font-medium ${childActive ? 'text-blue-600' : 'text-gray-700'}`}>
                              {item.label}
                            </span>
                          )}
                        </div>
                        {sidebarOpen && (
                          <div className={`${isOpen ? 'rotate-180' : ''} transition-transform`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        )}
                      </button>

                      {isOpen && sidebarOpen && hasChildren && (
                        <ul className="mt-1 ml-4 border-l border-gray-100 space-y-1">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActiveItem = isActive(child.href);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href!}
                                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isChildActiveItem
                                    ? 'text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                  <ChildIcon className="w-4 h-4" />
                                  <span className="text-sm">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer in Sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>© 2024 CoachingSheba</p>
              <p className="mt-1">Admin Panel</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

