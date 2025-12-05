import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = "Search...", className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm w-full"
    />
  </div>
);

const SelectFilter = ({ value, onChange, options, placeholder = "Filter", className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="flex items-center">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
    </div>
  </div>
);

export { SearchInput, SelectFilter };
