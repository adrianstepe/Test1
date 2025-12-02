import React from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, getHours } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
    id: string;
    start_time: string;
    customer_name: string;
    service_name: string;
    doctor_id?: string;
    doctor_name?: string;
}

interface CalendarViewProps {
    bookings: Booking[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday

    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 9 }).map((_, i) => i + 9); // 9 AM to 5 PM

    const getBookingsForSlot = (day: Date, hour: number) => {
        return bookings.filter(b => {
            const bookingDate = parseISO(b.start_time);
            return isSameDay(bookingDate, day) && getHours(bookingDate) === hour;
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Weekly Schedule</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="p-1 hover:bg-gray-100 rounded-full text-slate-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-slate-600">
                        {format(startDate, 'MMM d')} - {format(addDays(startDate, 4), 'MMM d')}
                    </span>
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="p-1 hover:bg-gray-100 rounded-full text-slate-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-6 min-w-[600px]">
                    {/* Time Column */}
                    <div className="border-r border-gray-100 bg-gray-50/50">
                        <div className="h-10 border-b border-gray-100"></div> {/* Header spacer */}
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-gray-100 text-xs text-slate-400 font-medium flex items-start justify-center pt-2">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="flex-1 border-r border-gray-100 last:border-r-0">
                            <div className="h-10 border-b border-gray-100 flex flex-col items-center justify-center bg-gray-50/30">
                                <span className="text-xs font-bold text-slate-700">{format(day, 'EEE')}</span>
                                <span className="text-[10px] text-slate-400">{format(day, 'd')}</span>
                            </div>

                            {hours.map(hour => {
                                const slotBookings = getBookingsForSlot(day, hour);
                                return (
                                    <div key={hour} className="h-20 border-b border-gray-100 relative p-1 group">
                                        {slotBookings.map((booking, i) => (
                                            <div
                                                key={booking.id}
                                                className="absolute inset-x-1 top-1 bottom-1 bg-teal-100 border border-teal-200 rounded-md p-1.5 overflow-hidden hover:z-10 hover:shadow-md transition-all cursor-pointer"
                                                style={{ top: `${i * 5}px`, left: `${i * 5}px`, right: `${5 - i * 5}px` }}
                                            >
                                                <div className="text-[10px] font-bold text-teal-800 truncate">{booking.customer_name}</div>
                                                <div className="text-[9px] text-teal-600 truncate">{booking.service_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
