import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Inbox, Send, AlertCircle, Mail, Clock } from 'lucide-react';
import { EmailBox } from './components/EmailBox';
import { createTempMail, fetchEmails } from './lib/email';
import type { Email } from './lib/types';

function App() {
  const [tempEmail, setTempEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleEmailSelect = useCallback((emailId: string) => {
    setSelectedEmail(emailId);
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId ? { ...email, read: true } : email
      )
    );
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(tempEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshEmail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEmails([]);
    
    try {
      const { email, token: newToken } = await createTempMail();
      setTempEmail(email);
      setToken(newToken);
      setSelectedEmail(null);
      setTimeLeft(600);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate new email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshInbox = useCallback(async () => {
    if (!token || fetchingEmails || refreshing) return;
    
    setRefreshing(true);
    try {
      const newEmails = await fetchEmails(token);
      setEmails(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const uniqueNewEmails = newEmails.filter(e => !existingIds.has(e.id));
        return [...uniqueNewEmails, ...prev];
      });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [token, fetchingEmails, refreshing]);

  const checkEmails = useCallback(async () => {
    if (!token || fetchingEmails) return;
    
    setFetchingEmails(true);
    try {
      const newEmails = await fetchEmails(token);
      setEmails(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const uniqueNewEmails = newEmails.filter(e => !existingIds.has(e.id));
        return [...uniqueNewEmails, ...prev];
      });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
    } finally {
      setFetchingEmails(false);
    }
  }, [token, fetchingEmails]);

  useEffect(() => {
    handleRefreshEmail();
  }, [handleRefreshEmail]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(checkEmails, 15000);
    return () => clearInterval(interval);
  }, [token, checkEmails]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRefreshEmail();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleRefreshEmail]);

  const selectedEmailData = emails.find(e => e.id === selectedEmail);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TempMail</h1>
                <p className="text-sm text-gray-500">Secure Temporary Email Service</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-blue-100">
              <Clock className="h-4 w-4" />
              <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your temporary email address
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="email"
                    readOnly
                    value={tempEmail}
                    className="flex-1 block w-full rounded-l-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                  />
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {copied ? (
                      <span className="text-green-600">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleRefreshEmail()}
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                New Email
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
            <div className="lg:col-span-1 border-r border-blue-100">
              <div className="p-4 border-b border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-medium text-gray-900">Inbox</h2>
                  </div>
                  <button
                    onClick={handleRefreshInbox}
                    disabled={refreshing || fetchingEmails}
                    className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh inbox"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-blue-100">
                {emails.length === 0 ? (
                  <div className="p-8 text-center">
                    <Inbox className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {loading ? 'Checking for new emails...' : 'Your inbox is empty'}
                    </p>
                  </div>
                ) : (
                  emails.map((email) => (
                    <EmailBox
                      key={email.id}
                      email={email}
                      isSelected={email.id === selectedEmail}
                      onClick={() => handleEmailSelect(email.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white">
              {selectedEmailData ? (
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">
                      {selectedEmailData.subject}
                    </h3>
                    <p className="text-sm text-gray-600">
                      From: <span className="font-medium">{selectedEmailData.fromEmail}</span>
                    </p>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {selectedEmailData.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <Mail className="h-16 w-16 text-blue-100 mb-4" />
                  <p className="text-gray-500 max-w-sm">
                    Select an email from your inbox to view its contents
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;