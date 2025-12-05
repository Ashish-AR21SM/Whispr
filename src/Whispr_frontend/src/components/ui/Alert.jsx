import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', title, children, className = '' }) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-900/30',
      textClass: 'text-green-300',
      iconClass: 'text-green-400'
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-red-900/30',
      textClass: 'text-red-300',
      iconClass: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-amber-900/30',
      textClass: 'text-amber-300',
      iconClass: 'text-amber-400'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-900/30',
      textClass: 'text-blue-300',
      iconClass: 'text-blue-400'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgClass} ${config.textClass} p-4 rounded-lg ${className}`}>
      <div className="flex">
        <Icon className={`h-5 w-5 ${config.iconClass} mr-3 flex-shrink-0 mt-0.5`} />
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
