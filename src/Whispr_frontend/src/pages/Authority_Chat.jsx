import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, PaperclipIcon, Lock, ChevronLeft, Shield, ArrowDownCircle, XCircle, FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useWeb3 } from '../context/Web3Context';

const AuthorityChatPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { actor, isConnected } = useWeb3();
  
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);

  // Fetch report and messages
  useEffect(() => {
    const fetchReportData = async () => {
      if (!reportId || !isConnected || !actor) {
        setError("Cannot fetch report data. Please check your connection.");
        setLoading(false);
        return;
      }

      try {
        // Fetch report details
        const reportResult = await actor.get_report(BigInt(reportId));
        if (!reportResult.length) {
          setError("Report not found");
          setLoading(false);
          return;
        }
        
        setReport(reportResult[0]);

        // Fetch messages
        const messagesResult = await actor.get_messages(BigInt(reportId));
        setMessages(formatMessages(messagesResult));
      } catch (err) {
        console.error("Failed to load chat data:", err);
        setError("Failed to load chat data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();

    // Set up message polling (every 10 seconds)
    const intervalId = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalId);
  }, [reportId, actor, isConnected]);

  // Format messages from backend format to UI format
  const formatMessages = (backendMessages) => {
    return backendMessages.map(msg => {
      let sender;
      if ('Reporter' in msg.sender) {
        sender = 'informer';
      } else {
        sender = 'authority';
      }
      
      return {
        id: Number(msg.id),
        sender,
        content: msg.content,
        timestamp: new Date(Number(msg.timestamp) / 1000000)
      };
    });
  };

  // Fetch messages (for polling/updates)
  const fetchMessages = async () => {
    if (!reportId || !isConnected || !actor) return;

    try {
      const messagesResult = await actor.get_messages(BigInt(reportId));
      setMessages(formatMessages(messagesResult));
    } catch (err) {
      console.error("Failed to update messages:", err);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manage scroll button visibility
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop - container.clientHeight > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString();
  };

  // Send message as authority
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !reportId || !isConnected || !actor) return;

    setIsSending(true);
    
    try {
      const result = await actor.send_message_as_authority(BigInt(reportId), newMessage);
      
      if ('Ok' in result) {
        // Add to UI immediately for better UX
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(), // Temporary ID
            sender: 'authority',
            content: newMessage,
            timestamp: new Date()
          }
        ]);
        
        setNewMessage('');
        
        // Then refresh to ensure consistency with backend
        fetchMessages();
      } else {
        throw new Error(result.Err || 'Failed to send message');
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // File upload handling
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB limit");
        return;
      }
      
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const getStatusString = (status) => {
    if ('Pending' in status) return 'pending';
    if ('UnderReview' in status) return 'under_review';
    if ('Approved' in status) return 'verified';
    if ('Rejected' in status) return 'rejected';
    return 'unknown';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>Loading chat...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/authority')}>
          Return to Authority Dashboard
        </Button>
      </div>
    );
  }

  // Report not found state
  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>Report not found or chat unavailable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/authority')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <p className="text-gray-400 font-mono">{reportId}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            getStatusString(report.status) === 'verified' 
              ? 'bg-green-900 bg-opacity-20 text-green-400' 
              : getStatusString(report.status) === 'rejected'
                ? 'bg-red-900 bg-opacity-20 text-red-400'
                : 'bg-amber-900 bg-opacity-20 text-amber-400'
          }`}>
            {getStatusString(report.status) === 'verified' ? 'Verified' : 
             getStatusString(report.status) === 'rejected' ? 'Rejected' :
             getStatusString(report.status) === 'under_review' ? 'Under Review' : 'Pending'}
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-400 mr-2" />
            <Card.Title>Authority Communication</Card.Title>
          </div>
          <Card.Description>
            Your identity is verified as an authority to the informer
          </Card.Description>
        </Card.Header>
        <div 
          ref={chatContainerRef}
          className="max-h-[500px] overflow-y-auto p-6 space-y-4 relative"
        >
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No messages yet. Start the conversation with the informer.</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'authority' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'system' ? (
                  <div className="w-full bg-slate-800 bg-opacity-50 py-2 px-4 rounded-md text-center text-sm text-gray-300">
                    {message.content}
                  </div>
                ) : (
                  <div 
                    className={`max-w-[80%] ${
                      message.sender === 'authority' 
                        ? 'bg-blue-900 bg-opacity-30 rounded-l-lg rounded-tr-lg' 
                        : 'bg-slate-800 rounded-r-lg rounded-tl-lg'
                    } p-4`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === 'informer' ? (
                        <Lock className="h-4 w-4 text-purple-400 mr-2" />
                      ) : (
                        <Shield className="h-4 w-4 text-blue-400 mr-2" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === 'informer' ? 'Anonymous Informer' : 'You (Authority)'}
                      </span>
                    </div>
                    <p className="mb-1">{message.content}</p>
                    <p className="text-right text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          
          {showScrollButton && (
            <button 
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowDownCircle className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
        <Card.Footer>
          <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
            {attachment && (
              <div className="flex items-center p-2 bg-slate-800 rounded-lg">
                <FileText className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm truncate flex-1">{attachment.name}</span>
                <button 
                  type="button" 
                  onClick={removeAttachment}
                  className="p-1 hover:bg-slate-700 rounded-full"
                >
                  <XCircle className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                onClick={handleFileUpload}
              >
                <PaperclipIcon className="h-5 w-5 text-gray-400" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Type your message..."
                disabled={isSending}
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={!newMessage.trim() || isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </form>
        </Card.Footer>
      </Card>

      <div className="flex items-center p-4 bg-blue-900 bg-opacity-20 rounded-lg">
        <Lock className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          This chat is end-to-end encrypted. While your identity shows as an Authority to the 
          informer, their identity remains completely anonymous to protect them.
        </p>
      </div>
    </div>
  );
};

export default AuthorityChatPage;