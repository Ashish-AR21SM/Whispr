import React, { useState } from 'react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import ReportCard from '../features/reports/ReportCard';
import ReportTable from '../features/reports/ReportTable';
import { useReports } from '../hooks/useReports';
import { useFilters } from '../hooks/useFilters';
import { reportService } from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
import Button from '../components/ui/Button';

const DashboardPage = () => {
  const [viewMode, setViewMode] = useState('table');
  const navigate = useNavigate();

  const { reports, loading, error } = useReports();
  const { filters, filteredData, updateFilter } = useFilters(reports);

  const handleSort = (field) => {
    const newDirection = filters.sortBy === field && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    updateFilter('sortBy', field);
    updateFilter('sortDirection', newDirection);
  };

  const handleViewReport = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  const userStats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    verifiedReports: reports.filter(r => r.status === 'verified').length,
    rejectedReports: reports.filter(r => r.status === 'rejected').length,
    totalStaked: reports.reduce((sum, r) => sum + (r.stakeAmount || 0), 0),
    totalRewards: reports
      .filter(r => r.status === 'verified')
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0)
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Reports Dashboard</h1>
        <p className="text-gray-400">Track your submitted reports and rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Reports</p>
            <p className="text-2xl font-bold">{userStats.totalReports}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold">{userStats.pendingReports}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Verified</p>
            <p className="text-2xl font-bold">{userStats.verifiedReports}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold">{userStats.rejectedReports}</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold">{userStats.totalRewards}</p>
            <p className="text-xs text-gray-500">tokens</p>
          </div>
        </Card>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header className="flex justify-between items-center">
          <div>
            <Card.Title>Your Reports</Card.Title>
            <Card.Description>View and manage your submitted reports</Card.Description>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              leftIcon={<List className="h-4 w-4" />}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              leftIcon={<Grid className="h-4 w-4" />}
            >
              Grid
            </Button>
          </div>
        </Card.Header>
        
        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : viewMode === 'table' ? (
            <ReportTable
              reports={filteredData}
              loading={loading}
              filters={filters}
              onFilterChange={updateFilter}
              onSort={handleSort}
              onView={handleViewReport}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Filters would go here for grid view */}
              </div>
              
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No reports found. <a href="/report" className="text-purple-400 hover:underline">Submit your first report</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onView={handleViewReport}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default DashboardPage;
