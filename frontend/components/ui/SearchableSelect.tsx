import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeAll?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ label, options, value, onChange, placeholder = 'Select an option...', includeAll = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allOptions = useMemo(() => (includeAll ? [{ value: 'all', label: 'All' }, ...options] : options), [options, includeAll]);

  const filteredOptions = useMemo(() =>
    allOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allOptions, searchTerm]);

  const selectedLabel = allOptions.find(opt => opt.value === value)?.label || placeholder;

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="w-full" ref={selectRef}>
      <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-background border border-border rounded-md px-3 py-2 text-text-primary text-left focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 flex flex-col">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-background border border-border rounded-md pl-8 pr-2 py-1.5 text-sm text-text-primary focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <ul className="overflow-y-auto flex-1 p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                      value === option.value ? 'bg-primary-600 text-white' : 'text-text-primary hover:bg-border'
                    }`}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-text-secondary text-center">No options found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;