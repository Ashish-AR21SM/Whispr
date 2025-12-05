import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, PaperclipIcon, Lock, ChevronLeft, Shield, ArrowDownCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Mock chat data
const mockChats = {
  '0x7f9b4d8a1e2c3b4d': {
    title: 'Environmental Dumping Near River',
    status: 'verified',
    messages: [
      {
        id: 1,
        sender: 'authority',
        content: 'Thank you for your report. Could you provide more details about the location?',
        timestamp: '2025-04-10T14:30:00Z'
      },
      {
        id: 2,
        sender: 'informer',
        content: 'The dumping is happening behind the industrial complex on Riverside Drive, approximately 500 meters north of the bridge. I\'ve attached satellite coordinates in the evidence files.',
        timestamp: '2025-04-10T15:45:00Z'
      },
      {
        id: 3,
        sender: 'authority',
        content: 'We\'ve reviewed your evidence and will be conducting an inspection in the next 48 hours. Your report is very detailed and helpful.',
        timestamp: '2025-04-11T09:15:00Z'
      },
      {
        id: 4,
        sender: 'informer',
        content: 'Thank you. I can confirm that the dumping usually happens between 2AM and 4AM. The trucks have company logos covered.',
        timestamp: '2025-04-11T10:22:00Z'
      },
      {
        id: 5,
        sender: 'authority',
        content: 'This information is incredibly valuable. We\'ve expedited our investigation and contacted the environmental protection agency. Your report has been verified, and the reward will be transferred to your wallet.',
        timestamp: '2025-04-12T16:05:00Z'
      },
      {
        id: 6,
        sender: 'system',
        content: 'Report has been verified. 150 tokens have been transferred to your wallet.',
        timestamp: '2025-04-12T16:10:00Z'
      }
    ]
  },
  '0x3a4b5c6d7e8f9a0b': {
    title: 'Suspicious Financial Activity',
    status: 'pending',
    messages: [
      {
        id: 1,
        sender: 'system',
        content: 'Your report has been received and is pending review.',
        timestamp: '2025-04-08T10:15:00Z'
      }
    ]
  },
  '0x1e2f3a4b5c6d7e8f': {
    title: 'Cyber Attack Attempt',
    status: 'verified',
    messages: [
      {
        id: 1,
        sender: 'authority',
        content: 'We\'ve received your report about the cyber attack attempt. Can you share information about how you detected this?',
        timestamp: '2025-04-02T09:30:00Z'
      },
      {
        id: 2,
        sender: 'informer',
        content: 'I noticed unusual access patterns in the system logs. There were repeated attempts to access secure endpoints using different authentication credentials within a short timeframe.',
        timestamp: '2025-04-02T10:45:00Z'
      },
      {
        id: 3,
        sender: 'authority',
        content: 'Thank you for the clarification. The IP addresses you provided have been flagged in our systems. Have you noticed any successful breaches?',
        timestamp: '2025-04-03T11:20:00Z'
      },
      {
        id: 4,
        sender: 'informer',
        content: 'No successful breaches were detected. The system\'s security protocols worked as intended, but the persistence of the attacks was concerning.',
        timestamp: '2025-04-03T13:15:00Z'
      },
      {
        id: 5,
        sender: 'authority',
        content: 'Your report has been instrumental in identifying a coordinated attack pattern. We\'ve verified your report and are issuing the reward payment.',
        timestamp: '2025-04-04T15:30:00Z'
      },
      {
        id: 6,
        sender: 'system',
        content: 'Report has been verified. 100 tokens have been transferred to your wallet.',
        timestamp: '2025-04-04T15:35:00Z'
      }
    ]
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const ChatPage = () => {
  const { reportId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [chatData, setChatData] = useState(null);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (reportId && mockChats[reportId]) {
      setChatData(mockChats[reportId]);
    }
  }, [reportId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !reportId || !chatData) return;

    // In a real app, this would send the message to the blockchain
    const newMessageObj = {
      id: Date.now(),
      sender: 'informer',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessageObj]
      };
    });

    setNewMessage('');
  };

  if (!chatData) {
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
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{chatData.title}</h1>
            <p className="text-gray-400 font-mono">{reportId}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            chatData.status === 'verified' 
              ? 'bg-green-900 bg-opacity-20 text-green-400' 
              : 'bg-amber-900 bg-opacity-20 text-amber-400'
          }`}>
            {chatData.status === 'verified' ? 'Verified' : 'Pending'}
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-purple-400 mr-2" />
            <Card.Title>Secure Anonymous Chat</Card.Title>
          </div>
          <Card.Description>
            Your identity remains protected through blockchain technology
          </Card.Description>
        </Card.Header>
        <div 
          ref={chatContainerRef}
          className="max-h-[500px] overflow-y-auto p-6 space-y-4 relative"
        >
          {chatData.messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'informer' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'system' ? (
                <div className="w-full bg-slate-800 bg-opacity-50 py-2 px-4 rounded-md text-center text-sm text-gray-300">
                  {message.content}
                </div>
              ) : (
                <div 
                  className={`max-w-[80%] ${
                    message.sender === 'informer' 
                      ? 'bg-purple-900 bg-opacity-30 rounded-l-lg rounded-tr-lg' 
                      : 'bg-slate-800 rounded-r-lg rounded-tl-lg'
                  } p-4`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender === 'authority' ? (
                      <Shield className="h-4 w-4 text-blue-400 mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 text-purple-400 mr-2" />
                    )}
                    <span className="text-xs font-medium">
                      {message.sender === 'authority' ? 'Authority' : 'You (Anonymous)'}
                    </span>
                  </div>
                  <p className="mb-1">{message.content}</p>
                  <p className="text-right text-xs text-gray-500">{formatTimestamp(message.timestamp)}</p>
                </div>
              )}
            </div>
          ))}
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
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <PaperclipIcon className="h-5 w-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Type your message..."
            />
            <Button 
              type="submit" 
              variant="primary"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </Card.Footer>
      </Card>

      <div className="flex items-center p-4 bg-blue-900 bg-opacity-20 rounded-lg">
        <Lock className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          This chat is end-to-end encrypted and secured through blockchain technology. 
          Your identity remains anonymous throughout all communications.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;