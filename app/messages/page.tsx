'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getConversations, getMessages, sendMessage } from '@/app/actions/messages';
import { Send, UserCircle, MessageSquare } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStudentProfileById } from '@/app/actions/users';

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
  const [initialPartnerName, setInitialPartnerName] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUserId) {
      getStudentProfileById(initialUserId).then(profile => {
        if (profile) setInitialPartnerName(profile.name);
      });
    }
  }, [initialUserId]);

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
    (activePartnerId && activePartnerId === initialUserId ? { partnerId: initialUserId, partnerName: initialPartnerName || 'Loading...', partnerAvatar: null } : null);

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
      
      <main className="main" style={{ flex: 1, overflow: 'hidden', padding: 0, position: 'relative', minHeight: 0 }}>
        {/* Background gradient for glassmorphism */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, var(--primary) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(100px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', opacity: 0.1, filter: 'blur(100px)', zIndex: 0 }} />

        <div style={{ display: 'flex', height: '100%', maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6)', gap: 'var(--space-6)', position: 'relative', zIndex: 1 }}>
          
          {/* Sidebar */}
          <div className="card" style={{ width: '320px', display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', flexShrink: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MessageSquare size={20} className="text-primary" /> Messages
              </h1>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-2)', minHeight: 0 }}>
              {conversations.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.9rem' }}>
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
                      padding: 'var(--space-3) var(--space-4)',
                      margin: 'var(--space-1) 0',
                      display: 'flex', 
                      gap: 'var(--space-3)', 
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-lg)',
                      background: activePartnerId === c.partnerId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: activePartnerId === c.partnerId ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {c.partnerAvatar ? (
                      <img src={c.partnerAvatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <UserCircle size={44} color="var(--text-4)" strokeWidth={1.5} />
                    )}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: activePartnerId === c.partnerId ? 'var(--text-1)' : 'var(--text-2)', fontSize: '0.95rem' }}>{c.partnerName}</span>
                        {c.unreadCount > 0 && (
                          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)' }}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {c.latestMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
            {activePartnerId ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                  {activePartner?.partnerAvatar ? (
                    <img src={activePartner.partnerAvatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={36} color="var(--text-3)" strokeWidth={1.5} />
                  )}
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-1)' }}>{activePartner?.partnerName || 'User'}</h2>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span> Online
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>
                  {messages.map((msg: any) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '75%', 
                          padding: 'var(--space-3) var(--space-4)', 
                          borderRadius: 'var(--radius-lg)',
                          background: isMe ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
                          border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                          color: isMe ? 'white' : 'var(--text-1)',
                          borderBottomRightRadius: isMe ? 0 : 'var(--radius-lg)',
                          borderBottomLeftRadius: isMe ? 'var(--radius-lg)' : 0,
                          boxShadow: isMe ? '0 4px 15px rgba(99, 102, 241, 0.2)' : 'none',
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-4)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', flexShrink: 0 }}>
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '99px', paddingLeft: 'var(--space-4)' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-4)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                  <MessageSquare size={32} style={{ opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-2)' }}>Your Messages</p>
                <p style={{ fontSize: '0.9rem' }}>Select a conversation from the sidebar to start chatting.</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
