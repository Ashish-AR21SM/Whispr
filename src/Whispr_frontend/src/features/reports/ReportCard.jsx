import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { StatusBadge } from '../../components/common/StatusComponents';
import { formatDate, truncateText } from '../../utils/helpers';
import { Eye } from 'lucide-react';
import Button from '../../components/ui/Button';

const ReportCard = ({ report, onView, showActions = true }) => {
  return (
    <Card className="hover:bg-slate-800/50 transition-colors">
      <Card.Content className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">{report.title}</h3>
            <p className="text-sm text-gray-400 font-mono">{report.id}</p>
          </div>
          <StatusBadge status={report.status} />
        </div>
        
        {report.description && (
          <p className="text-sm text-gray-400 mb-3">
            {truncateText(report.description, 100)}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={report.category}>
            {report.category?.charAt(0).toUpperCase() + report.category?.slice(1)}
          </Badge>
          <Badge variant="default">
            {report.stakeAmount || 0} tokens
          </Badge>
          {report.status === 'verified' && report.rewardAmount > 0 && (
            <Badge variant="verified">
              +{report.rewardAmount} reward
            </Badge>
          )}
          <Badge variant="default">
            {formatDate(report.date)}
          </Badge>
          {report.evidenceCount > 0 && (
            <Badge variant="default">
              {report.evidenceCount} files
            </Badge>
          )}
        </div>
        
        {showActions && (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onView(report.id)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              View
            </Button>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default ReportCard;
