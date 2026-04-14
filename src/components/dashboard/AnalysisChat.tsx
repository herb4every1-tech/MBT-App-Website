import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lock, Loader2, X, MessageSquare, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { openUrl } from '../../lib/utils';
import { apiClient } from '../../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AnalysisChatProps {
  analysisId: string;
  analysisContext: any;
  profile: any;
}

export default function AnalysisChat({ analysisId, analysisContext, profile }: AnalysisChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPro = profile?.plan === 'pro';
  const MAX_FREE_MESSAGES = 3;
  const remainingMessages = Math.max(0, MAX_FREE_MESSAGES - messageCount);
  const isBlocked = !isPro;

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!analysisId) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('chat_history, chat_message_count')
          .eq('id', analysisId)
          .single();

        if (error) throw error;

        if (data) {
          setMessages(data.chat_history || []);
          setMessageCount(data.chat_message_count || 0);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchChatHistory();
  }, [analysisId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBlocked || loading || !analysisId) return;

    if (!isExpanded) {
      setIsExpanded(true);
    }

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await apiClient.post('/chat', {
        messages: newMessages,
        analysisContext,
        profile,
        analysisId,
        messageCount
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.reply || 'I could not process that request.' 
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      const newCount = messageCount + 1;
      
      setMessages(updatedMessages);
      setMessageCount(newCount);

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!profile) return;
    setCheckoutLoading(true);
    try {
      let email = profile.email;
      if (!email) {
        const { data: { user } } = await supabase.auth.getUser();
        email = user?.email;
      }

      const response = await apiClient.post('/get-payment-link', {
        userId: profile.id,
        email: email,
      });

      const data = await response.json();
      if (data.url) {
        await openUrl(data.url);
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please check your Stripe configuration.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isInitializing) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-3xl px-4' : 'w-full max-w-2xl px-4'}`}>
      <div className={`bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'h-[80vh] max-h-[800px] rounded-3xl' : 'h-auto rounded-2xl'}`}>
        
        {/* Header - Only visible when expanded */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5D8A75]/10 flex items-center justify-center text-[#5D8A75]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">Analysis Assistant</h3>
                <p className="text-[10px] text-gray-500 font-medium">Ask questions about your results</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPro && (
                <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Lock size={10} /> Pro Feature
                </div>
              )}
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Minimize"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Chat History - Only visible when expanded */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/10">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Bot size={32} className="text-gray-400" />
                </div>
                <h4 className="text-gray-900 font-bold mb-2">How can I help you?</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  I've analyzed your blood test results. Feel free to ask me to explain any specific markers, what they mean, or how you can improve them.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-[#5D8A75] text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:text-gray-900">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#5D8A75] text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area - Always visible */}
        <div className={`bg-white ${isExpanded ? 'p-4 border-t border-gray-50 shrink-0' : 'p-2'}`}>
          {isBlocked ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-900">AI chat is a Pro feature</span>
              </div>
              <button 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="text-xs font-black text-amber-700 uppercase tracking-wider hover:underline flex items-center gap-1 disabled:opacity-70"
              >
                {checkoutLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  if (messages.length > 0 && !isExpanded) {
                    setIsExpanded(true);
                  }
                }}
                placeholder="Ask about your results..."
                className={`w-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D8A75]/20 focus:border-[#5D8A75] transition-all ${isExpanded ? 'rounded-2xl pl-5 pr-14 py-4 text-sm' : 'rounded-xl pl-4 pr-12 py-3 text-base'}`}
                disabled={loading || !analysisId}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || !analysisId}
                className={`absolute right-2 flex items-center justify-center bg-[#5D8A75] text-white hover:bg-[#4D7361] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isExpanded ? 'w-10 top-2 bottom-2 rounded-xl' : 'w-8 h-8 rounded-lg'}`}
              >
                <Send size={isExpanded ? 16 : 14} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
