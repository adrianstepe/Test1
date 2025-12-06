import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import KPICards from './KPICards';
import AppointmentList from './AppointmentList';
import CalendarView from './CalendarView';
import { Bell, ChevronDown, Check, Sun, Moon, LogOut } from 'lucide-react';
import { SPECIALISTS } from '../../constants';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const DashboardHome: React.FC = () => {
    // Fetch data using our new hook
    // Default to 'all' or handle user context internally in the hook if needed
    const { bookings, loading, error, stats, refresh } = useDashboardData({
        doctorId: 'all'
    });

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

    // Ensure theme is applied on mount and updates correctly
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const { signOut } = useUser();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-slate-900 min-h-screen w-full transition-colors flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-20 transition-colors">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Panelis</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ārsta režīms</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="p-2 text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
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
