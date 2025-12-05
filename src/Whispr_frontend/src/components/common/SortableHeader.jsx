import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SortableHeader = ({ label, field, currentSort, currentDirection, onSort }) => {
  const handleSort = () => {
    onSort(field);
  };

  return (
    <th 
      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300"
      onClick={handleSort}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {currentSort === field && (
          <ArrowUpDown className="ml-1 h-4 w-4" />
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
