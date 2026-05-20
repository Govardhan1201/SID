'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, sendMessage } from '@/app/actions/messages';
import { Send, UserCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="page"><Navbar /><main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</main></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialUserId = searchParams.get('user');
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialUserId || null);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll conversations every 5 seconds
  const { data: conversations = [], mutate: mutateConvos } = useSWR(
    'conversations', 
    () => getConversations(),
    { refreshInterval: 5000 }
  );

  // Poll messages for active partner every 3 seconds
  const { data: messages = [], mutate: mutateMessages } = useSWR(
    activePartnerId ? `messages-${activePartnerId}` : null,
    () => getMessages(activePartnerId!),
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartnerId) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic UI update
    const tempMsg = {
      id: Date.now().toString(),
      senderId: userId!,
      receiverId: activePartnerId,
      content,
      isRead: false,
      createdAt: new Date()
    };
    mutateMessages([...messages, tempMsg], false);

    await sendMessage(activePartnerId, content);
    mutateMessages();
    mutateConvos();
  };

  const activePartner = conversations.find((c: any) => c.partnerId === activePartnerId) || 
    (initialUserId && activePartnerId === initialUserId ? { partnerId: initialUserId, partnerName: 'Loading...' } : null);

  if (!userId) {
    return (
      <div className="page">
        <Navbar />
        <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Please log in to view messages.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />
      
      <main className="main" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-2)' }}>
          
          {/* Sidebar */}
          <div style={{ width: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-1)' }}>
            <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Messages</h1>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {conversations.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-3)' }}>
                  No conversations yet.
                </div>
              ) : (
                conversations.map((c: any) => (
                  <div 
                    key={c.partnerId}
                    onClick={() => {
                      setActivePartnerId(c.partnerId);
                      router.replace(`/messages?user=${c.partnerId}`);
                    }}
                    style={{ 
                      padding: 'var(--space-4) var(--space-5)', 
                      display: 'flex', 
                      gap: 'var(--space-3)', 
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: activePartnerId === c.partnerId ? 'var(--primary-dim)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    {c.partnerAvatar ? (
                      <img src={c.partnerAvatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <UserCircle size={48} color="var(--text-4)" />
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{c.partnerName}</span>
                        {c.unreadCount > 0 && (
                          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.latestMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-2)' }}>
            {activePartnerId ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <UserCircle size={32} color="var(--text-3)" />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activePartner?.partnerName || 'User'}</h2>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', 
                          padding: 'var(--space-3) var(--space-4)', 
                          borderRadius: 'var(--radius-lg)',
                          background: isMe ? 'var(--primary)' : 'var(--bg-3)',
                          color: isMe ? 'white' : 'var(--text-1)',
                          borderBottomRightRadius: isMe ? 0 : 'var(--radius-lg)',
                          borderBottomLeftRadius: isMe ? 'var(--radius-lg)' : 0
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Type a message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-2)' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-4)' }}>
                <Send size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
