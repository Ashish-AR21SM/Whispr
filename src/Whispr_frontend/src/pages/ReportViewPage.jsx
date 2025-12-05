import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Clock, FileText, Image, Shield, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getReportById } from '../api/whisprBackend';

const ReportViewPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const reportData = await getReportById(id);
        setReport(reportData);
        console.log("Loaded report with evidence files:", reportData.evidenceFiles);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleImageError = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
    console.error(`Image at index ${index} failed to load`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-900 bg-opacity-20 text-green-400';
      case 'rejected':
        return 'bg-red-900 bg-opacity-20 text-red-400';
      case 'pending':
      default:
        return 'bg-amber-900 bg-opacity-20 text-amber-400';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'environmental':
        return 'bg-emerald-900 bg-opacity-40 text-emerald-400';
      case 'fraud':
        return 'bg-amber-900 bg-opacity-40 text-amber-400';
      case 'cybercrime':
        return 'bg-blue-900 bg-opacity-40 text-blue-400';
      case 'corruption':
        return 'bg-purple-900 bg-opacity-40 text-purple-400';
      case 'violence':
        return 'bg-red-900 bg-opacity-40 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">Report Not Found</h2>
        <p className="text-gray-400 mb-6">The report you're looking for couldn't be found.</p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-white inline-flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <Card.Header>
          <div className="flex justify-between items-start">
            <div>
              <Card.Title className="text-2xl">{report.title}</Card.Title>
              <p className="text-gray-400 font-mono mt-1">{report.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${getStatusBadgeClass(report.status)}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryBadgeClass(report.category)}`}>
                {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-900 bg-opacity-30 text-purple-400">
                Stake: {report.stakeAmount} tokens
              </span>
              {report.status === 'verified' && report.rewardAmount > 0 && (
                <span className="px-3 py-1 text-sm rounded-full bg-green-900 bg-opacity-30 text-green-400">
                  Reward: +{report.rewardAmount} tokens
                </span>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Report Details</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                <p className="bg-slate-700 bg-opacity-50 p-4 rounded">{report.description}</p>
              </div>

              {report.location && report.location.address && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                  <div className="bg-slate-700 bg-opacity-50 p-4 rounded flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{report.location.address}</p>
                      {report.location.coordinates && (
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {report.location.coordinates.lat.toFixed(6)}, {report.location.coordinates.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-6 mb-6">
                {report.date && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{report.date}</span>
                  </div>
                )}
                {report.time && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{report.time}</span>
                  </div>
                )}
              </div>
            </div>

            {report.evidenceFiles && report.evidenceFiles.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Evidence Files</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {report.evidenceFiles.map((file, index) => (
                    <div key={index} className="bg-slate-700 rounded-lg overflow-hidden">
                      {file.type && file.type.startsWith('image') ? (
                        <div>
                          <div className="aspect-video bg-slate-900 overflow-hidden">
                            {imageErrors[index] ? (
                              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                                <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400 text-center">
                                  Image could not be loaded
                                </span>
                              </div>
                            ) : (
                              <img 
                                src={file.base64Data || file.url || '#'} 
                                alt={`Evidence ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(index)}
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                            </p>
                          </div>
                        </div>
                      ) : (file.type && file.type.startsWith('video')) ? (
                        <div>
                          <div className="aspect-video bg-slate-900 flex items-center justify-center">
                            {file.base64Data ? (
                              <video 
                                controls
                                src={file.base64Data}
                                className="max-h-full max-w-full"
                                onError={() => handleImageError(index)}
                              />
                            ) : file.url ? (
                              <video 
                                controls
                                src={file.url}
                                className="max-h-full max-w-full"
                                onError={() => handleImageError(index)}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4">
                                <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400 text-center">
                                  Video could not be loaded
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-center">
                          <FileText className="h-10 w-10 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {report.status === 'pending' && (
              <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-purple-400 mr-2" />
                  <p className="text-purple-300">
                    This report is currently under review. You'll receive a notification when it's verified.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ReportViewPage;