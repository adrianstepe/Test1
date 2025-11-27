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
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 text-4xl">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">{TEXTS.successTitle[language]}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{TEXTS.successMsg[language]}</p>

      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 max-w-sm mx-auto text-left mb-8">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Service</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.selectedService?.name[language]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Specialist</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.selectedSpecialist?.name || 'Any'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Date</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.selectedDate?.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Time</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.selectedTime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full max-w-xs mx-auto block py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800">
          📅 {TEXTS.addToCalendar[language]} (Google)
        </button>
        <button className="w-full max-w-xs mx-auto block py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800">
          📅 {TEXTS.addToCalendar[language]} (Outlook/iCal)
        </button>
      </div>
    </div>
  );
};

export default Confirmation;