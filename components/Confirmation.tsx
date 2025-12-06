import React from 'react';
import { Language, BookingState } from '../types';
import { TEXTS } from '../constants';
import { saveBookingToSupabase } from '../services/bookingService';

interface ConfirmationProps {
  language: Language;
  booking: BookingState;
}

const Confirmation: React.FC<ConfirmationProps> = ({ language, booking }) => {
  const [saveStatus, setSaveStatus] = React.useState<'pending' | 'saving' | 'saved' | 'error'>('pending');
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const hasSaved = React.useRef(false);

  // Save booking to Supabase when confirmation page loads
  React.useEffect(() => {
    const saveBooking = async () => {
      // Prevent double saves
      if (hasSaved.current) {
        console.log('[Confirmation] Already saved, skipping');
        return;
      }

      console.log('[Confirmation] Checking booking data...');
      console.log('[Confirmation] selectedDate:', booking.selectedDate);
      console.log('[Confirmation] selectedTime:', booking.selectedTime);
      console.log('[Confirmation] selectedService:', booking.selectedService);
      console.log('[Confirmation] patientData:', booking.patientData);

      if (!booking.selectedDate || !booking.selectedTime || !booking.selectedService) {
        console.error('[Confirmation] Missing booking data, cannot save');
        console.error('[Confirmation] Missing:', {
          date: !booking.selectedDate,
          time: !booking.selectedTime,
          service: !booking.selectedService
        });
        setSaveStatus('error');
        setSaveError('Missing booking data. Please start over.');
        return;
      }

      if (!booking.patientData.email || !booking.patientData.firstName) {
        console.error('[Confirmation] Missing patient data');
        setSaveStatus('error');
        setSaveError('Missing patient information. Please start over.');
        return;
      }

      setSaveStatus('saving');
      hasSaved.current = true;

      // Calculate start and end times
      const [hours, minutes] = booking.selectedTime.split(':').map(Number);
      const startDate = new Date(booking.selectedDate);
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + (booking.selectedService.durationMinutes || 60));

      // Prepare booking data
      const bookingData = {
        customer_name: `${booking.patientData.firstName} ${booking.patientData.lastName}`,
        customer_email: booking.patientData.email,
        phone: booking.patientData.phone,
        service_id: booking.selectedService.id,
        service_name: booking.selectedService.name[language] || booking.selectedService.name.EN,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        doctor_id: booking.selectedSpecialist?.id,
        doctor_name: booking.selectedSpecialist?.name,
        language: language,
        amount_paid: 30, // Deposit amount
        status: 'confirmed',
      };

      console.log('[Confirmation] Saving booking to Supabase:', JSON.stringify(bookingData, null, 2));

      const result = await saveBookingToSupabase(bookingData);

      if (result.success) {
        console.log('[Confirmation] ✅ Booking saved successfully:', result.id);
        setSaveStatus('saved');
        // Clear localStorage after successful save
        localStorage.removeItem('butkevicaBookingState');
      } else {
        console.error('[Confirmation] ❌ Failed to save booking:', result.error);
        setSaveStatus('error');
        setSaveError(result.error || 'Unknown error');
      }
    };

    // Only run if booking data is present
    if (booking.selectedDate && booking.selectedTime && booking.selectedService) {
      saveBooking();
    } else {
      console.log('[Confirmation] Waiting for booking data...');
    }
  }, [booking.selectedDate, booking.selectedTime, booking.selectedService, booking.patientData, language]);

  const getEventDetails = () => {
    if (!booking.selectedDate || !booking.selectedTime || !booking.selectedService) return null;

    const [hours, minutes] = booking.selectedTime.split(':').map(Number);
    const startDate = new Date(booking.selectedDate);
    startDate.setHours(hours, minutes);

    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (booking.selectedService.durationMinutes || 60));

    return {
      title: `Dentist: ${booking.selectedService.name[language]}`,
      description: `Appointment with ${booking.selectedSpecialist?.name || 'Specialist'}. Service: ${booking.selectedService.name[language]}`,
      location: 'Butkeviča Dental Practice',
      start: startDate,
      end: endDate
    };
  };

  const [syncLoading, setSyncLoading] = React.useState(false);

  const addToGoogleCalendar = async () => {
    // 1. Validation
    if (!booking.selectedDate || !booking.patientData.email) {
      alert('Booking data missing. Please refresh');
      return;
    }

    if (syncLoading) return;
    setSyncLoading(true);

    try {
      // Use the actual n8n instance URL
      const webhookUrl = "https://n8n.srv1152467.hstgr.cloud/webhook/manual-calendar-sync";

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: `${booking.patientData.firstName} ${booking.patientData.lastName}`,
          customer_email: booking.patientData.email,
          service_name: booking.selectedService?.name[language],
          // Fix Timezone: Send local YYYY-MM-DD
          booking_date: new Date(booking.selectedDate).toLocaleDateString('en-CA'),
          booking_time: booking.selectedTime
        })
      });

      if (response.ok) {
        alert(TEXTS.calendarAdded[language] || "Added to Calendar!");
      } else {
        console.error("Failed to sync calendar");
      }
    } catch (error) {
      console.error("Error syncing calendar:", error);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="animate-fade-in text-center py-10">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 text-4xl">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">{TEXTS.successTitle[language]}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{TEXTS.successMsg[language]}</p>

      {/* Save Status Indicator */}
      <div className="mb-6">
        {saveStatus === 'pending' && (
          <span className="text-yellow-600 text-sm">⏳ Sagatavojas...</span>
        )}
        {saveStatus === 'saving' && (
          <span className="text-blue-600 text-sm">💾 Saglabā pierakstu...</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-green-600 text-sm">✅ Pieraksts saglabāts!</span>
        )}
        {saveStatus === 'error' && (
          <div className="text-red-600 text-sm">
            ❌ Kļūda saglabājot: {saveError}
            <br />
            <span className="text-xs text-gray-500">Pārbaudiet konsoli (F12) kļūdu detaļām</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 max-w-sm mx-auto text-left mb-8">
        <div className="space-y-3">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{TEXTS.stepService[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">{booking.selectedService?.name[language]}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{TEXTS.selectSpecialist[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">{booking.selectedSpecialist?.name || TEXTS.anySpecialist[language]}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{TEXTS.stepDate[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">{booking.selectedDate?.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Time</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">{booking.selectedTime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={addToGoogleCalendar}
          disabled={syncLoading}
          className={`w-full max-w-xs mx-auto block py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 ${syncLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          📅 {syncLoading ? 'Syncing...' : `${TEXTS.addToCalendar[language]} (Google)`}
        </button>
      </div>
    </div>
  );
};

export default Confirmation;