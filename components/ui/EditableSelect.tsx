'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCustom?: boolean;
}

export function EditableSelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  label,
  required = false,
  allowCustom = true
}: EditableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrer les options selon la recherche
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus sur l'input quand on passe en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
    setIsEditing(false);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setCustomValue('');
      setIsEditing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Mode édition personnalisée */}
      {isEditing && allowCustom ? (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
            className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Entrer une valeur personnalisée"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Check size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setCustomValue('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      ) : (
        <>
          {/* Bouton principal */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                {value || placeholder}
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setCustomValue(value);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                title="Modifier"
              >
                <Edit2 size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden"
              >
                {/* Barre de recherche */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Liste des options */}
                <div className="overflow-y-auto max-h-48">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors flex items-center justify-between ${
                          value === option ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span>{option}</span>
                        {value === option && <Check size={16} className="text-orange-600" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Aucun résultat trouvé
                    </div>
                  )}
                </div>

                {/* Option personnalisée */}
                {allowCustom && searchQuery && !filteredOptions.includes(searchQuery) && (
                  <div className="border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelect(searchQuery);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-600 font-medium"
                    >
                      + Utiliser "{searchQuery}"
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
