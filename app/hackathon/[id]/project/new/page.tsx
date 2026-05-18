'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { getHackathonById, getParticipantsByHackathon, getTeamsByHackathon, getProjectsByHackathon } from '@/app/actions/hackathon';
import type { Hackathon, HackathonTeam } from '@/types';
import HackathonProjectForm from '@/components/hackathon/HackathonProjectForm';
import { ChevronLeft } from 'lucide-react';
import styles from './project-page.module.css';

export default function NewHackathonProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (isLoading) return;
      if (!userId) { router.replace('/login'); return; }

      const h = await getHackathonById(id);
      if (!h) { router.replace('/explore'); return; }
      setHackathon(h as unknown as Hackathon);

      const participants = await getParticipantsByHackathon(id);
      const participant = participants.find(p => p.userId === userId);
      if (!participant) { router.replace(`/hackathon/${id}`); return; }

      const teams = await getTeamsByHackathon(id);
      const t = teams.find(team => team.id === participant.teamId);
      if (!t) { router.replace(`/hackathon/${id}`); return; }
      setTeam(t as unknown as HackathonTeam);
      setIsLeader(participant.role === 'leader');

      // Check if project already exists
      const projs = await getProjectsByHackathon(id);
      const existing = projs.find(p => p.teamId === t.id);
      if (existing) {
        router.replace(`/hackathon/${id}/project/edit`);
        return;
      }

      setLoading(false);
    }
    loadData();
  }, [id, userId, isLoading, router]);

  if (loading || !hackathon || !team) return null;

  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <div className="container container--narrow" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <Link href={`/hackathon/${hackathon.id}`} className={styles.backLink}>
            <ChevronLeft size={14} /> Back to hackathon
          </Link>

          <h1 className={styles.title}>Submit Project</h1>
          <p className={styles.sub}>
            Submit your project for <strong>{hackathon.name}</strong> as team <strong>{team.name}</strong>.
            {isLeader ? '' : ' Note: Only the team leader can usually submit, but any member can edit.'}
          </p>

          <HackathonProjectForm hackathon={hackathon} team={team} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
