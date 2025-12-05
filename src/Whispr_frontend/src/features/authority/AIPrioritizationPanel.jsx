import React, { useState } from 'react';
import { Brain, Zap, AlertTriangle, CheckCircle, Loader2, ArrowUpDown, Sparkles, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { analyzeAndPrioritizeReports } from '../../services/aiService';

const AIPrioritizationPanel = ({ reports, onPrioritize, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pendingReports = reports.filter(r => r.status === 'pending');

  const handlePrioritize = async () => {
    if (pendingReports.length === 0) {
      setError('No pending reports to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeAndPrioritizeReports(pendingReports);
      setAnalysis(result);
      
      // Sort reports based on AI ranking
      if (result.analysis && onPrioritize) {
        const prioritizedReports = [...reports].sort((a, b) => {
          const aAnalysis = result.analysis.find(x => x.reportId === a.id);
          const bAnalysis = result.analysis.find(x => x.reportId === b.id);
          
          if (!aAnalysis) return 1;
          if (!bAnalysis) return -1;
          
          return aAnalysis.rank - bAnalysis.rank;
        });
        onPrioritize(prioritizedReports, result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-900/40 text-red-400 border-red-500/50';
      case 'MEDIUM': return 'bg-amber-900/40 text-amber-400 border-amber-500/50';
      case 'LOW': return 'bg-green-900/40 text-green-400 border-green-500/50';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getCredibilityBadge = (score) => {
    if (score >= 70) return { color: 'text-green-400', label: 'Likely Genuine' };
    if (score >= 40) return { color: 'text-amber-400', label: 'Needs Review' };
    return { color: 'text-red-400', label: 'Suspicious' };
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30">
      <Card.Header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <Card.Title className="text-purple-300">AI Report Prioritization</Card.Title>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </Card.Header>
      
      <Card.Content>
        {!analysis && !loading && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              AI will analyze {pendingReports.length} pending reports and prioritize them based on urgency, credibility, and severity.
            </p>
            <Button
              onClick={handlePrioritize}
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
              leftIcon={<Zap className="h-4 w-4" />}
              disabled={pendingReports.length === 0}
            >
              Analyze & Prioritize Reports
            </Button>
            {pendingReports.length === 0 && (
              <p className="text-amber-400 text-sm mt-2">No pending reports to analyze</p>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-purple-300">Analyzing reports with AI...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400">{error}</p>
            <Button
              onClick={handlePrioritize}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{pendingReports.length}</div>
                <div className="text-xs text-gray-400">Reports Analyzed</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{analysis.highPriorityCount || 0}</div>
                <div className="text-xs text-gray-400">High Priority</div>
              </div>
              <div className="bg-amber-900/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{analysis.suspiciousCount || 0}</div>
                <div className="text-xs text-gray-400">Suspicious</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-gray-300 text-sm">{analysis.summary}</p>
            </div>

            {/* Prioritized List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analysis.analysis?.sort((a, b) => a.rank - b.rank).map((item, index) => {
                const report = reports.find(r => r.id === item.reportId);
                const credibility = getCredibilityBadge(item.credibilityScore);
                
                return (
                  <div 
                    key={item.reportId}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityColor(item.priorityLevel)}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold">
                      #{item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{report?.title || `Report ${item.reportId}`}</div>
                      <div className="text-xs text-gray-400 truncate">{item.reason}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-sm font-bold ${credibility.color}`}>
                        {item.credibilityScore}%
                      </div>
                      <div className={`text-xs ${credibility.color}`}>
                        {credibility.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Re-analyze Button */}
            <Button
              onClick={handlePrioritize}
              variant="ghost"
              size="sm"
              className="w-full"
              leftIcon={<ArrowUpDown className="h-4 w-4" />}
            >
              Re-analyze Reports
            </Button>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default AIPrioritizationPanel;
