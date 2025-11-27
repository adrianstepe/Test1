import React, { useState } from 'react';
import { Language, PatientData } from '../types';
import { TEXTS } from '../constants';

interface PatientFormProps {
  language: Language;
  data: PatientData;
  updateData: (data: Partial<PatientData>) => void;
}

const COUNTRY_CODES = [
  { code: '+371', flag: '🇱🇻' },
  { code: '+370', flag: '🇱🇹' },
  { code: '+372', flag: '🇪🇪' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+353', flag: '🇮🇪' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+1', flag: '🇺🇸' },
];

const PatientForm: React.FC<PatientFormProps> = ({ language, data, updateData }) => {
  const [countryCode, setCountryCode] = useState('+371');

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-secondary dark:text-white">{TEXTS.personalInfo[language]}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{TEXTS.firstName[language]} *</label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{TEXTS.lastName[language]} *</label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{TEXTS.email[language]} *</label>
          <input
            type="email"
            required
            className="w-full p-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{TEXTS.phone[language]} *</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="p-3 border border-gray-300 dark:border-slate-600 border-r-0 rounded-l-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              required
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="20000000"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {TEXTS.symptoms[language]}
        </label>
        <textarea
          rows={3}
          className="w-full p-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          value={data.details}
          onChange={(e) => updateData({ details: e.target.value })}
          placeholder="..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{TEXTS.uploadPhoto[language]}</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400">{data.medicalPhoto ? data.medicalPhoto.name : 'Click to upload (JPG, PNG)'}</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  updateData({ medicalPhoto: e.target.files[0] });
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              required
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 checked:bg-primary checked:border-primary transition-all"
              checked={data.gdprConsent}
              onChange={(e) => updateData({ gdprConsent: e.target.checked })}
            />
            <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 14 14" fill="none">
              <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none">
            {TEXTS.gdprLabel[language]} <a href="#" className="text-primary hover:underline">Read Policy</a>.
          </span>
        </label>
      </div>
    </div>
  );
};

export default PatientForm;