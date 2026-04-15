import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Calendar, CheckCircle, Trash2, User } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Inbox</h2>
        <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-1 rounded-full text-sm font-medium">
          {messages.filter(m => !m.is_read).length} Unread
        </span>
      </div>

      <div className="grid gap-6">
        {messages.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border ${
                msg.is_read ? 'border-gray-100 dark:border-gray-700' : 'border-teal-500 ring-1 ring-teal-500/20'
              } transition-all`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      {msg.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Subject: {msg.subject}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {!msg.is_read && (
                  <button 
                    onClick={() => markAsRead(msg.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Read
                  </button>
                )}
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;
