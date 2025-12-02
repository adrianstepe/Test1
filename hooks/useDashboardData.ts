import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { SERVICES } from '../constants';
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
    service?: {
        name: any; // JSONB
        price: number;
        durationMinutes: number;
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
            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    doctor:profiles(full_name)
                `)
                .order('start_time', { ascending: true });

            if (doctorId && doctorId !== 'all') {
                query = query.eq('doctor_id', doctorId);
            }

            // If date range is provided, filter by it. 
            // Note: This might need adjustment based on how you want to view "all time" vs "specific range"
            // For now, let's fetch all and filter in memory for the calendar if needed, 
            // or if the range is strict, apply it here.
            // Given the requirement "Filter by Date: It should accept a date range", let's apply it if present.
            if (dateRange) {
                query = query.gte('start_time', dateRange.start.toISOString())
                    .lte('start_time', dateRange.end.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map price_cents to price and flatten structure for components
            const mappedData = (data as any[]).map(b => {
                const serviceDef = SERVICES.find(s => s.id === b.service_id);
                return {
                    ...b,
                    doctor_name: b.doctor?.full_name,
                    service_name: serviceDef?.name?.['EN'] || 'Unknown Service',
                    service: serviceDef ? {
                        name: serviceDef.name,
                        price: serviceDef.price,
                        durationMinutes: serviceDef.durationMinutes
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
                    // Refresh data on any change
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

        // "Patients Waiting" could be interpreted as people in the waiting room (checked in?) 
        // or just upcoming appointments today. Let's assume upcoming today.
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
