import React from 'react';
import Card from '../../components/ui/Card';
import { Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const StatsCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
  <Card className={`bg-gradient-to-br ${gradient}`}>
    <div className="flex items-center">
      <div className="p-3 bg-opacity-50 rounded-lg mr-4" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </Card>
);

const AuthorityStats = ({ stats }) => {
  const statsConfig = [
    {
      icon: Clock,
      title: 'Pending Review',
      value: stats.reports_pending,
      gradient: 'from-blue-900/30 to-indigo-900/30'
    },
    {
      icon: CheckCircle,
      title: 'Verified Reports',
      value: stats.reports_verified,
      gradient: 'from-green-900/30 to-emerald-900/30'
    },
    {
      icon: XCircle,
      title: 'Rejected Reports',
      value: stats.reports_rejected,
      gradient: 'from-red-900/30 to-rose-900/30'
    },
    {
      icon: Award,
      title: 'Rewards Distributed',
      value: stats.total_rewards_distributed,
      gradient: 'from-amber-900/30 to-orange-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AuthorityStats;
