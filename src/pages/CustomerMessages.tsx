import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import {
  fetchCustomerConversations,
  fetchConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from '../lib/api';
import type { Conversation, Message } from '../types';
import { MessageSquare, Send, ArrowLeft, Package, ShoppingBag, CheckCheck } from 'lucide-react';

export default function CustomerMessages() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (selectId?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchCustomerConversations(user.id);
      setConversations(data);

      if (data.length > 0) {
        const targetId = selectId || initialConvId || data[0].id;
        const found = data.find((c) => c.id === targetId) || data[0];
        setActiveConv(found);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load conversations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await fetchConversationMessages(convId);
      setMessages(msgs);
      await markMessagesAsRead(convId, 'customer');
      // Update unread count locally
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        loadConversations();
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
    }
  }, [activeConv?.id]);

  // Supabase Realtime Subscription for incoming messages
  useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`public:messages:${activeConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          if (newMsg.sender_type === 'admin') {
            markMessagesAsRead(activeConv.id, 'customer');
          }
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !user || sending) return;

    const bodyText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await sendMessage({
        conversationId: activeConv.id,
        senderId: user.id,
        senderType: 'customer',
        body: bodyText,
      });

      // Refresh conversations order
      loadConversations(activeConv.id);
    } catch (err: any) {
      showToast('Failed to send message.', 'error');
      setNewMessage(bodyText);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mcn-gray-50 text-mcn-charcoal pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="p-2 rounded-lg bg-white border border-mcn-gray-200 text-mcn-gray-600 hover:text-mcn-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-mcn-blue" />
                Seller Support Chat
              </h1>
              <p className="text-xs text-mcn-gray-500">Real-time messaging with Music Craft Nepal team</p>
            </div>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-mcn-gray-200 p-12 text-center shadow-sm">
            <MessageSquare className="w-16 h-16 text-mcn-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-mcn-charcoal mb-2">No active conversations</h2>
            <p className="text-sm text-mcn-gray-500 max-w-md mx-auto mb-6">
              You can start a chat with our seller team from any Product page or Order tracking view.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              Browse Instruments
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-mcn-gray-200 shadow-sm overflow-hidden grid md:grid-cols-3 min-h-[600px] h-[calc(100vh-180px)]">
            {/* Conversation List Sidebar */}
            <div className="border-r border-mcn-gray-200 flex flex-col h-full bg-mcn-gray-50/50">
              <div className="p-4 border-b border-mcn-gray-200 font-extrabold text-sm text-mcn-charcoal">
                Conversations ({conversations.length})
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-mcn-gray-100">
                {conversations.map((c) => {
                  const isSelected = activeConv?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 relative ${
                        isSelected ? 'bg-white border-l-4 border-mcn-blue shadow-sm' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-mcn-blue/10 text-mcn-blue font-bold flex items-center justify-center shrink-0 text-sm">
                        {c.subject ? c.subject.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-sm font-bold text-mcn-charcoal truncate">
                            {c.subject || 'Product Inquiry'}
                          </p>
                          <span className="text-[10px] text-mcn-gray-400 font-semibold shrink-0 ml-2">
                            {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {c.product && (
                          <p className="text-xs text-mcn-blue font-semibold truncate flex items-center gap-1 mb-1">
                            <Package className="w-3 h-3 shrink-0" /> {c.product.name}
                          </p>
                        )}
                        {c.order_id && (
                          <p className="text-xs text-emerald-700 font-semibold truncate flex items-center gap-1 mb-1">
                            <ShoppingBag className="w-3 h-3 shrink-0" /> Order #{c.order_id}
                          </p>
                        )}
                      </div>
                      {c.unread_count && c.unread_count > 0 ? (
                        <span className="bg-mcn-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {c.unread_count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Chat Panel */}
            <div className="md:col-span-2 flex flex-col h-full bg-white">
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-mcn-gray-200 flex items-center justify-between bg-mcn-gray-50">
                    <div>
                      <h2 className="font-extrabold text-base text-mcn-charcoal">
                        {activeConv.subject || 'Product Inquiry'}
                      </h2>
                      {activeConv.product && (
                        <Link
                          to={`/product/${activeConv.product.slug}`}
                          className="text-xs text-mcn-blue font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Package className="w-3.5 h-3.5" /> Item: {activeConv.product.name}
                        </Link>
                      )}
                      {activeConv.order_id && (
                        <Link
                          to="/my-orders"
                          className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Order #{activeConv.order_id}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Live Support
                    </span>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-mcn-gray-50/30">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-mcn-gray-400 text-sm font-semibold">
                        Send a message to start the conversation...
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isCustomer = m.sender_type === 'customer';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                isCustomer
                                  ? 'bg-mcn-blue text-white rounded-br-none shadow-sm'
                                  : 'bg-white border border-mcn-gray-200 text-mcn-charcoal rounded-bl-none shadow-sm'
                              }`}
                            >
                              {!isCustomer && (
                                <p className="text-[10px] font-extrabold text-mcn-blue uppercase tracking-wider mb-1">
                                  Music Craft Nepal Team
                                </p>
                              )}
                              <p className="whitespace-pre-wrap">{m.body}</p>
                              <div
                                className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                                  isCustomer ? 'text-blue-100' : 'text-mcn-gray-400'
                                }`}
                              >
                                <span>
                                  {new Date(m.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isCustomer && <CheckCheck className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSend} className="p-4 border-t border-mcn-gray-200 flex gap-2 bg-white">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message to the seller..."
                      className="flex-1 px-4 py-2.5 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl text-sm focus:outline-none focus:border-mcn-blue transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-5 py-2.5 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-mcn-gray-400 text-sm">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
