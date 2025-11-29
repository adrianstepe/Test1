```typescript
import React, { useState, useEffect } from 'react';
import { Language, Specialist, Service, TimeSlot } from '../types';
import { SPECIALISTS, TEXTS } from '../constants';
import { checkAvailability } from '../services/api';

interface SpecialistSelectionProps {
  language: Language;
  selectedService: Service;
  selectedSpecialist: Specialist | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectSpecialist: (s: Specialist | null) => void;
  onSelectDate: (d: Date) => void;
  onSelectTime: (t: string) => void;
}

const SpecialistSelection: React.FC<SpecialistSelectionProps> = ({
  language,
  selectedService,
  selectedSpecialist,
  selectedDate,
  selectedTime,
  onSelectSpecialist,
  onSelectDate,
  onSelectTime,
}) => {
  // Filter specialists who can perform the selected service
  const availableSpecialists = SPECIALISTS.filter(s => s.specialties.includes(selectedService.id));

  // Generate next 7 days
  const [dates, setDates] = useState<Date[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1); // Start from tomorrow
      nextDays.push(d);
    }
    setDates(nextDays);
    if (!selectedDate) onSelectDate(nextDays[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // REAL AVAILABILITY CHECK
  useEffect(() => {
    const fetchRealSlots = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      setSlots([]); // Clear old slots while loading

      try {
        // Format YYYY-MM-DD (Local Time) to ensure n8n gets the correct day
        // We use 'en-CA' because it outputs YYYY-MM-DD consistently
        const dateStr = selectedDate.toLocaleDateString('en-CA'); 
        
        // Call the service
        const data = await checkAvailability(dateStr);
        
        if (data && data.slots) {
          setSlots(data.slots);
        }
      } catch (error) {
        console.error("Failed to load slots", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealSlots();
  }, [selectedDate, selectedSpecialist]);

  const formatDate = (date: Date) => {
    const dayName = date.toLocaleDateString(language === Language.EN ? 'en-US' : language === Language.LV ? 'lv-LV' : 'ru-RU', { weekday: 'short' });
    const dayNum = date.getDate();
    return { dayName, dayNum };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Specialist Selection */}
      <div>
        <h2 className="text-xl font-bold text-secondary dark:text-white mb-4">{TEXTS.selectSpecialist[language]}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {/* Option for "Any Specialist" */}
          <button
            onClick={() => onSelectSpecialist(null)}
            className={`min - w - [140px] p - 4 rounded - xl border - 2 flex flex - col items - center justify - center transition - all snap - start ${
  selectedSpecialist === null
    ? 'border-primary bg-teal-50 dark:bg-teal-900/20'
    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
} `}
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-2xl mb-2">
              🏥
            </div>
            <span className="text-sm font-medium text-center text-gray-900 dark:text-gray-100">{TEXTS.anySpecialist[language]}</span>
          </button>

          {availableSpecialists.map((spec) => (
            <button
              key={spec.id}
              onClick={() => onSelectSpecialist(spec)}
              className={`min - w - [140px] p - 4 rounded - xl border - 2 flex flex - col items - center transition - all snap - start ${
  selectedSpecialist?.id === spec.id
    ? 'border-primary bg-teal-50 dark:bg-teal-900/20'
    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
} `}
            >
              <img src={spec.photoUrl} alt={spec.name} className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-100 dark:border-slate-600" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100 text-center">{spec.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{spec.role[language]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h2 className="text-xl font-bold text-secondary dark:text-white mb-4">{TEXTS.stepDate[language]}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dates.map((date) => {
            const { dayName, dayNum } = formatDate(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                onClick={() => onSelectDate(date)}
                className={`min - w - [70px] p - 3 rounded - xl border transition - all flex flex - col items - center ${
  isSelected
    ? 'bg-secondary text-white border-secondary shadow-lg transform scale-105'
    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary'
} `}
              >
                <span className="text-xs uppercase font-medium mb-1 opacity-80">{dayName}</span>
                <span className="text-xl font-bold">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Checking availability...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py - 3 px - 2 rounded - lg text - sm font - medium border transition - all ${
  !slot.available
    ? 'bg-gray-50 dark:bg-slate-800/50 text-gray-300 dark:text-slate-600 border-transparent cursor-not-allowed decoration-slice'
    : selectedTime === slot.time
      ? 'bg-primary text-white border-primary shadow-md'
      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:border-primary hover:text-primary'
} `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            {selectedDate && slots.length === 0 && (
               <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">No slots available for this date.</p>
            )}
            {selectedDate && slots.length > 0 && slots.every(s => !s.available) && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">All slots are fully booked.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialistSelection;