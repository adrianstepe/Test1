import React from 'react';
import { Service, Language } from '../types';
import { SERVICES, TEXTS } from '../constants';

interface ServiceSelectionProps {
  language: Language;
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ language, selectedService, onSelect }) => {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary mb-2">{TEXTS.selectService[language]}</h2>
        <p className="text-gray-500">Choose a treatment to view availability and pricing.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((service) => {
          const isSelected = selectedService?.id === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left flex flex-col h-full w-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${isSelected 
                  ? 'border-primary bg-teal-50/50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5'
                }
              `}
              aria-pressed={isSelected}
            >
              <span className="text-3xl font-bold text-primary mb-3 block">
                €{service.price}
              </span>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.name[language]}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                {service.description[language]}
              </p>

              <div className="pt-4 border-t border-gray-100 w-full mt-auto">
                <span className="text-sm font-medium text-gray-400">
                  {service.durationMinutes} min
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelection;