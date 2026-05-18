'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getProjectById, updateProject } from '@/app/actions/projects';
import { getStudentProfileById } from '@/app/actions/users';
import { useAuth } from '@/context/AuthContext';
import { generateId } from '@/lib/security';
import type { Project, Comment, StudentProfile } from '@/types';
import { Eye, Heart, Bookmark, GitFork, ExternalLink, Video, FileText, Users, Calendar, Tag, ArrowLeft, Send, Flag } from 'lucide-react';
import styles from './project.module.css';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role, userId, studentProfile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [author, setAuthor] = useState<StudentProfile | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, StudentProfile>>({});
  const [teamAuthors, setTeamAuthors] = useState<Record<string, StudentProfile>>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const p = await getProjectById(id);
      if (!p) { router.replace('/explore'); return; }
      if (p.visibility === 'admin-only' && role === null) { router.replace('/login'); return; }

      // Deduplicate view count: only increment once per browser session per project
      const viewKey = `viewed_project_${id}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(viewKey)) {
        p.views++;
        sessionStorage.setItem(viewKey, '1');
        try {
          await updateProject(id, { views: p.views });
        } catch(e) {}
      }

      setProject(p as unknown as Project);
      setAuthor(await getStudentProfileById(p.authorId) as unknown as StudentProfile ?? null);
      
      const cArr = Array.isArray(p.comments) ? p.comments : [];
      const cAuthors = await Promise.all(cArr.map((c: any) => getStudentProfileById(c.authorId)));
      const cAuthorMap: Record<string, StudentProfile> = {};
      cAuthors.forEach((a: any) => { if (a) cAuthorMap[a.userId] = a; });
      setCommentAuthors(cAuthorMap);

      const tArr = Array.isArray(p.teamMembers) ? p.teamMembers : [];
      const tAuthors = await Promise.all(tArr.map((m: any) => getStudentProfileById(m.userId)));
      const tAuthorMap: Record<string, StudentProfile> = {};
      tAuthors.forEach((a: any) => { if (a) tAuthorMap[a.userId] = a; });
      setTeamAuthors(tAuthorMap);

      setLoading(false);
    }
    loadData();
  }, [id, role, router]);

  if (loading || !project) return null;

  const liked = userId ? project.likes?.includes(userId) : false;
  const bookmarked = userId ? project.bookmarks?.includes(userId) : false;

  async function toggleLike() {
    if (!userId || !project) return;
    const p = { ...project };
    if (liked) p.likes = (p.likes || []).filter((x: string) => x !== userId);
    else p.likes = [...(p.likes || []), userId];
    setProject(p);
    try {
      await updateProject(id, { likes: p.likes });
    } catch(e) {}
  }

  async function toggleBookmark() {
    if (!userId || !project) return;
    const p = { ...project };
    if (bookmarked) p.bookmarks = (p.bookmarks || []).filter((x: string) => x !== userId);
    else p.bookmarks = [...(p.bookmarks || []), userId];
    setProject(p);
    try {
      await updateProject(id, { bookmarks: p.bookmarks });
    } catch(e) {}
  }

  async function postComment() {
    if (!userId || !comment.trim() || !project) return;
    const c: Comment = {
      id: generateId(), authorId: userId,
      content: comment.trim().slice(0, 2000),
      likes: [], replies: [], isReported: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const p = { ...project, comments: [...(project.comments || []), c] };
    setProject(p); setComment('');
    try {
      await updateProject(id, { comments: p.comments });
    } catch(e) {}
  }

  const isOwner = userId === project.authorId;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href="/explore" className={styles.backLink}><ArrowLeft size={15} /> Back to explore</Link>

          <div className={styles.layout}>
            {/* ── Main content ── */}
            <div className={styles.main}>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.headerMeta}>
                  <span className="badge badge-primary">{project.domain}</span>
                  {project.isFeatured && <span className="badge badge-warning">Featured</span>}
                  {project.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
                  <span className="badge badge-neutral">{project.buildStatus}</span>
                </div>
                <h1 className={styles.title}>{project.title}</h1>
                <p className={styles.tagline}>{project.tagline}</p>

                <div className={styles.stats}>
                  <span><Eye size={14} /> {project.views.toLocaleString()} views</span>
                  <button className={`${styles.statBtn} ${liked ? styles.liked : ''}`} onClick={toggleLike}>
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {project.likes?.length || 0}
                  </button>
                  <button className={`${styles.statBtn} ${bookmarked ? styles.bookmarked : ''}`} onClick={toggleBookmark}>
                    <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} /> Save
                  </button>
                  <span><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                {isOwner && (
                  <div className={styles.ownerActions}>
                    <Link href={`/dashboard/projects/edit/${project.id}`} className="btn btn-secondary btn-sm">Edit project</Link>
                  </div>
                )}
              </div>

              {/* Links */}
              {(project.githubLink || project.liveDemo || project.demoVideo || project.pptLink) && (
                <div className={styles.linkRow}>
                  {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><GitFork size={14} /> GitHub</a>}
                  {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={14} /> Live demo</a>}
                  {project.demoVideo && <a href={project.demoVideo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Video size={14} /> Demo video</a>}
                  {project.pptLink && <a href={project.pptLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><FileText size={14} /> Presentation</a>}
                </div>
              )}

              {/* Sections */}
              <Section title="Problem Statement" content={project.problemStatement} />
              <Section title="Solution" content={project.solution} />
              <Section title="Impact" content={project.impact} />
              {project.challengesFaced && <Section title="Challenges we faced" content={project.challengesFaced} />}
              {project.learnings && <Section title="What we learned" content={project.learnings} />}
              {project.futureScope && <Section title="Future scope" content={project.futureScope} />}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}><Tag size={16} /> Tags</h2>
                  <div className="chip-list">{project.tags.map(t => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}

              {/* SDG */}
              {project.sdgMapping.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>SDG Alignment</h2>
                  <div className="chip-list">{project.sdgMapping.map(s => <span key={s} className="badge badge-success">{s}</span>)}</div>
                </div>
              )}

              {/* Comments */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Discussion ({project.comments?.length || 0})</h2>
                {userId ? (
                  <div className={styles.commentForm}>
                    <img src={studentProfile?.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=U`} alt="You" className="avatar avatar-sm" />
                    <div className={styles.commentInput}>
                      <textarea className="textarea" rows={2} placeholder="Leave a comment…" value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} />
                      <button className="btn btn-primary btn-sm" onClick={postComment} disabled={!comment.trim()}><Send size={13} /> Post</button>
                    </div>
                  </div>
                ) : (
                  <p className={styles.loginPrompt}><Link href="/login" className={styles.loginLink}>Sign in</Link> to leave a comment.</p>
                )}
                <div className={styles.commentList}>
                  {project.comments.map(c => {
                    const ca = commentAuthors[c.authorId];
                    return (
                      <div key={c.id} className={styles.comment}>
                        <img src={ca?.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=${c.authorId}`} alt="" className="avatar avatar-sm" />
                        <div>
                          <div className={styles.commentMeta}><strong>{ca?.name ?? 'User'}</strong><span>{new Date(c.createdAt).toLocaleDateString()}</span></div>
                          <p className={styles.commentText}>{c.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
              {/* Author */}
              {author && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                  <p className={styles.sideLabel}>Project author</p>
                  <Link href={`/profile/${author.userId}`} className={styles.authorBlock}>
                    <img src={author.avatar} alt={author.name} className="avatar avatar-lg" />
                    <div>
                      <div className={styles.authorName}>{author.name}</div>
                      <div className={styles.authorSub}>{author.college}</div>
                      <div className={styles.authorSub}>{author.branch} · Year {author.year}</div>
                    </div>
                  </Link>
                  <div className="chip-list" style={{ marginTop: 'var(--space-3)' }}>
                    {author.skills.slice(0, 4).map(s => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Tech stack */}
              <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <p className={styles.sideLabel}>Tech stack</p>
                <div className="chip-list">{project.techStack.map(t => <span key={t} className="chip">{t}</span>)}</div>
              </div>

              {/* Team */}
              {project.teamMembers?.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                  <p className={styles.sideLabel}><Users size={13} /> Team</p>
                  <div className={styles.teamList}>
                    {project.teamMembers.map(m => (
                      <div key={m.userId} className={styles.teamMember}>
                        <img src={teamAuthors[m.userId]?.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=${m.name}`} alt={m.name} className="avatar avatar-sm" />
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-1)' }}>{m.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-4)' }}>{m.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report */}
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--text-4)' }}>
                <Flag size={13} /> Report this project
              </button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionBody}>{content}</p>
    </div>
  );
}
