'use client';

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          © 2024 CoachingSheba. All rights reserved.
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Admin Panel</span>
          <span>•</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

