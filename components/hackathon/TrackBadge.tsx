import type { HackathonTrack } from '@/types';

interface Props {
  track: HackathonTrack;
  className?: string;
}

export default function TrackBadge({ track, className = '' }: Props) {
  // Generate a consistent color based on the track name
  const colors = [
    'var(--primary)',
    'var(--accent)',
    '#a855f7', // purple
    '#f59e0b', // amber
    '#ef4444', // red
  ];
  
  let hash = 0;
  for (let i = 0; i < track.name.length; i++) {
    hash = track.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {track.name}
    </span>
  );
}
