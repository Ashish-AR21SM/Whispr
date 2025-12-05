import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap, Loader2, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AIReportAnalysis = ({ report, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { analyzeReport } = await import('../../services/aiService');
      const result = await analyzeReport(report);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-400 bg-red-900/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-900/30';
      case 'LOW': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  if (!analysis && !loading) {
    return (
      <Button
        onClick={handleAnalyze}
        variant="ghost"
        size="sm"
        className="bg-purple-900/30 hover:bg-purple-800/50 text-purple-300"
        leftIcon={<Brain className="h-4 w-4" />}
      >
        AI Analysis
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-purple-400 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Analyzing with AI...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Analysis failed</span>
        <Button size="sm" variant="ghost" onClick={handleAnalyze}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-purple-500/30">
      <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
        <Sparkles className="h-4 w-4" />
        <span>AI Analysis</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Credibility Score */}
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Credibility</div>
          <div className={`text-2xl font-bold ${getCredibilityColor(analysis.credibilityScore)}`}>
            {analysis.credibilityScore}%
          </div>
        </div>

        {/* Priority Level */}
        <div className="bg-slate-900/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Priority</div>
          <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(analysis.priorityLevel)}`}>
            {analysis.priorityLevel}
          </span>
        </div>
      </div>

      {/* Priority Reason */}
      <div className="text-sm text-gray-300">
        <span className="text-gray-500">Reason: </span>
        {analysis.priorityReason}
      </div>

      {/* Observations */}
      {analysis.observations && analysis.observations.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Key Observations</div>
          <ul className="text-sm text-gray-300 space-y-1">
            {analysis.observations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Indicators */}
      {analysis.riskIndicators && analysis.riskIndicators.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Risk Indicators</div>
          <ul className="text-sm text-gray-300 space-y-1">
            {analysis.riskIndicators.map((risk, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-1 text-amber-500 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action */}
      <div className="bg-purple-900/20 rounded p-2 text-sm">
        <span className="text-purple-400 font-medium">Recommended: </span>
        <span className="text-gray-300">{analysis.recommendedAction}</span>
      </div>
    </div>
  );
};

export default AIReportAnalysis;
