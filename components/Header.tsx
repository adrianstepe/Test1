import React from 'react';
import { Language, Translations } from '../types';
import { TEXTS } from '../constants';

interface HeaderProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, setLanguage }) => {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          B
        </div>
        <div>
          <h1 className="text-lg font-bold text-secondary leading-tight hidden sm:block">Butkeviča</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider hidden sm:block">Dental Clinic</p>
        </div>
      </div>
      
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {Object.values(Language).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              currentLanguage === lang
                ? 'bg-white text-primary shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;