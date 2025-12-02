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

  return (
    <div className="animate-fade-in max-w-md mx-auto">
      {/* Reservation Fee Policy Information */}
      <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-xl border-2 border-teal-200 dark:border-teal-800 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">ℹ️</div>
          <div className="flex-1">
            <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-3 text-lg">
              {TEXTS.reservationFeeTitle[language]} 30 €
            </h3>
            <ul className="space-y-2 text-sm text-teal-800 dark:text-teal-200">
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                <span>{TEXTS.reservationFeeDesc1[language]}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">✓</span>
                <span>{TEXTS.reservationFeeDesc2[language]}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">✗</span>
                <span>{TEXTS.reservationFeeDesc3[language]}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{TEXTS.personalInfo[language]}</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>{TEXTS.firstName[language]} {TEXTS.lastName[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.patientData.firstName} {booking.patientData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span>{TEXTS.email[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.patientData.email}</span>
          </div>
          <div className="flex justify-between">
            <span>{TEXTS.phone[language]}</span>
            <span className="font-medium text-gray-900 dark:text-white">{booking.patientData.phone}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{TEXTS.total[language]}</h3>
        <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
          <span>{service.name[language]}</span>
          <span>€{service.price}</span>
        </div>
        <div className="flex justify-between text-sm mb-4 text-gray-600 dark:text-gray-400">
          <span>Reservation Fee (Deposit)</span>
          <span>€{depositAmount}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4 flex justify-between font-bold text-lg text-secondary dark:text-teal-400">
          <span>{TEXTS.deposit[language]}</span>
          <span>€{depositAmount}</span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm text-center">
        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🔒
        </div>

        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secure Checkout</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You will be redirected to Stripe to securely complete your payment of €{depositAmount}.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        {paymentUrl ? (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-primary hover:bg-teal-700 flex items-center justify-center gap-2 no-underline"
          >
            <span>Continue to Payment &rarr;</span>
          </a>
        ) : (
          <button
            onClick={handlePay}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-teal-700'
              }`}
          >
            {loading ? (
              <span>Preparing Checkout...</span>
            ) : (
              <>
                <span>{TEXTS.paySecure[language]} €{depositAmount}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 grayscale opacity-60">
          <span className="text-xs font-semibold">Powered by</span>
          <span className="font-bold italic text-lg">Stripe</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMock;