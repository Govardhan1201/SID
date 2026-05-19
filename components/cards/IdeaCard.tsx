import Link from 'next/link';
import { Eye, Heart, Bookmark, ArrowUpRight } from 'lucide-react';
import type { Idea } from '@/types';
import { useState, useEffect } from 'react';
import styles from './IdeaCard.module.css';

const STAGE_LABELS: Record<string, string> = {
  raw: 'Raw Idea',
  refined: 'Refined',
  'prototype-ready': 'Prototype Ready',
  incubating: 'Incubating',
};
const STAGE_COLORS: Record<string, string> = {
  raw: 'badge-neutral',
  refined: 'badge-accent',
  'prototype-ready': 'badge-primary',
  incubating: 'badge-success',
};

interface Props {
  idea: Idea;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  currentUserId?: string;
}

export default function IdeaCard({ idea, onLike, onBookmark, currentUserId }: Props) {
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { getStudentProfileById } = require('@/app/actions/users');
      setAuthor(await getStudentProfileById(idea.authorId));
    }
    load();
  }, [idea.authorId]);

  const liked    = currentUserId ? idea.likes?.includes(currentUserId)     : false;
  const bookmarked = currentUserId ? idea.bookmarks?.includes(currentUserId) : false;

  return (
    <article className={`card card-hover ${styles.card}`}>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={`badge ${STAGE_COLORS[idea.stage]}`}>{STAGE_LABELS[idea.stage]}</span>
          <span className="badge badge-neutral">{idea.domain}</span>
          {idea.visibility === 'admin-only' && <span className="badge badge-warning">Admin-only</span>}
        </div>

        <Link href={`/idea/${idea.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{idea.title}</h3>
        </Link>
        <p className={styles.summary}>{idea.summary}</p>

        {((idea as any).rolesNeeded || (idea as any).neededSkills || []).length > 0 && (
          <div className={styles.needs}>
            <span className={styles.needsLabel}>Looking for:</span>
            <div className="chip-list">
              {((idea as any).rolesNeeded || (idea as any).neededSkills || []).slice(0, 3).map((s: string) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        )}

        {author && (
          <Link href={`/profile/${author.userId}`} className={styles.author}>
            <img src={author.avatar} alt={author.name} className="avatar avatar-sm" />
            <div>
              <span className={styles.authorName}>{author.name}</span>
              <span className={styles.authorMeta}>{author.college}</span>
            </div>
          </Link>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          <span><Eye size={13} /> {idea.views.toLocaleString()}</span>
          <button
            className={`${styles.statBtn} ${liked ? styles.liked : ''}`}
            onClick={() => onLike?.(idea.id)}
            data-tooltip={liked ? "Unlike" : "Like"}
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
            {idea.likes?.length || 0}
          </button>
          <button
            className={`${styles.statBtn} ${bookmarked ? styles.bookmarked : ''}`}
            onClick={() => onBookmark?.(idea.id)}
            data-tooltip={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <Link href={`/idea/${idea.id}`} className={styles.readMore}>
          Read <ArrowUpRight size={12} />
        </Link>
      </div>
    </article>
  );
}
