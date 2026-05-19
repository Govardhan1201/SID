'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getIdeaById, updateIdea } from '@/app/actions/ideas';
import { getStudentProfileById } from '@/app/actions/users';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { IdeaCardSkeleton } from '@/components/ui/Skeletons';
import { generateId } from '@/lib/security';
import type { Idea, Comment } from '@/types';
import { Eye, Heart, Bookmark, ArrowLeft, Send, ArrowRight, Tag, Flag } from 'lucide-react';
import styles from './idea.module.css';

const STAGE_LABELS: Record<string, string> = { raw: 'Raw Idea', refined: 'Refined', 'prototype-ready': 'Prototype Ready', incubating: 'Incubating' };
const STAGE_COLORS: Record<string, string> = { raw: 'badge-neutral', refined: 'badge-accent', 'prototype-ready': 'badge-primary', incubating: 'badge-success' };

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role, userId, studentProfile } = useAuth();
  const [commentAuthors, setCommentAuthors] = useState<Record<string, any>>({});
  
  const fetchIdeaDetails = useCallback(async () => {
    const i = await getIdeaById(id);
    if (!i) { router.replace('/explore?tab=ideas'); return null; }
    if (i.visibility === 'admin-only' && !role) { router.replace('/login'); return null; }
    
    const views = (i.views || 0) + 1;
    try { await updateIdea(id, { views }); } catch(e) {}
    i.views = views;

    if (i.authorId) {
      const auth = await getStudentProfileById(i.authorId);
      setAuthor(auth);
    }

    const commentsArr: any[] = Array.isArray(i.comments) ? i.comments as any[] : [];
    const ca: Record<string, any> = {};
    for (const c of commentsArr) {
      if (c && !ca[c.authorId]) {
        const cAuth = await getStudentProfileById(c.authorId);
        if (cAuth) ca[c.authorId] = cAuth;
      }
    }
    setCommentAuthors(ca);
    return i;
  }, [id, role, router]);

  const { data: idea, mutate: mutateIdea, isLoading } = useSWR(`idea-${id}`, fetchIdeaDetails);

  if (isLoading) {
    return (
      <div className="page">
        <Navbar />
        <main className="main">
          <div className="container" style={{ padding: 'var(--space-12) 0', maxWidth: '800px' }}>
            <IdeaCardSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) return null;

  const liked = userId ? idea.likes?.includes(userId) : false;
  const bookmarked = userId ? idea.bookmarks?.includes(userId) : false;
  const isOwner = userId === idea.authorId;

  async function toggleLike() {
    if (!userId || !idea) return;
    const newLikes = liked ? (idea.likes || []).filter((x: string) => x !== userId) : [...(idea.likes || []), userId];
    const i = { ...idea, likes: newLikes };
    mutateIdea(i, false);
    try {
      await updateIdea(id, { likes: newLikes });
      mutateIdea();
    } catch(e) {
      mutateIdea();
    }
  }
  async function toggleBookmark() {
    if (!userId || !idea) return;
    const newBookmarks = bookmarked ? (idea.bookmarks || []).filter((x: string) => x !== userId) : [...(idea.bookmarks || []), userId];
    const i = { ...idea, bookmarks: newBookmarks };
    mutateIdea(i, false);
    try {
      await updateIdea(id, { bookmarks: newBookmarks });
      mutateIdea();
    } catch(e) {
      mutateIdea();
    }
  }
  async function postComment() {
    if (!userId || !comment.trim() || !idea) return;
    const c: Comment = { id: generateId(), authorId: userId, content: comment.trim().slice(0, 2000), likes: [], replies: [], isReported: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const newComments = [...(Array.isArray(idea.comments) ? idea.comments : []), c];
    const i = { ...idea, comments: newComments };
    mutateIdea(i, false); setComment('');
    try {
      await updateIdea(id, { comments: newComments });
      mutateIdea();
    } catch(e) {
      mutateIdea();
    }
    
    if (!commentAuthors[userId]) {
      const cAuth = await getStudentProfileById(userId);
      if (cAuth) setCommentAuthors(prev => ({ ...prev, [userId]: cAuth }));
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/explore?tab=ideas" className={styles.backLink}><ArrowLeft size={15} /> Back to ideas</Link>

          <div className={styles.layout}>
            <div className={styles.main}>
              <div className={styles.header}>
                <div className={styles.headerMeta}>
                  <span className={`badge ${STAGE_COLORS[idea.stage]}`}>{STAGE_LABELS[idea.stage]}</span>
                  <span className="badge badge-neutral">{idea.domain}</span>
                  {idea.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
                </div>
                <h1 className={styles.title}>{idea.title}</h1>
                <p className={styles.summary}>{idea.summary}</p>
                <div className={styles.stats}>
                  <span><Eye size={14} /> {idea.views.toLocaleString()}</span>
                  <button className={`${styles.statBtn} ${liked ? styles.liked : ''}`} onClick={toggleLike}>
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {idea.likes?.length || 0}
                  </button>
                  <button className={`${styles.statBtn} ${bookmarked ? styles.bookmarked : ''}`} onClick={toggleBookmark}>
                    <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} /> Save
                  </button>
                </div>
                {isOwner && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Link href={`/dashboard/ideas/edit/${idea.id}`} className="btn btn-secondary btn-sm">Edit idea</Link>
                    {!idea.convertedToProjectId && (
                      <Link href={`/dashboard/projects/new?fromIdea=${idea.id}`} className="btn btn-outline btn-sm">
                        Convert to project <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Sections */}
              <IdeaSection title="Problem it solves">{idea.problem}</IdeaSection>
              <IdeaSection title="Proposed solution">{idea.solution}</IdeaSection>
              <IdeaSection title="Who it's for">{idea.targetUsers}</IdeaSection>
              <IdeaSection title="Impact">{idea.impact}</IdeaSection>
              <IdeaSection title="Feasibility">{idea.feasibility}</IdeaSection>
              <IdeaSection title="Why it's novel">{idea.novelty}</IdeaSection>
              {idea.risks && <IdeaSection title="Risks & limitations">{idea.risks}</IdeaSection>}
              {idea.roadmap && <IdeaSection title="Roadmap">{idea.roadmap}</IdeaSection>}

              {/* Resources + Skills needed */}
              {(idea.neededResources || []).length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Resources needed</h2>
                  <ul className={styles.bulletList}>{(idea.neededResources || []).map((r: string) => <li key={r}>{r}</li>)}</ul>
                </div>
              )}
              {(idea.rolesNeeded || idea.neededSkills || []).length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Looking for collaborators with</h2>
                  <div className="chip-list">{(idea.rolesNeeded || idea.neededSkills || []).map((s: string) => <span key={s} className="chip">{s}</span>)}</div>
                </div>
              )}
              {(idea.tags || []).length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}><Tag size={15} /> Tags</h2>
                  <div className="chip-list">{(idea.tags || []).map((t: string) => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}
              {(idea.sdgMapping || idea.sdgAlignment || []).length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>SDG Alignment</h2>
                  <div className="chip-list">{(idea.sdgMapping || idea.sdgAlignment || []).map((s: string) => <span key={s} className="badge badge-success">{s}</span>)}</div>
                </div>
              )}

              {/* Comments */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Discussion ({idea.comments?.length || 0})</h2>
                {userId ? (
                  <div className={styles.commentForm}>
                    <img src={studentProfile?.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=U`} alt="" className="avatar avatar-sm" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <textarea className="textarea" rows={2} placeholder="Ask a question or leave feedback…" value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} />
                      <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={postComment} disabled={!comment.trim()}><Send size={13} /> Post</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-4)' }}><Link href="/login" style={{ color: 'var(--primary-l)', fontWeight: 600 }}>Sign in</Link> to comment.</p>
                )}
                <div className={styles.commentList}>
                  {(Array.isArray(idea.comments) ? idea.comments : []).map((c: any) => {
                    const ca = commentAuthors[c.authorId];
                    return (
                      <div key={c.id} className={styles.comment}>
                        <img src={ca?.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=${c.authorId}`} alt="" className="avatar avatar-sm" />
                        <div>
                          <div className={styles.commentMeta}><strong>{ca?.name ?? 'User'}</strong><span>{new Date(c.createdAt).toLocaleDateString()}</span></div>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.6 }}>{c.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {author && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                  <p className={styles.sideLabel}>Posted by</p>
                  <Link href={`/profile/${author.userId}`} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <img src={author.avatar} alt={author.name} className="avatar avatar-lg" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-1)' }}>{author.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{author.college}</div>
                    </div>
                  </Link>
                  {author.bio && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', lineHeight: 1.6 }}>{author.bio}</p>}
                  <div className="chip-list" style={{ marginTop: 'var(--space-3)' }}>{(author.skills || []).slice(0, 4).map((s: string) => <span key={s} className="chip">{s}</span>)}</div>
                </div>
              )}
              <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <p className={styles.sideLabel}>Stage</p>
                <span className={`badge ${STAGE_COLORS[idea.stage]}`} style={{ fontSize: 'var(--text-sm)' }}>{STAGE_LABELS[idea.stage]}</span>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--text-4)' }}><Flag size={13} /> Report</button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function IdeaSection({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionBody}>{children as string}</p>
    </div>
  );
}
