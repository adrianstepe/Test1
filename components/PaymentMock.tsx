import React, { useState } from 'react';
import { Language, Service, BookingState } from '../types';
import { TEXTS } from '../constants';

// Declare Stripe on window object to avoid TS errors without installing types
declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

interface PaymentMockProps {
  language: Language;
  service: Service;
  booking: BookingState;
  onConfirm: () => void; // Kept for prop compatibility
}

const PaymentMock: React.FC<PaymentMockProps> = ({ language, service, booking }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const depositAmount = 30; // Fixed deposit
  const remainingBalance = service.price - depositAmount;

  const handlePay = async () => {
    setLoading(true);
    setErrorMsg(null);
    setPaymentUrl(null);

    try {
      const amountInCents = depositAmount * 100;

      // Determine a safe Base URL
      const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
          return window.location.origin + window.location.pathname;
        }
        return ''; // No fallback to external domains
      };

      const baseUrl = getBaseUrl();
      const successUrl = `${baseUrl}?success=1`;
      const cancelUrl = `${baseUrl}?cancel=1`;

      // 1. Format the date to ISO string (YYYY-MM-DD) to ensure stability
      const isoDate = booking.selectedDate ? new Date(booking.selectedDate).toISOString().split('T')[0] : '';

      // 1. Call Backend to create Checkout Session
      const apiUrl = import.meta.env.VITE_API_URL || 'https://stripe-mvp-proxy.adriansbusinessw.workers.dev/';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          amount: amountInCents,
          service: service.name[Language.EN],
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer: {
            name: `${booking.patientData.firstName} ${booking.patientData.lastName}`,
            email: booking.patientData.email,
            phone: booking.patientData.phone
          },
          booking: {
            // UPDATED: Send the clean ISO date string
            date: isoDate,
            time: booking.selectedTime,
            serviceId: service.id,
            // OPTIONAL: Pass the translated service name for the Calendar Event Title
            serviceName: service.name[booking.language] || service.name[Language.EN],
            language: booking.language,
            doctor_id: booking.selectedSpecialist?.id || null,
            doctor_name: booking.selectedSpecialist?.name || null
          }
        })
      });

      if (!response.ok) {
        let errText = response.statusText;
        try {
          const errJson = await response.json();
          errText = errJson.error || response.statusText;
        } catch (e) {
          errText = await response.text();
        }
        throw new Error(`Server Error: ${errText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error("Invalid response from payment server (no checkout URL).");
      }

      console.log("Payment URL received:", data.url); // Debug log

      // 2. Direct Redirect
      // We try to set window.location.href. 
      // If this is blocked (e.g. by sandbox permissions), we catch the error 
      // and show a manual button instead.
      try {
        window.location.href = data.url;
      } catch (navigationError: any) {
        console.warn("Auto-redirect blocked. Falling back to manual link.", navigationError);
        setPaymentUrl(data.url);
        setLoading(false); // Stop loading to show the link
      }

    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      if (err.message === 'Failed to fetch') {
        setErrorMsg("Network Error: Could not connect to the payment server. Please ensure the Cloudflare Worker URL is correct and deployed.");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  // Format date for display - cleaner format: "Mon, 8 Dec • 09:00"
  const formatDisplayDate = (date: Date | null, time: string | null) => {
    if (!date) return '-';
    const locale = language === Language.EN ? 'en-US' : language === Language.LV ? 'lv-LV' : 'ru-RU';
    const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'short' });
    return `${weekday}, ${day} ${month}${time ? ` • ${time}` : ''}`;
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto pb-28 sm:pb-0">
      {/* Clean Receipt Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{TEXTS.appointmentSummary[language]}</h2>
      </div>

      {/* Appointment Details - Clean List with Dividers (No Card Container) */}
      <div className="space-y-0 mb-8">
        {/* Date & Time Row */}
        <div className="flex items-center gap-3 py-4 border-b border-gray-100 dark:border-slate-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{TEXTS.dateLabel[language]} & {TEXTS.timeLabel[language]}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDisplayDate(booking.selectedDate, booking.selectedTime)}</p>
          </div>
        </div>

        {/* Service Row */}
        <div className="flex items-center gap-3 py-4 border-b border-gray-100 dark:border-slate-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{TEXTS.serviceLabel[language]}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{service.name[language]}</p>
          </div>
        </div>

        {/* Specialist Row (if selected) */}
        {booking.selectedSpecialist && (
          <div className="flex items-center gap-3 py-4 border-b border-gray-100 dark:border-slate-700">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{TEXTS.specialistLabel[language]}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.selectedSpecialist.name}</p>
            </div>
          </div>
        )}

        {/* Patient Row */}
        <div className="flex items-center gap-3 py-4 border-b border-gray-100 dark:border-slate-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{TEXTS.personalInfo[language]}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.patientData.firstName} {booking.patientData.lastName}</p>
          </div>
        </div>
      </div>

      {/* Receipt-Style Pricing Section */}
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 mb-6">
        {/* Total Cost */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">{TEXTS.total[language]}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">€{service.price}</span>
        </div>

        {/* Remaining Balance */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-slate-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {language === Language.EN ? 'Balance Due at Clinic' : language === Language.LV ? 'Atlikusī summa klīnikā' : 'Остаток в клинике'}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">€{remainingBalance}</span>
        </div>

        {/* Due Now - Large and Bold */}
        <div className="flex justify-between items-center pt-4">
          <div>
            <span className="text-base font-bold text-gray-900 dark:text-white block">
              {language === Language.EN ? 'Due Now' : language === Language.LV ? 'Maksājams tagad' : 'К оплате сейчас'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === Language.EN ? 'Deposit to secure your slot' : language === Language.LV ? 'Depozīts rezervācijai' : 'Депозит для бронирования'}
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">€{depositAmount}</span>
        </div>
      </div>

      {/* Trust Signal - Compact Info */}
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 px-1">
        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>{TEXTS.reservationFeeDesc2[language]}</span>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Sticky Payment Button - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4 shadow-lg sm:relative sm:border-0 sm:shadow-none sm:bg-transparent dark:sm:bg-transparent sm:p-0 z-50">
        <div className="max-w-md mx-auto">
          {paymentUrl ? (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 flex items-center justify-center gap-2 no-underline transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Continue to Payment</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ) : (
            <button
              onClick={handlePay}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{TEXTS.paySecure[language]} • €{depositAmount}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          )}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500">
            <span className="text-xs font-semibold">Powered by</span>
            <span className="font-bold italic text-lg">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMock;