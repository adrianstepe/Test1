import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

interface Booking {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    service_name: string;
    start_time: string;
    status: 'confirmed' | 'cancelled' | 'completed';
}

const AdminDashboard: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Failed to update');
        } else {
            fetchBookings();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Doctor's Dashboard</h1>
                        <p className="text-slate-500">Manage incoming web bookings</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        className="bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm font-medium"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading appointments...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => {
                                    const date = new Date(booking.start_time);
                                    const isPast = date < new Date();

                                    return (
                                        <tr key={booking.id} className={`hover:bg-slate-50 transition-colors ${isPast ? 'opacity-60 bg-gray-50' : ''}`}>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">
                                                    {date.toLocaleDateString()}
                                                </div>
                                                <div className="text-slate-500 text-sm">
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900">{booking.customer_name}</div>
                                                <div className="text-slate-400 text-xs">{booking.customer_email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {booking.service_name || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                >
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {bookings.length === 0 && (
                            <div className="p-10 text-center text-gray-400">No bookings found yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
