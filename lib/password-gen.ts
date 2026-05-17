// Generates memorable team passwords: BlueTiger2847
// Format: [Adjective][Animal][4-digit-number]
// Easy to communicate verbally, unique per team, hard to guess

const ADJECTIVES = [
  'Blue','Red','Green','Gold','Silver','Swift','Bright','Dark','Iron','Cyber',
  'Storm','Fire','Ice','Volt','Neon','Sage','Nova','Echo','Flux','Apex',
  'Bold','Keen','Wild','Grim','Sharp','Jade','Onyx','Ruby','Amber','Teal',
];

const ANIMALS = [
  'Tiger','Panda','Eagle','Falcon','Shark','Wolf','Bear','Lion','Hawk','Fox',
  'Lynx','Raven','Cobra','Drake','Viper','Crane','Bison','Moose','Hyena','Otter',
  'Rhino','Gecko','Finch','Quail','Bison','Stoat','Dingo','Tapir','Okapi','Ibis',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0x100000000;
  };
}

/**
 * Generates a unique team password.
 * Same hackathonId + teamName always produces the same password (deterministic).
 * Different teams always get different passwords.
 */
export function generateTeamPassword(hackathonId: string, teamName: string): string {
  // Create a seed from hackathonId + teamName
  const combined = `${hackathonId}:${teamName}`;
  let seed = 0;
  for (let i = 0; i < combined.length; i++) {
    seed = ((seed << 5) - seed) + combined.charCodeAt(i);
    seed |= 0;
  }

  const rand = seededRandom(Math.abs(seed));
  const adj    = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(rand() * ANIMALS.length)];
  const digits = String(Math.floor(rand() * 9000) + 1000); // 1000–9999

  return `${adj}${animal}${digits}`;
}

/**
 * Generates a UUID-style judge token.
 */
export function generateJudgeToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}
