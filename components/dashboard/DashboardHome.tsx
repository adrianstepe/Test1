import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import KPICards from './KPICards';
import AppointmentList from './AppointmentList';
import CalendarView from './CalendarView';
import { Bell, ChevronDown, Check } from 'lucide-react';
import { SPECIALISTS } from '../../constants';

interface Booking {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    service_name: string;
    start_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    doctor_id?: string;
    doctor_name?: string;
}

const DashboardHome: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewAs, setViewAs] = useState<string>('all'); // 'all' or doctor_id
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const activeDoctorName = viewAs === 'all'
        ? 'All Doctors'
        : SPECIALISTS.find(s => s.id === viewAs)?.name || 'Unknown Doctor';

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

            // Mock doctor data for existing bookings if missing
            const enrichedData = (data || []).map((b: any) => {
                if (!b.doctor_id) {
                    // Randomly assign a doctor for demo purposes
                    const randomDoctor = SPECIALISTS[Math.floor(Math.random() * SPECIALISTS.length)];
                    return { ...b, doctor_id: randomDoctor.id, doctor_name: randomDoctor.name };
                }
                return b;
            });

            setBookings(enrichedData);
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
        <div className="flex-1 bg-gray-50 min-h-screen ml-64">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-sm text-slate-500">Welcome back, Dr. Butkeviča</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Doctor Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-100 transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full ${viewAs === 'all' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            {activeDoctorName}
                            <ChevronDown size={16} className="text-slate-400" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    View Schedule As
                                </div>
                                <button
                                    onClick={() => { setViewAs('all'); setIsDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <span>All Doctors</span>
                                    {viewAs === 'all' && <Check size={14} className="text-blue-500" />}
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                {SPECIALISTS.map(doctor => (
                                    <button
                                        key={doctor.id}
                                        onClick={() => { setViewAs(doctor.id); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        <span>{doctor.name}</span>
                                        {viewAs === doctor.id && <Check size={14} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
                    </div>
                </div>
            </header>

            <main className="p-8">
                <KPICards />

                <div className="grid grid-cols-12 gap-6 h-[600px]">
                    <div className="col-span-12 lg:col-span-7 h-full">
                        <AppointmentList
                            bookings={viewAs === 'all' ? bookings : bookings.filter(b => b.doctor_id === viewAs)}
                            loading={loading}
                            onUpdateStatus={updateStatus}
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-5 h-full">
                        <CalendarView bookings={viewAs === 'all' ? bookings : bookings.filter(b => b.doctor_id === viewAs)} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardHome;
