import Link from 'next/link';
import { Eye, Heart, Bookmark, GitFork, ExternalLink, Users, Cpu } from 'lucide-react';
import type { Project } from '@/types';
import { StudentStore } from '@/lib/store';
import styles from './ProjectCard.module.css';

interface Props {
  project: Project;
  onLike?:     (id: string) => void;
  onBookmark?: (id: string) => void;
  currentUserId?: string;
}

export default function ProjectCard({ project, onLike, onBookmark, currentUserId }: Props) {
  const author   = StudentStore.getById(project.authorId);
  const liked    = currentUserId ? project.likes.includes(currentUserId)     : false;
  const bookmarked = currentUserId ? project.bookmarks.includes(currentUserId) : false;

  const statusColor = project.moderationStatus === 'featured' ? styles.featured
    : project.moderationStatus === 'approved' ? styles.approved : '';

  return (
    <article className={`${styles.card} ${statusColor}`}>
      {/* Accent bar */}
      <div className={styles.accentBar} />

      <div className={styles.body}>
        {/* Top meta */}
        <div className={styles.topMeta}>
          <span className={styles.domain}>
            <Cpu size={10} />{project.domain}
          </span>
          {project.isFeatured && <span className={styles.featuredBadge}>★ Featured</span>}
          {project.visibility === 'admin-only' && <span className={styles.restrictedBadge}>🔒 Restricted</span>}
        </div>

        {/* Title */}
        <Link href={`/project/${project.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{project.title}</h3>
        </Link>
        <p className={styles.tagline}>{project.tagline}</p>

        {/* Tech stack */}
        <div className={styles.techRow}>
          {project.techStack.slice(0, 4).map(t => (
            <span key={t} className={styles.techTag}>{t}</span>
          ))}
          {project.techStack.length > 4 && (
            <span className={styles.techTag}>+{project.techStack.length - 4}</span>
          )}
        </div>

        {/* Author */}
        {author && (
          <Link href={`/profile/${author.userId}`} className={styles.author}>
            <img src={author.avatar} alt={author.name} className={styles.authorAvatar} />
            <div>
              <span className={styles.authorName}>{author.name}</span>
              <span className={styles.authorSub}>{author.college} · Yr {author.year}</span>
            </div>
          </Link>
        )}

        {project.teamMembers.length > 1 && (
          <div className={styles.teamRow}>
            <Users size={11} /><span>{project.teamMembers.length} contributors</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span className={styles.stat}><Eye size={12} />{project.views.toLocaleString()}</span>
          <button
            className={`${styles.statBtn} ${liked ? styles.liked : ''}`}
            onClick={() => onLike?.(project.id)}
            aria-label="Like"
          >
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
            {project.likes.length}
          </button>
          <button
            className={`${styles.statBtn} ${bookmarked ? styles.bookmarked : ''}`}
            onClick={() => onBookmark?.(project.id)}
            aria-label="Bookmark"
          >
            <Bookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
            {project.bookmarks.length}
          </button>
        </div>
        <div className={styles.links}>
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className={styles.linkBtn} aria-label="GitHub">
              <GitFork size={13} />
            </a>
          )}
          {project.liveDemo && (
            <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className={styles.linkBtn} aria-label="Live demo">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
