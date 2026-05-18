import type { HackathonStandings } from '@/types';

// Mock store for HackathonStandings as requested
class HackathonStandingsStoreImpl {
  private key = 'ideaforge_hackathon_standings';

  private load(): Record<string, HackathonStandings> {
    if (typeof window === 'undefined') return {};
    const d = localStorage.getItem(this.key);
    return d ? JSON.parse(d) : {};
  }

  getByHackathon(hackathonId: string): HackathonStandings | null {
    return this.load()[hackathonId] || null;
  }

  save(standings: HackathonStandings) {
    if (typeof window === 'undefined') return;
    const all = this.load();
    all[standings.hackathonId] = standings;
    localStorage.setItem(this.key, JSON.stringify(all));
  }
}

export const HackathonStandingsStore = new HackathonStandingsStoreImpl();
