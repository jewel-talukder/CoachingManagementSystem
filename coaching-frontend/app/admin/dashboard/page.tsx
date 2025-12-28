import AdminLayout from '@/components/layouts/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to the admin dashboard!</p>
        </div>
      </div>
    </AdminLayout>
  );
}




