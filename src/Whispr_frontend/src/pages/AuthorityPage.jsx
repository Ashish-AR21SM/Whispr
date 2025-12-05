import React, { useState, useRef, useEffect } from 'react';
import { XCircle, CheckCircle, Plus, Minus, Brain } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FormField, TextArea, Input } from '../components/forms/FormComponents';
import ReportTable from '../features/reports/ReportTable';
import AuthorityStats from '../features/authority/AuthorityStats';
import AIReportAnalysis from '../features/authority/AIReportAnalysis';
import AIPrioritizationPanel from '../features/authority/AIPrioritizationPanel';
import { useAuthorityDashboard } from '../hooks/useAuthorityDashboard';
import { useFilters } from '../hooks/useFilters';
import { authorityService } from '../services/authorityService';
import { formatDate, truncateText } from '../utils/helpers';
import { DEFAULT_REWARD_MULTIPLIER } from '../constants';
import Badge from '../components/ui/Badge';
import { getReportEvidence } from '../api/whisprBackend';

const AuthorityPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rewardMultiplier, setRewardMultiplier] = useState(DEFAULT_REWARD_MULTIPLIER);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrioritizedReports, setAiPrioritizedReports] = useState(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  
  const listContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Use combined hook for parallel data fetching
  const { reports, stats, loading, refresh, isAuthority } = useAuthorityDashboard();
  
  // Use AI prioritized reports if available, otherwise use original
  const reportsToFilter = aiPrioritizedReports || reports;
  
  const { filters, filteredData, updateFilter } = useFilters(reportsToFilter, {
    status: 'pending'
  });

  // Handle AI prioritization results
  const handleAIPrioritize = (prioritizedReports, analysisResult) => {
    setAiPrioritizedReports(prioritizedReports);
    setAiAnalysisResult(analysisResult);
  };

  // Fetch evidence when a report is selected
  useEffect(() => {
    if (selectedReport) {
      setLoadingEvidence(true);
      getReportEvidence(selectedReport)
        .then(files => {
          console.log("Loaded evidence files:", files);
          setEvidenceFiles(files);
        })
        .catch(err => console.error("Error loading evidence:", err))
        .finally(() => setLoadingEvidence(false));
    } else {
      setEvidenceFiles([]);
    }
  }, [selectedReport]);

  const handleSelectReport = (id) => {
    setScrollPosition(window.scrollY);
    setSelectedReport(id);
    setAlert(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setReviewNotes('');
    setAlert(null);
    setEvidenceFiles([]);
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }, 100);
  };

  const handleSort = (field) => {
    const newDirection = filters.sortBy === field && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    updateFilter('sortBy', field);
    updateFilter('sortDirection', newDirection);
  };

  const handleReportAction = async (id, action) => {
    setIsProcessing(true);
    setAlert(null);
    
    try {
      const reportToUpdate = reports.find(r => r.id === id);
      if (!reportToUpdate) {
        throw new Error(`Report with ID ${id} not found`);
      }
      
      const stakeAmount = reportToUpdate?.stakeAmount || 0;
      const rewardAmount = action === 'verify' ? stakeAmount * rewardMultiplier : 0;
      
      let result;
      if (action === 'verify') {
        const notesWithReward = reviewNotes ? 
          `${reviewNotes}\n\nReward multiplier: ${rewardMultiplier}x` : 
          `Verified with ${rewardMultiplier}x reward multiplier`;
          
        result = await authorityService.verifyReport(id, notesWithReward);
        if (result.success) {
          setAlert({
            type: 'success',
            message: `Report ${id} has been successfully verified! Reward of ${rewardAmount} tokens issued.`
          });
        }
      } else {
        result = await authorityService.rejectReport(id, reviewNotes || "Report rejected");
        if (result.success) {
          setAlert({
            type: 'success',
            message: `Report ${id} has been rejected. Stake has been forfeited.`
          });
        }
      }
      
      if (!result.success) {
        setAlert({
          type: 'error',
          message: result.error || "Failed to process report"
        });
      } else {
        setSelectedReport(null);
        setReviewNotes('');
        refresh();
        
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || "An error occurred while processing the report"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedReportData = reports.find(report => report.id === selectedReport);

  const renderReportDetail = () => {
    if (!selectedReportData) return null;
    
    const stakeAmount = selectedReportData.stakeAmount || 0;
    const potentialReward = stakeAmount * rewardMultiplier;
    // Use fetched evidence files, or fall back to report's evidence
    
    return (
      <Card>
        <Card.Header className="flex justify-between items-start">
          <div>
            <Card.Title>{selectedReportData.title || "Untitled Report"}</Card.Title>
            <Card.Description className="font-mono">
              {selectedReportData.id || "No ID"}
            </Card.Description>
          </div>
          <button 
            onClick={handleBackToList}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-400" />
          </button>
        </Card.Header>
        
        <Card.Content>
          <div className="space-y-6">
            {alert && (
              <Alert type={alert.type}>
                {alert.message}
              </Alert>
            )}
            
            <div className="flex flex-wrap gap-3">
              <Badge variant={selectedReportData.category}>
                {selectedReportData.category ? 
                  (selectedReportData.category.charAt(0).toUpperCase() + selectedReportData.category.slice(1)) : 
                  'Unknown'}
              </Badge>
              <Badge variant="default">
                Stake: {selectedReportData.stakeAmount || 0} tokens
              </Badge>
              <Badge variant="default">
                {formatDate(selectedReportData.date)}
              </Badge>
              <Badge variant={selectedReportData.status}>
                {selectedReportData.status ? 
                  (selectedReportData.status.charAt(0).toUpperCase() + selectedReportData.status.slice(1)) : 
                  'Pending'}
              </Badge>
            </div>
            
            {/* AI Analysis Section */}
            <AIReportAnalysis report={selectedReportData} />
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Report Description</h3>
              <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-line">
                {selectedReportData.description || "No description provided"}
              </div>
            </div>
            
            {selectedReportData.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Location</h3>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p>{selectedReportData.location.address || 'Address not provided'}</p>
                  {selectedReportData.location.coordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {selectedReportData.location.coordinates.lat?.toFixed(6)}, 
                      {selectedReportData.location.coordinates.lng?.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Evidence Files ({selectedReportData.evidenceCount || 0})
                {loadingEvidence && <span className="ml-2 text-xs">(Loading...)</span>}
              </h3>
              
              {selectedReportData.evidenceCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {evidenceFiles.length > 0 ? (
                    evidenceFiles.map((file, index) => (
                      <div key={index} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                        {file.base64Data ? (
                          <img 
                            src={file.base64Data} 
                            alt={file.name || `Evidence-${index+1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                            <span className="text-gray-400">Evidence File</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                          <p className="text-xs text-gray-300 truncate">{file.name || `Evidence-${index+1}`}</p>
                        </div>
                      </div>
                    ))
                  ) : loadingEvidence ? (
                    <div className="col-span-full flex justify-center py-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    [...Array(selectedReportData.evidenceCount)].map((_, i) => (
                      <div key={i} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                          <span className="text-gray-400">Evidence File</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                          <p className="text-xs text-gray-300 truncate">Evidence-{i+1}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-400 bg-slate-800 p-4 rounded-lg">No evidence files attached</p>
              )}
            </div>
            
            {(selectedReportData.status === 'pending' || selectedReportData.status === 'under_review') && (
              <>
                <FormField label="Review Notes (Optional)">
                  <TextArea 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                    rows={3}
                  />
                </FormField>
                
                <FormField label="Reward Multiplier">
                  <div className="flex items-center space-x-2 bg-slate-800 p-4 rounded-lg">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setRewardMultiplier(Math.max(1, rewardMultiplier - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={rewardMultiplier}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setRewardMultiplier(isNaN(value) ? 1 : Math.max(1, value));
                      }}
                      className="w-16 text-center"
                      min="1"
                    />
                    
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setRewardMultiplier(rewardMultiplier + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <span className="ml-2 text-gray-400">
                      × Stake ({selectedReportData.stakeAmount || 0}) 
                      = <span className="text-green-400">{potentialReward} tokens</span> reward
                    </span>
                  </div>
                </FormField>
              </>
            )}
            
            {(selectedReportData.status === 'verified' || selectedReportData.status === 'rejected') && selectedReportData.reviewNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Review Notes</h3>
                <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-line">
                  <p>{selectedReportData.reviewNotes}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <Button variant="secondary" onClick={handleBackToList}>
                Back to List
              </Button>
              
              {(selectedReportData.status === 'pending' || selectedReportData.status === 'under_review') && (
                <div className="flex space-x-3">
                  <Button 
                    variant="danger" 
                    onClick={() => handleReportAction(selectedReportData.id, 'reject')}
                    disabled={isProcessing}
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleReportAction(selectedReportData.id, 'verify')}
                    disabled={isProcessing}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Verify ({potentialReward} tokens)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  if (selectedReport) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Review</h1>
          <p className="text-gray-400">Review report details and take action</p>
        </div>
        {renderReportDetail()}
      </div>
    );
  }

  // Show access denied message if not an authority
  if (!loading && !isAuthority) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Authority Dashboard</h1>
          <p className="text-gray-400">Review and verify anonymous reports from informers</p>
        </div>
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30">
          <Card.Content>
            <div className="text-center py-8">
              <h2 className="text-xl font-bold mb-2 text-red-400">Access Denied</h2>
              <p className="text-gray-400 mb-4">
                You are not authorized to access the Authority Dashboard.
              </p>
              <p className="text-gray-500 text-sm">
                To access this page, you must connect with an authorized wallet.
                Please connect using Plug wallet with the authorized principal ID.
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Authority Dashboard</h1>
        <p className="text-gray-400">Review and verify anonymous reports from informers</p>
      </div>

      <div className="mb-8">
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <AuthorityStats stats={stats} />
        )}
      </div>

      {/* AI Prioritization Panel */}
      {showAIPanel && (
        <div className="mb-6">
          <AIPrioritizationPanel 
            reports={reports}
            onPrioritize={handleAIPrioritize}
            onClose={() => setShowAIPanel(false)}
          />
        </div>
      )}

      <div className="space-y-6" ref={listContainerRef}>
        {alert && (
          <Alert type={alert.type}>
            {alert.message}
          </Alert>
        )}
        
        <Card>
          <Card.Header className="flex justify-between items-center">
            <div>
              <Card.Title>Reports for Review</Card.Title>
              <Card.Description>
                Review and verify anonymous reports
                {aiPrioritizedReports && (
                  <span className="ml-2 text-purple-400">(AI Prioritized)</span>
                )}
              </Card.Description>
            </div>
            <Button
              onClick={() => setShowAIPanel(!showAIPanel)}
              variant={showAIPanel ? "primary" : "ghost"}
              className={showAIPanel ? "bg-purple-600" : "bg-purple-900/30 hover:bg-purple-800/50 text-purple-300"}
              leftIcon={<Brain className="h-4 w-4" />}
            >
              AI Prioritize
            </Button>
          </Card.Header>
          <Card.Content>
            <ReportTable
              reports={filteredData}
              loading={loading}
              filters={filters}
              onFilterChange={updateFilter}
              onSort={handleSort}
              onView={handleSelectReport}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AuthorityPage;
