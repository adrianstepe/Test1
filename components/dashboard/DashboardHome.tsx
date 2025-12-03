import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import KPICards from './KPICards';
import AppointmentList from './AppointmentList';
import CalendarView from './CalendarView';
import { Bell, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { SPECIALISTS } from '../../constants';
import { useDashboardData } from '../../hooks/useDashboardData';

const DashboardHome: React.FC = () => {
    const [viewAs, setViewAs] = useState<string>('all'); // 'all' or doctor_id
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch data using our new hook
    const { bookings, loading, error, stats, refresh } = useDashboardData({
        doctorId: viewAs
    });

    const activeDoctorName = viewAs === 'all'
        ? 'All Doctors'
        : SPECIALISTS.find(s => s.id === viewAs)?.name || 'Unknown Doctor';

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Failed to update');
        } else {
            refresh();
        }
    };

    // Transform bookings for child components if necessary
    // The hook returns data with joined tables, we might need to flatten it or pass as is.
    // AppointmentList expects: Booking[] (defined locally there, might need update)
    // Let's map our hook data to the shape expected by AppointmentList/CalendarView
    const mappedBookings = bookings.map(b => ({
        id: b.id,
        created_at: b.created_at,
        customer_name: b.customer_name,
        customer_email: b.customer_email,
        service_name: b.service_name,
        start_time: b.start_time,
        status: b.status,
        doctor_id: b.doctor_id,
        doctor_name: b.doctor?.full_name || 'Unassigned',
        duration: b.service?.durationMinutes
    }));

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="flex-1 bg-gray-50 min-h-screen w-full">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-sm text-slate-500">Doctor Focus Mode</p>
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

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </header>

            <main className="p-8">
                <KPICards stats={stats} />

                <div className="grid grid-cols-12 gap-6 h-[600px]">
                    <div className="col-span-12 lg:col-span-7 h-full">
                        <AppointmentList
                            bookings={mappedBookings}
                            loading={loading}
                            error={error}
                            onUpdateStatus={updateStatus}
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-5 h-full">
                        <CalendarView bookings={mappedBookings} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardHome;
