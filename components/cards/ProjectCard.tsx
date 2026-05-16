import Link from 'next/link';
import { Eye, Heart, Bookmark, GitFork, ExternalLink, Users } from 'lucide-react';
import type { Project } from '@/types';
import { StudentStore } from '@/lib/store';
import styles from './ProjectCard.module.css';

interface Props {
  project: Project;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  currentUserId?: string;
}

export default function ProjectCard({ project, onLike, onBookmark, currentUserId }: Props) {
  const author = StudentStore.getById(project.authorId);
  const liked = currentUserId ? project.likes.includes(currentUserId) : false;
  const bookmarked = currentUserId ? project.bookmarks.includes(currentUserId) : false;

  return (
    <article className={`card card-hover ${styles.card}`}>
      {project.isFeatured && (
        <div className={styles.featuredBanner}>Featured</div>
      )}

      <div className={styles.body}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.meta}>
            <span className={`badge badge-primary`}>{project.domain}</span>
            {project.visibility === 'admin-only' && (
              <span className="badge badge-warning">Admin-only</span>
            )}
          </div>
          <div className={styles.techList}>
            {project.techStack.slice(0, 3).map(t => (
              <span key={t} className="chip">{t}</span>
            ))}
            {project.techStack.length > 3 && (
              <span className="chip">+{project.techStack.length - 3}</span>
            )}
          </div>
        </div>

        {/* Title + tagline */}
        <Link href={`/project/${project.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{project.title}</h3>
        </Link>
        <p className={styles.tagline}>{project.tagline}</p>

        {/* Author */}
        {author && (
          <Link href={`/profile/${author.userId}`} className={styles.author}>
            <img
              src={author.avatar}
              alt={author.name}
              className="avatar avatar-sm"
            />
            <div>
              <span className={styles.authorName}>{author.name}</span>
              <span className={styles.authorMeta}>{author.college} · {author.branch}</span>
            </div>
          </Link>
        )}

        {/* Team */}
        {project.teamMembers.length > 1 && (
          <div className={styles.team}>
            <Users size={13} />
            <span>{project.teamMembers.length} members</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span><Eye size={13} /> {project.views.toLocaleString()}</span>
          <button
            className={`${styles.statBtn} ${liked ? styles.liked : ''}`}
            onClick={() => onLike?.(project.id)}
            aria-label="Like project"
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
            {project.likes.length}
          </button>
          <button
            className={`${styles.statBtn} ${bookmarked ? styles.bookmarked : ''}`}
            onClick={() => onBookmark?.(project.id)}
            aria-label="Bookmark project"
          >
            <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
            {project.bookmarks.length}
          </button>
        </div>

        <div className={styles.links}>
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GitFork size={14} />
            </a>
          )}
          {project.liveDemo && (
            <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" aria-label="Live demo">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
