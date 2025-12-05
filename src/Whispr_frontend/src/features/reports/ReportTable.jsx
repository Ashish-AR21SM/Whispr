import React from 'react';
import { SearchInput, SelectFilter } from '../../components/ui/Filters';
import SortableHeader from '../../components/common/SortableHeader';
import { StatusBadge } from '../../components/common/StatusComponents';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { formatDate, truncateText } from '../../utils/helpers';
import { REPORT_CATEGORIES } from '../../constants';
import { Eye } from 'lucide-react';

const ReportTable = ({ 
  reports, 
  loading, 
  filters, 
  onFilterChange, 
  onSort, 
  onView,
  showActions = true
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Reports' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...REPORT_CATEGORIES
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search reports..."
          className="flex-1 min-w-[200px]"
        />
        
        <SelectFilter
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          options={statusOptions}
          className="min-w-[130px]"
        />
        
        <SelectFilter
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          options={categoryOptions}
          className="min-w-[130px]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <SortableHeader
                label="Report"
                field="title"
                currentSort={filters.sortBy}
                currentDirection={filters.sortDirection}
                onSort={(field) => onSort(field)}
              />
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
              <SortableHeader
                label="Date"
                field="date"
                currentSort={filters.sortBy}
                currentDirection={filters.sortDirection}
                onSort={(field) => onSort(field)}
              />
              <SortableHeader
                label="Evidence"
                field="evidence"
                currentSort={filters.sortBy}
                currentDirection={filters.sortDirection}
                onSort={(field) => onSort(field)}
              />
              <SortableHeader
                label="Stake"
                field="stake"
                currentSort={filters.sortBy}
                currentDirection={filters.sortDirection}
                onSort={(field) => onSort(field)}
              />
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              {showActions && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="px-4 py-6 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="px-4 py-6 text-center text-gray-400">
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              reports.map(report => (
                <tr 
                  key={report.id} 
                  className="border-b border-gray-800 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => onView(report.id)}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">{report.title}</p>
                      {report.description && (
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                          {truncateText(report.description)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 font-mono mt-1">{report.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={report.category}>
                      {report.category ? 
                        (report.category.charAt(0).toUpperCase() + report.category.slice(1)) : 
                        'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm">{formatDate(report.date)}</td>
                  <td className="px-4 py-4 text-sm">{report.evidenceCount || 0} files</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="text-purple-400">{report.stakeAmount || 0} tokens</span>
                    {report.status === 'verified' && report.rewardAmount > 0 && (
                      <span className="text-green-400 ml-2">(+{report.rewardAmount} reward)</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  {showActions && (
                    <td className="px-4 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(report.id);
                        }}
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
                        View
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
