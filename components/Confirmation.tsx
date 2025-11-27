import React from 'react';
import { Language, BookingState } from '../types';
import { TEXTS } from '../constants';

interface ConfirmationProps {
  language: Language;
  booking: BookingState;
}

const Confirmation: React.FC<ConfirmationProps> = ({ language, booking }) => {
  return (
    <div className="animate-fade-in text-center py-10">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-4xl">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-secondary mb-2">{TEXTS.successTitle[language]}</h2>
      <p className="text-gray-500 mb-8">{TEXTS.successMsg[language]}</p>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 max-w-sm mx-auto text-left mb-8">
        <div className="space-y-3">
            <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Service</span>
                <span className="font-medium">{booking.selectedService?.name[language]}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Specialist</span>
                <span className="font-medium">{booking.selectedSpecialist?.name || 'Any'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Date</span>
                <span className="font-medium">{booking.selectedDate?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Time</span>
                <span className="font-medium">{booking.selectedTime}</span>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full max-w-xs mx-auto block py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
           📅 {TEXTS.addToCalendar[language]} (Google)
        </button>
        <button className="w-full max-w-xs mx-auto block py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
           📅 {TEXTS.addToCalendar[language]} (Outlook/iCal)
        </button>
      </div>
    </div>
  );
};

export default Confirmation;