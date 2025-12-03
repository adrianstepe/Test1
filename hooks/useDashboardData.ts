import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns';

export interface DashboardBooking {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    start_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    doctor_id?: string;
    service_id?: string;
    doctor_name?: string;
    service_name?: string;
    doctor?: {
        full_name: string;
    };
    services?: {
        name: any; // JSONB
        price_cents: number;
        duration_minutes?: number;
    };
    // Keep these for backward compatibility if needed, or map them from 'services'
    service?: {
        name: any;
        price: number;
        durationMinutes?: number;
    };
}

export interface DashboardStats {
    appointmentsToday: number;
    patientsWaiting: number;
    pendingRequests: number;
    revenue: number;
}

interface UseDashboardDataProps {
    dateRange?: { start: Date; end: Date };
    doctorId?: string | 'all';
}

export const useDashboardData = ({ dateRange, doctorId }: UseDashboardDataProps) => {
    const [bookings, setBookings] = useState<DashboardBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('No authenticated user found');
                setLoading(false);
                return;
            }

            console.log('Current User ID:', user.id);

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    services:service_id (
                        name,
                        price_cents,
                        duration_minutes
                    ),
                    doctor:doctor_id (
                        full_name
                    )
                `)
                .order('start_time', { ascending: true });

            // Filter by the selected doctor if specified
            if (doctorId && doctorId !== 'all') {
                query = query.eq('doctor_id', doctorId);
            }

            if (dateRange) {
                query = query.gte('start_time', dateRange.start.toISOString())
                    .lte('start_time', dateRange.end.toISOString());
            }

            const { data, error } = await query;

            console.log('Raw Data:', data, 'Error:', error);

            if (error) throw error;

            // Map data to match the interface expected by components
            const mappedData = (data as any[]).map(b => {
                // Handle the joined 'services' object
                const serviceData = Array.isArray(b.services) ? b.services[0] : b.services;
                // Handle the joined 'doctor' object
                const doctorData = Array.isArray(b.doctor) ? b.doctor[0] : b.doctor;

                return {
                    ...b,
                    service_name: serviceData?.name || 'Unknown Service',
                    doctor_name: doctorData?.full_name || 'Unassigned',
                    service: serviceData ? {
                        name: serviceData.name,
                        price: serviceData.price_cents ? serviceData.price_cents / 100 : 0,
                        durationMinutes: serviceData.duration_minutes || 30
                    } : undefined,
                    doctor: doctorData ? {
                        full_name: doctorData.full_name
                    } : undefined
                };
            });

            setBookings(mappedData as DashboardBooking[]);
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        // Real-time subscription
        const channel = supabase
            .channel('public:bookings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchBookings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [doctorId, dateRange?.start?.toISOString(), dateRange?.end?.toISOString()]);

    const stats = useMemo(() => {
        const today = new Date();
        const todayBookings = bookings.filter(b => isSameDay(parseISO(b.start_time), today));

        const appointmentsToday = todayBookings.filter(b => b.status !== 'cancelled').length;

        const patientsWaiting = todayBookings.filter(b =>
            b.status === 'confirmed' && new Date(b.start_time) > new Date()
        ).length;

        const pendingRequests = bookings.filter(b => b.status === 'pending').length;

        const revenue = bookings
            .filter(b => b.status === 'completed' || b.status === 'confirmed')
            .reduce((acc, curr) => acc + (curr.service?.price || 0), 0);

        return {
            appointmentsToday,
            patientsWaiting,
            pendingRequests,
            revenue
        };
    }, [bookings]);

    return { bookings, loading, error, stats, refresh: fetchBookings };
};
