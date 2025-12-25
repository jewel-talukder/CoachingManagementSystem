'use client';

import { useEffect, useState } from 'react';
import { attendanceApi, batchesApi } from '@/lib/api';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const fetchBatches = async () => {
    try {
      const response = await batchesApi.getAll({ isActive: true });
      setBatches(response.data);
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const response = await attendanceApi.get({
        batchId: selectedBatch,
        date: selectedDate,
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: number, status: string) => {
    if (!selectedBatch) return;
    try {
      await attendanceApi.mark({
        batchId: selectedBatch,
        date: new Date(selectedDate).toISOString(),
        attendanceItems: [
          {
            studentId,
            status,
          },
        ],
      });
      fetchAttendance();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Mark Attendance</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch
                </label>
                <select
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} - {batch.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Attendance for {selectedDate}</h2>
              <div className="space-y-4">
                {attendance.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No attendance records found. Select a batch and date to mark attendance.
                  </p>
                ) : (
                  attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-sm text-gray-500">{record.batchName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => markAttendance(record.studentId, 'Present')}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            record.status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5 inline mr-1" />
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(record.studentId, 'Absent')}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            record.status === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                          }`}
                        >
                          <XCircle className="h-5 w-5 inline mr-1" />
                          Absent
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

