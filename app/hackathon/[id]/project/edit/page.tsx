'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  HackathonStore, 
  HackathonTeamStore, 
  HackathonParticipantStore, 
  HackathonProjectStore
} from '@/lib/hackathon-store';
import type { Hackathon, HackathonTeam, HackathonProject } from '@/types';
import HackathonProjectForm from '@/components/hackathon/HackathonProjectForm';
import { ChevronLeft } from 'lucide-react';
import styles from '../new/project-page.module.css';

export default function EditHackathonProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [project, setProject] = useState<HackathonProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!userId) { router.replace('/login'); return; }

    const h = HackathonStore.getById(id);
    if (!h) { router.replace('/explore'); return; }
    setHackathon(h);

    const participant = HackathonParticipantStore.getByHackathon(id).find(p => p.userId === userId);
    if (!participant) { router.replace(`/hackathon/${id}`); return; }

    const t = HackathonTeamStore.getById(participant.teamId);
    if (!t) { router.replace(`/hackathon/${id}`); return; }
    setTeam(t);

    const existing = HackathonProjectStore.getByTeam(t.id);
    if (!existing) {
      router.replace(`/hackathon/${id}/project/new`);
      return;
    }
    setProject(existing);

    setLoading(false);
  }, [id, userId, isLoading, router]);

  if (loading || !hackathon || !team || !project) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href={`/hackathon/${hackathon.id}`} className={styles.backLink}>
            <ChevronLeft size={14} /> Back to hackathon
          </Link>

          <h1 className={styles.title}>Edit Submission</h1>
          <p className={styles.sub}>
            Update your project submission for <strong>{hackathon.name}</strong>.
          </p>

          <HackathonProjectForm hackathon={hackathon} team={team} existingProject={project} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
