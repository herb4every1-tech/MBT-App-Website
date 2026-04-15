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
    } else {
      console.error('Update error:', error);
      alert('Failed to mark as read. Please check RLS policies.');
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
    } else {
      console.error('Delete error:', error);
      alert('Failed to delete. Please check RLS policies.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#4A7C59]/20 border-t-[#4A7C59] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1F1C]">Support Inbox</h2>
          <p className="text-[#5A6B61] mt-1">Manage user inquiries and reports.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#D4E6DA] text-[#4A7C59] px-4 py-2 rounded-2xl text-sm font-bold">
          <Mail className="w-4 h-4" />
          {messages.filter(m => !m.is_read).length} UNREAD
        </div>
      </div>

      <div className="grid gap-6">
        {messages.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-[#E5EDE8]">
            <div className="w-20 h-20 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-[#9BABA0]" />
            </div>
            <p className="text-[#5A6B61] text-lg">Your support inbox is currently clear.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`bg-white p-8 rounded-[2rem] shadow-sm border ${
                msg.is_read ? 'border-[#E5EDE8]' : 'border-[#4A7C59] ring-4 ring-[#4A7C59]/5'
              } transition-all hover:shadow-md`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-[#E5EDE8]">
                    <User className="w-6 h-6 text-[#4A7C59]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1F1C]">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-[#5A6B61] text-sm">
                      <Mail className="w-3 h-3" />
                      {msg.email}
                    </div>
                  </div>
                </div>
                {!msg.is_read && (
                  <span className="bg-[#4A7C59] text-white text-[10px] font-black px-2 py-1 rounded-md tracking-widest uppercase">New Message</span>
                )}
                <div className="flex items-center gap-2 text-xs text-[#9BABA0] bg-[#FAFAF8] px-3 py-1.5 rounded-xl border border-[#E5EDE8]">
                  <Calendar className="w-3 h-3" />
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>

              <div className="mb-8 p-6 bg-[#FAFAF8] rounded-2xl border border-[#E5EDE8]">
                <h4 className="font-bold text-[#1A1F1C] mb-3 leading-tight underline decoration-[#4A7C59]/20 underline-offset-4">Subject: {msg.subject}</h4>
                <p className="text-[#5A6B61] leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#FAFAF8]">
                {!msg.is_read && (
                  <button 
                    onClick={() => markAsRead(msg.id)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3D664A] transition-all font-bold text-sm shadow-lg shadow-[#4A7C59]/10"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Read
                  </button>
                )}
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
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
