import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FilePlus, Camera, AlertTriangle, Info, X, Plus, ChevronRight, Check,
  Map, Clock, MapPin, Sparkles, Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MapSelector from '../components/forms/MapSelector';
import { submitReport } from '../api/whisprBackend';
import { enhanceReport } from '../services/aiService';
import Background3D from '../components/three/Background3D';

const ReportPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('details');
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      coordinates: null
    },
    date: '',
    time: '',
    category: '',
    evidenceFiles: [],
    stakeAmount: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Enhancement states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState(null);
  const [showEnhancements, setShowEnhancements] = useState(false);

  // Add this useEffect to scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentStep]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (locationData) => {
    setReportData((prev) => ({
      ...prev,
      location: locationData
    }));
  };

  // AI Enhancement handler
  const handleEnhanceWithAI = async () => {
    if (!reportData.title.trim() && !reportData.description.trim()) {
      alert('Please enter a title or description first');
      return;
    }

    setIsEnhancing(true);
    setEnhanceResult(null);
    setShowEnhancements(false);

    try {
      const result = await enhanceReport(
        reportData.title,
        reportData.description,
        reportData.category
      );

      setEnhanceResult(result);
      setShowEnhancements(true);

      // Auto-apply enhanced title and description
      setReportData((prev) => ({
        ...prev,
        title: result.enhancedTitle || prev.title,
        description: result.enhancedDescription || prev.description
      }));
    } catch (error) {
      console.error('AI enhancement error:', error);
      alert('Failed to enhance report. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReportData((prev) => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...newFiles]
      }));
    }
  };

  const removeFile = (index) => {
    setReportData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleNextStep = () => {
    // Scroll to top before changing the step
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    if (currentStep === 'details') setCurrentStep('evidence');
    else if (currentStep === 'evidence') setCurrentStep('staking');
    else if (currentStep === 'staking') setCurrentStep('review');
    else if (currentStep === 'review') {
      setIsSubmitting(true);
      
      // Submit report to backend
      submitReport(reportData)
        .then(response => {
          setIsSubmitting(false);
          
          if (response.success) {
            // Store the report ID for display
            const submittedReport = {
              ...reportData,
              id: response.reportId
            };
            
            setReportData(submittedReport);
            
            // Save to localStorage for immediate display in dashboard
            saveReportToLocalStorage(submittedReport);
            
            setCurrentStep('confirmation');

            // Scroll to top after submission is complete
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          } else {
            alert(`Error submitting report: ${response.error}`);
          }
        })
        .catch(error => {
          setIsSubmitting(false);
          alert(`An unexpected error occurred: ${error.message}`);
        });
    }
  };

  const saveReportToLocalStorage = (report) => {
    try {
      const dashboardReport = {
        id: report.id,
        title: report.title,
        category: report.category,
        date: report.date || new Date().toISOString().split('T')[0],
        status: 'pending',
        stake: report.stakeAmount,
        reward: 0,
        hasMessages: false
      };
      
      const existingReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
      const updatedReports = [dashboardReport, ...existingReports];
      localStorage.setItem('whispr_reports', JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Error saving report to localStorage:', error);
    }
  };

  const handlePrevStep = () => {
    // Scroll to top before changing the step
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    if (currentStep === 'evidence') setCurrentStep('details');
    else if (currentStep === 'staking') setCurrentStep('evidence');
    else if (currentStep === 'review') setCurrentStep('staking');
  };

  const handleGoToDashboard = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const isStepComplete = () => {
    if (currentStep === 'details') {
      return reportData.title.trim() !== '' && 
             reportData.description.trim() !== '' && 
             reportData.category !== '';
    }
    if (currentStep === 'evidence') {
      return true; // Evidence is optional
    }
    if (currentStep === 'staking') {
      return reportData.stakeAmount >= 5; // Minimum stake amount
    }
    return true;
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'details', label: 'Details' },
      { id: 'evidence', label: 'Evidence' },
      { id: 'staking', label: 'Stake' },
      { id: 'review', label: 'Review' }
    ];

    return (
      <div className="w-full mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep === step.id
                      ? 'bg-purple-600 text-white'
                      : currentStep === 'confirmation' || 
                        steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {currentStep === 'confirmation' || 
                   steps.findIndex(s => s.id === currentStep) > index 
                    ? <Check size={18} /> 
                    : index + 1}
                </div>
                <span className={`text-sm mt-2 ${
                  currentStep === step.id
                    ? 'text-purple-400 font-medium'
                    : currentStep === 'confirmation' || 
                      steps.findIndex(s => s.id === currentStep) > index
                      ? 'text-green-400'
                      : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-600'
                    : 'bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDetailsStep = () => (
    <div className="space-y-6 fade-in">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Report Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={reportData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="Brief title describing the illegal activity"
          required
        />
      </div>

      <div>
  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
    Category <span className="text-red-500">*</span>
  </label>
  <select
    id="category"
    name="category"
    value={reportData.category}
    onChange={handleInputChange}
    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
    required
  >
 <option value="">Select a category</option>
 <option value="Acid Attacks">Acid Attacks</option>
<option value="bribery">Bribery</option>
<option value="cybercrime">Cybercrime</option>
<option value="domestic_violence">Domestic Violence</option>
<option value="drug_crimes">Drug Crimes</option>
<option value="Environment">Environment</option>
<option value="fraud">Fraud</option>
<option value="human_trafficking">Human Trafficking</option>
<option value="kidnapping">Kidnapping</option>
<option value="money_laundering">Money Laundering</option>
<option value="murder">Murder</option>

<option value="sexual_assault">Sexual Assault</option>
<option value="theft">Theft</option>

    <option value="other">Other</option>
  </select>
</div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={reportData.description}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="Provide detailed information about the incident"
          required
        />
        
        {/* AI Enhance Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleEnhanceWithAI}
            disabled={isEnhancing || (!reportData.title.trim() && !reportData.description.trim())}
            className={`group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold tracking-wide transition-all duration-500 ease-out overflow-hidden ${
              isEnhancing
                ? 'bg-[#6728ff]/50 cursor-wait opacity-80'
                : (!reportData.title.trim() && !reportData.description.trim())
                  ? 'bg-gray-800/50 cursor-not-allowed text-gray-600 border border-gray-700/50'
                  : 'bg-gradient-to-r from-[#6728ff] to-[#148cff] hover:from-[#5614ef] hover:to-[#0078ef] shadow-xl shadow-[#6728ff]/20 hover:shadow-[#6728ff]/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            {isEnhancing ? (
              <>
                <Loader2 className="w-5 h-5 text-white animate-spin" />
                <span className="text-white font-semibold">Enhancing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-500" />
                <span className="text-white font-semibold">Enhance with AI</span>
              </>
            )}
          </button>

          {/* Show improvements made */}
          {showEnhancements && enhanceResult && enhanceResult.improvements && enhanceResult.improvements.length > 0 && (
            <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Enhanced!</span>
              </div>
              <ul className="space-y-1">
                {enhanceResult.improvements.map((improvement, idx) => (
                  <li key={idx} className="text-xs text-green-300/80 flex items-center gap-1.5">
                    <span className="text-green-500">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location <span className="text-xs text-gray-500">(Click/drag on map to set precise location)</span>
        </label>
        <div className="mb-4">
          <MapSelector 
            onLocationSelect={handleLocationSelect}
            initialAddress={reportData.location.address}
            initialCoordinates={reportData.location.coordinates}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
            Date of Incident
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={reportData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
          
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
            Time of Incident
          </label>
          <div className="relative">
            <input
              type="time"
              id="time"
              name="time"
              value={reportData.time}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center p-4 bg-blue-900 bg-opacity-20 rounded-lg">
        <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          Your identity will remain protected through our blockchain technology. All details are encrypted.
        </p>
      </div>
    </div>
  );

  const renderEvidenceStep = () => (
    <div className="space-y-6 fade-in">
      <div 
        className="text-center p-6 border-2 border-dashed border-slate-700 rounded-lg relative"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange({ target: { files: e.dataTransfer.files } });
          }
        }}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Evidence</h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files or click below to upload photos or videos as evidence
        </p>
        <input
          type="file"
          id="evidence"
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,video/*"
        />
        <div className="flex gap-3 justify-center">
          <label htmlFor="evidence" className="cursor-pointer">
            <div className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <FilePlus className="h-4 w-4 mr-2" />
              Browse Files
            </div>
          </label>
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => {
              document.getElementById('evidence').click();
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      {reportData.evidenceFiles.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Uploaded Evidence ({reportData.evidenceFiles.length})</h4>
          <div className="space-y-2">
            {reportData.evidenceFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
              >
                <div className="flex items-center">
                  {file.type.startsWith('image') ? (
                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center mr-3 overflow-hidden">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center mr-3">
                      <FilePlus className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center p-4 bg-amber-900 bg-opacity-20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
        <p className="text-sm text-amber-300">
          All evidence is securely stored and encrypted. Only authorized authorities will be able to access these files.
        </p>
      </div>
    </div>
  );

  const renderStakingStep = () => (
    <div className="space-y-6 fade-in">
      <Card>
        <Card.Header>
          <Card.Title>Token Staking</Card.Title>
          <Card.Description>
            Stake tokens to verify your report is genuine
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="py-4">
            <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-300 mb-3">
              Stake Amount <span className="text-sm text-gray-500">(Minimum 5 tokens)</span>
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setReportData(prev => ({ ...prev, stakeAmount: Math.max(5, prev.stakeAmount - 5) }))}
                className="bg-slate-800 p-2 rounded-l-lg border border-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                type="number"
                id="stakeAmount"
                name="stakeAmount"
                value={reportData.stakeAmount}
                onChange={handleInputChange}
                min="5"
                max="100"
                className="w-full text-center px-4 py-2 border-y border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setReportData(prev => ({ ...prev, stakeAmount: Math.min(100, prev.stakeAmount + 5) }))}
                className="bg-slate-800 p-2 rounded-r-lg border border-slate-700"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={reportData.stakeAmount}
              onChange={(e) => setReportData(prev => ({ ...prev, stakeAmount: Number(e.target.value) }))}
              className="w-full mt-4 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 tokens</span>
              <span>100 tokens</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-purple-900 bg-opacity-20">
            <h4 className="font-medium text-purple-300 mb-2">Staking Benefits</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <ChevronRight className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Earn 10x Rewards</span>: Receive 10x your staked amount for verified reports
                </p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Improve Credibility</span>: Higher stakes indicate stronger confidence
                </p>
              </li>
              <li className="flex items-start">
                <ChevronRight className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Reduce False Reports</span>: Stakes are lost if report is deemed false
                </p>
              </li>
            </ul>
          </div>
        </Card.Content>
        <Card.Footer>
          <p className="text-sm text-gray-400">
            Your current balance: <span className="font-medium text-white">250 tokens</span>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6 fade-in">
      <h3 className="text-lg font-medium mb-4">Review Your Report</h3>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-800">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Report Title</h4>
          <p>{reportData.title}</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-800">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Category</h4>
          <p className="capitalize">{reportData.category}</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-800">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
          <p>{reportData.description}</p>
        </div>

        {reportData.location.address && (
          <div className="p-4 rounded-lg bg-slate-800">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
            <p>{reportData.location.address}</p>
            {reportData.location.coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {reportData.location.coordinates.lat.toFixed(6)}, {reportData.location.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {reportData.date && (
          <div className="p-4 rounded-lg bg-slate-800">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Date & Time</h4>
            <p>
              {reportData.date}
              {reportData.time && ` at ${reportData.time}`}
            </p>
          </div>
        )}

        {reportData.evidenceFiles.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-800">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Evidence Files</h4>
            <p>{reportData.evidenceFiles.length} file(s) attached</p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-purple-900 bg-opacity-20">
          <h4 className="text-sm font-medium text-purple-300 mb-1">Token Stake</h4>
          <p className="font-medium text-white">{reportData.stakeAmount} tokens</p>
          <p className="text-xs text-gray-400 mt-1">
            Potential reward: {reportData.stakeAmount * 10} tokens
          </p>
        </div>
      </div>

      <div className="flex items-center p-4 bg-blue-900 bg-opacity-20 rounded-lg">
        <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-300">
            By submitting this report, you confirm that:
          </p>
          <ul className="text-sm text-blue-300 list-disc list-inside ml-4 mt-1">
            <li>All information provided is true to the best of your knowledge</li>
            <li>You agree to stake {reportData.stakeAmount} tokens</li>
            <li>False reports will result in loss of staked tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center py-12 max-w-md mx-auto fade-in">
      <div className="w-24 h-24 bg-green-900 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold mb-4">Report Submitted Successfully!</h3>
      <p className="text-gray-300 mb-6">
        Your report has been anonymously submitted and securely recorded on the blockchain.
        You've staked {reportData.stakeAmount} tokens for this report.
      </p>
      <div className="p-4 rounded-lg bg-slate-800 mb-6">
        <p className="text-sm text-gray-400 mb-1">Report ID</p>
        <p className="font-mono text-sm">{reportData.id || "Processing..."}</p>
      </div>
      <p className="text-gray-400 mb-6">
        You can track the status of your report in your dashboard.
        You'll receive notifications when there are updates.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="primary" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
        <Button variant="secondary" onClick={() => {
          setCurrentStep('details');
          setReportData({
            title: '',
            description: '',
            location: {
              address: '',
              coordinates: null
            },
            date: '',
            time: '',
            category: '',
            evidenceFiles: [],
            stakeAmount: 10,
            id: null
          });
          // Scroll to top when starting a new report
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }}>
          Submit Another Report
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return renderDetailsStep();
      case 'evidence':
        return renderEvidenceStep();
      case 'staking':
        return renderStakingStep();
      case 'review':
        return renderReviewStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    if (currentStep === 'confirmation') return null;

    return (
      <div className="flex justify-between mt-8">
        {currentStep !== 'details' ? (
          <Button type="button" variant="secondary" onClick={handlePrevStep}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={handleNextStep}
          disabled={!isStepComplete() || isSubmitting}
          isLoading={isSubmitting}
        >
          {currentStep === 'review' ? 'Submit Report' : 'Continue'}
        </Button>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D Star Background */}
      <div className="fixed inset-0 z-0">
        <Background3D />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Illegal Activity</h1>
          <p className="text-gray-400">
            Your identity remains anonymous through blockchain technology
          </p>
        </div>

        {currentStep !== 'confirmation' && renderStepIndicator()}

        <Card>
          <Card.Content>
            <form>
              {renderCurrentStep()}
              {renderStepButtons()}
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;