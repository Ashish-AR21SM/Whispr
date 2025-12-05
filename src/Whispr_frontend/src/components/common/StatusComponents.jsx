import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';

const StatusIcon = ({ status }) => {
  const statusConfig = {
    verified: { icon: CheckCircle, className: 'text-green-500' },
    rejected: { icon: XCircle, className: 'text-red-500' },
    under_review: { icon: AlertCircle, className: 'text-blue-500' },
    pending: { icon: Clock, className: 'text-amber-500' }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return <Icon className={`h-4 w-4 ${config.className}`} />;
};

const StatusBadge = ({ status }) => {
  const statusLabels = {
    verified: 'Verified',
    rejected: 'Rejected',
    under_review: 'Under Review',
    pending: 'Pending'
  };

  return (
    <div className="flex items-center">
      <StatusIcon status={status} />
      <Badge variant={status} className="ml-1">
        {statusLabels[status] || 'Unknown'}
      </Badge>
    </div>
  );
};

export { StatusIcon, StatusBadge };
