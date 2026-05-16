import type { User, StudentProfile, RecruiterProfile, Project, Idea, Team, Notification } from '@/types';
import {
  UserStore, StudentStore, RecruiterStore, ProjectStore,
  IdeaStore, TeamStore, NotificationStore, markSeeded
} from './store';
import { hashPassword } from './security';

const now = () => new Date().toISOString();
const past = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

export async function seedDatabase(): Promise<void> {
  // Admin user
  const adminPw = await hashPassword('Admin@123');
  const adminUser: User = {
    id: 'admin-001', email: 'admin@ideaforge.dev', passwordHash: adminPw,
    role: 'admin', createdAt: past(120), updatedAt: past(1),
    isVerified: true, isBanned: false, lastLogin: now(),
  };
  UserStore.save(adminUser);

  // ── Students ────────────────────────────────────────────────────────────────
  const studentData = [
    { id: 's-001', name: 'Aryan Mehta', email: 'aryan@student.com', college: 'IIT Bombay', branch: 'CSE', year: 3, skills: ['React', 'Node.js', 'Python', 'ML'], domains: ['AI/ML', 'Web Dev'], github: 'https://github.com/aryanmehta', linkedin: 'https://linkedin.com/in/aryanmehta', bio: 'Building things that matter. Interested in AI and open source.', views: 1240, badges: ['first-project', 'top-innovator', 'consistent-builder'] as const },
    { id: 's-002', name: 'Priya Sharma', email: 'priya@student.com', college: 'NIT Trichy', branch: 'ECE', year: 2, skills: ['Flutter', 'Firebase', 'UI/UX', 'Figma'], domains: ['Mobile', 'Healthcare'], github: 'https://github.com/priyasharma', linkedin: 'https://linkedin.com/in/priyasharma', bio: 'Designer who codes. Making healthcare apps more human.', views: 890, badges: ['first-project', 'community-star'] as const },
    { id: 's-003', name: 'Karan Patel', email: 'karan@student.com', college: 'BITS Pilani', branch: 'CS', year: 4, skills: ['Go', 'Kubernetes', 'AWS', 'Docker'], domains: ['DevOps', 'Cloud'], github: 'https://github.com/karanpatel', linkedin: 'https://linkedin.com/in/karanpatel', bio: 'Infrastructure nerd. Love making systems that scale.', views: 2100, badges: ['first-project', 'top-innovator', 'early-adopter'] as const },
    { id: 's-004', name: 'Sneha Verma', email: 'sneha@student.com', college: 'DTU Delhi', branch: 'IT', year: 3, skills: ['Blockchain', 'Solidity', 'React', 'Web3'], domains: ['Fintech', 'Blockchain'], github: 'https://github.com/snehaverma', linkedin: 'https://linkedin.com/in/snehaverma', bio: 'Web3 builder exploring DeFi and digital identity.', views: 670, badges: ['first-project', 'idea-champion'] as const },
    { id: 's-005', name: 'Rahul Singh', email: 'rahul@student.com', college: 'IIT Delhi', branch: 'CSE', year: 2, skills: ['Python', 'TensorFlow', 'Data Science', 'SQL'], domains: ['AI/ML', 'EdTech'], github: 'https://github.com/rahulsingh', linkedin: 'https://linkedin.com/in/rahulsingh', bio: 'Data person. Working on making education personalized.', views: 420, badges: ['first-project'] as const },
    { id: 's-006', name: 'Ananya Roy', email: 'ananya@student.com', college: 'VIT Vellore', branch: 'CSE', year: 3, skills: ['Django', 'PostgreSQL', 'Redis', 'Celery'], domains: ['SaaS', 'Productivity'], github: 'https://github.com/ananyaroy', linkedin: 'https://linkedin.com/in/ananyaroy', bio: 'Backend engineer who likes clean APIs and good docs.', views: 580, badges: ['first-project', 'consistent-builder'] as const },
    { id: 's-007', name: 'Dev Kumar', email: 'dev@student.com', college: 'IIIT Hyderabad', branch: 'CS', year: 4, skills: ['React Native', 'TypeScript', 'GraphQL', 'MongoDB'], domains: ['Mobile', 'Social'], github: 'https://github.com/devkumar', linkedin: 'https://linkedin.com/in/devkumar', bio: 'Full stack developer building social tools.', views: 340, badges: ['first-project', 'team-player'] as const },
    { id: 's-008', name: 'Ishita Jain', email: 'ishita@student.com', college: 'Manipal University', branch: 'IT', year: 2, skills: ['Vue.js', 'Python', 'FastAPI', 'ML'], domains: ['Healthcare', 'AI/ML'], github: 'https://github.com/ishitajain', linkedin: 'https://linkedin.com/in/ishitajain', bio: "Using AI to fix healthcare's data problem.", views: 760, badges: ['first-project', 'idea-champion'] as const },
    { id: 's-009', name: 'Harsh Agarwal', email: 'harsh@student.com', college: 'IIIT Bangalore', branch: 'CSE', year: 3, skills: ['Rust', 'C++', 'Embedded', 'IoT'], domains: ['IoT', 'Hardware'], github: 'https://github.com/harshagarwal', linkedin: 'https://linkedin.com/in/harshagarwal', bio: 'Hardware hacker. Making things blink and connect.', views: 290, badges: ['first-project'] as const },
    { id: 's-010', name: 'Pooja Nair', email: 'pooja@student.com', college: 'Anna University', branch: 'ECE', year: 3, skills: ['React', 'Node.js', 'AR/VR', 'Three.js'], domains: ['AR/VR', 'EdTech'], github: 'https://github.com/poojanair', linkedin: 'https://linkedin.com/in/poojanair', bio: 'XR developer making learning more immersive.', views: 510, badges: ['first-project', 'trending-builder'] as const },
    { id: 's-011', name: 'Vikram Reddy', email: 'vikram@student.com', college: 'IIT Madras', branch: 'CSE', year: 4, skills: ['Kafka', 'Spark', 'Python', 'Airflow'], domains: ['Data Engineering', 'Analytics'], github: 'https://github.com/vikramreddy', linkedin: 'https://linkedin.com/in/vikramreddy', bio: 'Data engineer who loves pipelines almost as much as coffee.', views: 1090, badges: ['first-project', 'top-innovator'] as const },
    { id: 's-012', name: 'Meera Krishnan', email: 'meera@student.com', college: 'PSG Tech', branch: 'IT', year: 2, skills: ['Cybersecurity', 'Python', 'Networking', 'CTF'], domains: ['Security', 'Infrastructure'], github: 'https://github.com/meerakrishnan', linkedin: 'https://linkedin.com/in/meerakrishnan', bio: 'CTF player and security researcher. Making things harder to break.', views: 380, badges: ['first-project', 'community-star'] as const },
  ];

  for (const s of studentData) {
    const pw = await hashPassword('Student@123');
    const user: User = {
      id: s.id, email: s.email, passwordHash: pw, role: 'student',
      createdAt: past(90), updatedAt: past(5), isVerified: true, isBanned: false, lastLogin: past(1),
    };
    UserStore.save(user);

    const profile: StudentProfile = {
      userId: s.id, name: s.name,
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=6366f1&textColor=ffffff`,
      banner: '', bio: s.bio, college: s.college, branch: s.branch, year: s.year,
      skills: s.skills, domains: s.domains, github: s.github, linkedin: s.linkedin,
      portfolio: '', resume: '', certificates: [], achievements: [],
      badges: [...s.badges] as StudentProfile['badges'],
      followers: [], following: [], bookmarks: [], profileViews: s.views,
      isProfileComplete: true, agreeToTerms: true,
    };
    StudentStore.save(profile);
  }

  // ── Recruiters ─────────────────────────────────────────────────────────────
  const recruiterData = [
    { id: 'r-001', name: 'Neha Kapoor', email: 'neha@razorpay.com', company: 'Razorpay', industry: 'Fintech', role: 'Engineering Recruiter', interests: ['Full Stack', 'Backend', 'DevOps'] },
    { id: 'r-002', name: 'Sanjay Rao', email: 'sanjay@flipkart.com', company: 'Flipkart', industry: 'E-Commerce', role: 'Senior Talent Acquisition', interests: ['ML/AI', 'Data Engineering', 'Mobile'] },
    { id: 'r-003', name: 'Tanya Mehrotra', email: 'tanya@cred.club', company: 'CRED', industry: 'Fintech', role: 'Tech Recruiter', interests: ['iOS', 'Android', 'Design Engineering'] },
    { id: 'r-004', name: 'Aditya Shukla', email: 'aditya@meesho.com', company: 'Meesho', industry: 'Social Commerce', role: 'Campus Hiring Lead', interests: ['Frontend', 'React', 'Web Dev'] },
  ];

  for (const r of recruiterData) {
    const pw = await hashPassword('Recruiter@123');
    const user: User = {
      id: r.id, email: r.email, passwordHash: pw, role: 'recruiter',
      createdAt: past(60), updatedAt: past(3), isVerified: true, isBanned: false, lastLogin: past(2),
    };
    UserStore.save(user);

    const profile: RecruiterProfile = {
      userId: r.id, name: r.name, company: r.company,
      logo: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(r.company)}&backgroundColor=18181b&textColor=ffffff`,
      industry: r.industry, role: r.role, hiringInterests: r.interests,
      description: `${r.company} is hiring top engineering talent from campuses across India.`,
      website: `https://${r.company.toLowerCase().replace(' ', '')}.com`,
      linkedin: `https://linkedin.com/company/${r.company.toLowerCase()}`,
      savedCandidates: ['s-001', 's-003'], shortlisted: ['s-001'], contactedStudents: [],
    };
    RecruiterStore.save(profile);
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  const projects: Project[] = [
    {
      id: 'p-001', authorId: 's-001', title: 'MedAssist AI', tagline: 'AI triage assistant for rural clinics',
      summary: 'A lightweight AI model + mobile app that helps rural healthcare workers triage patients without a doctor present.',
      description: 'MedAssist AI uses a fine-tuned BERT model to analyze symptoms described in regional languages and recommend urgency levels, medication suggestions, and whether a patient needs transfer to a city hospital.',
      problemStatement: 'Rural clinics in India see 300M+ patients/year with acute doctor shortages. A single PHC doctor handles 150+ patients daily with no decision support.',
      solution: 'BERT-based NLP model trained on 50K+ clinical notes. Mobile app works offline. Supports Hindi and Telugu.',
      impact: 'Piloted in 3 PHCs in Rajasthan. Reduced missed critical cases by 34% in pilot.',
      techStack: ['Python', 'HuggingFace', 'Flutter', 'FastAPI', 'Firebase'],
      category: 'AI/ML', domain: 'Healthcare', sdgMapping: ['SDG 3 - Good Health'],
      teamMembers: [{ userId: 's-001', name: 'Aryan Mehta', role: 'Lead Developer', avatar: '' }, { userId: 's-008', name: 'Ishita Jain', role: 'ML Engineer', avatar: '' }],
      githubLink: 'https://github.com/aryanmehta/medassist-ai', liveDemo: 'https://medassist-demo.vercel.app',
      demoVideo: 'https://youtube.com/watch?v=demo1', pptLink: '', screenshots: [],
      attachments: [], buildStatus: 'Deployed', challengesFaced: 'Getting quality labeled clinical data in regional languages was extremely hard.',
      learnings: 'Data quality matters 10x more than model choice for clinical NLP.',
      futureScope: 'Expand to 5 more regional languages and integrate with Ayushman Bharat.',
      tags: ['AI', 'Healthcare', 'NLP', 'Flutter', 'Rural'], visibility: 'public', status: 'published',
      moderationStatus: 'featured', isFeatured: true, views: 2840, likes: ['s-002', 's-003', 's-005', 'r-001', 'r-002'],
      bookmarks: ['s-002', 'r-001'], comments: [], version: 2,
      versionHistory: [{ version: 1, savedAt: past(30), summary: 'Initial submission' }, { version: 2, savedAt: past(10), summary: 'Added offline support and pilot results' }],
      createdAt: past(45), updatedAt: past(10),
    },
    {
      id: 'p-002', authorId: 's-003', title: 'CloudTrace', tagline: 'Distributed tracing for Kubernetes microservices',
      summary: 'Drop-in observability layer for K8s workloads. One Helm chart install gives you traces, metrics, and alerts.',
      description: 'CloudTrace auto-instruments services using eBPF without code changes. It correlates traces across services, surfaces P95 latency by endpoint, and sends alerts when anomalies appear.',
      problemStatement: 'Most engineering teams know something is slow. Finding which service and which code path takes 2+ hours on average.',
      solution: 'eBPF-based instrumentation means zero code changes. Trace correlation across 50+ services in under 100ms.',
      impact: 'Reduced MTTR from 2h to 12min in our own infra. Used by 3 side projects at BITS.',
      techStack: ['Go', 'eBPF', 'Prometheus', 'Grafana', 'Kubernetes', 'Helm'],
      category: 'DevOps', domain: 'Cloud', sdgMapping: [],
      teamMembers: [{ userId: 's-003', name: 'Karan Patel', role: 'Lead', avatar: '' }],
      githubLink: 'https://github.com/karanpatel/cloudtrace', liveDemo: '',
      demoVideo: 'https://youtube.com/watch?v=demo2', pptLink: '',
      screenshots: [], attachments: [], buildStatus: 'Open Source Beta',
      challengesFaced: 'eBPF verifier rejects programs that are too complex — had to aggressively simplify loop structures.',
      learnings: 'Linux kernel internals are deep. Reading the source is the only reliable documentation.',
      futureScope: 'Add LLM-powered root cause suggestions.',
      tags: ['DevOps', 'eBPF', 'Kubernetes', 'Monitoring', 'Go'], visibility: 'public', status: 'published',
      moderationStatus: 'featured', isFeatured: true, views: 3400, likes: ['s-001', 's-006', 'r-002'],
      bookmarks: ['r-002', 's-001'], comments: [], version: 1,
      versionHistory: [{ version: 1, savedAt: past(20), summary: 'First release' }],
      createdAt: past(35), updatedAt: past(8),
    },
    {
      id: 'p-003', authorId: 's-004', title: 'CredVault', tagline: 'Self-sovereign academic credential verification on Polygon',
      summary: 'Students own their degrees on-chain. Employers verify in 10 seconds without calling the university.',
      description: 'CredVault stores certificate hashes on Polygon PoS. Universities sign them with their private key. Employers verify via QR code — no middleman, no email chains, no 4-week wait.',
      problemStatement: "Degree verification takes weeks. Employers can't trust digital copies. 12% of Indian job applicants submit fake certificates (KPMG 2023).",
      solution: 'Polygon smart contract + university signing portal + employer verification app. Gas fees under ₹2 per certificate.',
      impact: 'POC with 1 college, 200 certificates issued.',
      techStack: ['Solidity', 'Polygon', 'React', 'Ethers.js', 'IPFS', 'Node.js'],
      category: 'Blockchain', domain: 'Fintech', sdgMapping: ['SDG 4 - Quality Education'],
      teamMembers: [{ userId: 's-004', name: 'Sneha Verma', role: 'Lead', avatar: '' }, { userId: 's-007', name: 'Dev Kumar', role: 'Frontend', avatar: '' }],
      githubLink: 'https://github.com/snehaverma/credvault', liveDemo: 'https://credvault.vercel.app',
      demoVideo: '', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'POC Complete', challengesFaced: 'Getting a real college to sign an MOU for the POC was harder than the technical work.',
      learnings: 'On-chain storage is expensive; hashes + IPFS is the right architecture.',
      futureScope: 'Integrate with DigiLocker. Expand to skill certifications.',
      tags: ['Blockchain', 'Polygon', 'Web3', 'EdTech', 'Credentials'], visibility: 'public', status: 'published',
      moderationStatus: 'approved', isFeatured: false, views: 1820, likes: ['s-001', 's-005', 'r-004'],
      bookmarks: ['s-005'], comments: [], version: 1,
      versionHistory: [{ version: 1, savedAt: past(15), summary: 'POC submission' }],
      createdAt: past(25), updatedAt: past(5),
    },
    {
      id: 'p-004', authorId: 's-005', title: 'StudyLoop', tagline: 'AI-personalized spaced repetition for GATE prep',
      summary: 'Analyzes your weak topics from mock tests and builds a daily revision schedule that adapts as you improve.',
      description: 'StudyLoop connects to your mock test history, identifies concepts where you lose marks, and generates a spaced-repetition schedule with 20-minute daily sessions. The more you use it, the better it predicts what you\'ll forget.',
      problemStatement: 'GATE aspirants waste 40% of study time re-reading material they already know. Weak concepts remain weak.',
      solution: 'SM-2 algorithm + ML-based concept difficulty modeling. Integrates with PYQ databases.',
      impact: '87 beta users. Average score improvement of 18 percentile points in 3 months.',
      techStack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'scikit-learn'],
      category: 'EdTech', domain: 'AI/ML', sdgMapping: ['SDG 4 - Quality Education'],
      teamMembers: [{ userId: 's-005', name: 'Rahul Singh', role: 'Lead', avatar: '' }],
      githubLink: 'https://github.com/rahulsingh/studyloop', liveDemo: 'https://studyloop.in',
      demoVideo: '', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'Live (Beta)', challengesFaced: 'Building a PYQ database without copyright issues — ended up scraping official GATE archives.',
      learnings: 'Spaced repetition works. The challenge is getting users to trust the algorithm over their gut.',
      futureScope: 'Add JEE and UPSC tracks.',
      tags: ['EdTech', 'AI', 'GATE', 'Spaced Repetition', 'Python'], visibility: 'public', status: 'published',
      moderationStatus: 'approved', isFeatured: false, views: 940, likes: ['s-001', 's-002'],
      bookmarks: ['s-002', 's-008'], comments: [], version: 2,
      versionHistory: [{ version: 1, savedAt: past(40), summary: 'Initial version' }, { version: 2, savedAt: past(12), summary: 'Added ML scheduling' }],
      createdAt: past(50), updatedAt: past(12),
    },
    {
      id: 'p-005', authorId: 's-006', title: 'Fieldr', tagline: 'Field sales CRM for solo founders — no Salesforce tax',
      summary: 'Lightweight CRM with WhatsApp integration, geo-tagged visits, and a daily briefing. Designed for founders who do their own sales.',
      description: 'Fieldr lets you log calls, visits, and follow-ups from your phone in under 30 seconds. WhatsApp chat sync pulls context automatically. Daily 7am briefing tells you exactly who to call today.',
      problemStatement: 'Salesforce and Zoho are built for large sales teams. Solo founders and small teams end up using spreadsheets and losing deals.',
      solution: 'Minimal input (voice note → auto-transcribed into CRM), WhatsApp sync, geo-tagged visit log.',
      impact: '43 paid users after 2 months. MRR: ₹19,000.',
      techStack: ['Django', 'PostgreSQL', 'Redis', 'Celery', 'Twilio', 'React'],
      category: 'SaaS', domain: 'Productivity', sdgMapping: [],
      teamMembers: [{ userId: 's-006', name: 'Ananya Roy', role: 'Founder', avatar: '' }],
      githubLink: '', liveDemo: 'https://fieldr.in',
      demoVideo: 'https://youtube.com/watch?v=demo5', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'Live - Paid Product', challengesFaced: 'WhatsApp Business API approval took 6 weeks.',
      learnings: 'Talk to customers weekly. First 3 customers found through LinkedIn DMs.',
      futureScope: 'Add pipeline analytics and team features.',
      tags: ['SaaS', 'CRM', 'Django', 'B2B', 'Solo Founder'], visibility: 'public', status: 'published',
      moderationStatus: 'featured', isFeatured: true, views: 2100, likes: ['s-001', 's-003', 's-007', 'r-001', 'r-003'],
      bookmarks: ['r-003', 's-009'], comments: [], version: 3,
      versionHistory: [{ version: 1, savedAt: past(60), summary: 'MVP' }, { version: 2, savedAt: past(30), summary: 'WhatsApp integration' }, { version: 3, savedAt: past(7), summary: 'Added daily briefing' }],
      createdAt: past(70), updatedAt: past(7),
    },
    {
      id: 'p-006', authorId: 's-009', title: 'AirMesh', tagline: 'LoRa-based emergency mesh network for disaster zones',
      summary: 'When cell towers go down, first responders need to communicate. AirMesh runs a text mesh over LoRa at 5km range, no internet needed.',
      description: 'Custom firmware on Heltec LoRa boards creates a self-healing mesh. Works at 5km range in open terrain, 1.5km in urban. Android app connects over BLE. Battery lasts 48h.',
      problemStatement: 'During the 2023 Uttarakhand floods, rescue communication failed for 36h because all cell towers were down.',
      solution: 'LoRa + mesh routing protocol + BLE-to-app bridge. Hardware cost: ₹2400 per node.',
      impact: 'Demonstrated to NDRF team. Field tests at IIT Bombay campus.',
      techStack: ['C++', 'ESP-IDF', 'LoRa', 'Kotlin', 'BLE', 'Meshtastic Protocol'],
      category: 'IoT', domain: 'Hardware', sdgMapping: ['SDG 11 - Sustainable Cities', 'SDG 13 - Climate Action'],
      teamMembers: [{ userId: 's-009', name: 'Harsh Agarwal', role: 'Lead', avatar: '' }, { userId: 's-001', name: 'Aryan Mehta', role: 'App Developer', avatar: '' }],
      githubLink: 'https://github.com/harshagarwal/airmesh', liveDemo: '',
      demoVideo: 'https://youtube.com/watch?v=demo6', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'Prototype Tested', challengesFaced: 'LoRa frequency regulations differ by country. India allows 865-867MHz with restrictions.',
      learnings: 'Hardware timelines are always 3x longer than you estimate.',
      futureScope: 'Solar charging, GPS integration, government partnership.',
      tags: ['IoT', 'LoRa', 'Disaster Tech', 'Embedded', 'Hardware'], visibility: 'admin-only', status: 'published',
      moderationStatus: 'approved', isFeatured: false, views: 420, likes: ['s-001', 'r-002'],
      bookmarks: [], comments: [], version: 1,
      versionHistory: [{ version: 1, savedAt: past(18), summary: 'Field test results added' }],
      createdAt: past(30), updatedAt: past(5),
    },
    {
      id: 'p-007', authorId: 's-010', title: 'HistoryLive', tagline: 'AR history textbook — point your phone, learn through scenes',
      summary: 'Scan any page in your NCERT history textbook. The scene comes alive in AR with primary sources, maps, and narrated timelines.',
      description: 'HistoryLive uses image recognition to detect textbook pages and overlays AR scenes using ARCore. Students can explore battles, trade routes, and civilizations in 3D. Narration by historians.',
      problemStatement: "History is taught as a list of dates. Students memorize for exams and forget in a week. The subject's potential for storytelling is wasted.",
      solution: 'ARCore + custom image recognition + 3D asset library with narration.',
      impact: 'Demoed to 200+ students at VIT. 91% said it made the subject more interesting.',
      techStack: ['Unity', 'ARCore', 'React Native', 'Three.js', 'Python', 'FastAPI'],
      category: 'AR/VR', domain: 'EdTech', sdgMapping: ['SDG 4 - Quality Education'],
      teamMembers: [{ userId: 's-010', name: 'Pooja Nair', role: 'Lead Developer', avatar: '' }, { userId: 's-005', name: 'Rahul Singh', role: 'ML/CV', avatar: '' }],
      githubLink: 'https://github.com/poojanair/historylive', liveDemo: '',
      demoVideo: 'https://youtube.com/watch?v=demo7', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'Demo Build', challengesFaced: 'Creating accurate 3D historical scenes requires historians. Finding collaborators took 2 months.',
      learnings: 'Technical execution is 20% of the project. Content quality is everything.',
      futureScope: 'Expand to geography and science textbooks.',
      tags: ['AR', 'EdTech', 'Unity', 'NCERT', 'Mobile'], visibility: 'public', status: 'published',
      moderationStatus: 'approved', isFeatured: false, views: 1340, likes: ['s-002', 's-004', 's-006', 'r-004'],
      bookmarks: ['s-002', 'r-004'], comments: [], version: 1,
      versionHistory: [{ version: 1, savedAt: past(22), summary: 'Initial submission' }],
      createdAt: past(28), updatedAt: past(6),
    },
    {
      id: 'p-008', authorId: 's-011', title: 'PipelineIQ', tagline: 'Data quality monitoring for ETL pipelines — find dirty data before it hits prod',
      summary: 'Hooks into your Airflow/Spark DAGs and checks data quality at each stage. Sends alerts with row-level examples of the bad data.',
      description: 'PipelineIQ attaches Python decorators to DAG tasks. It runs statistical checks (nulls, schema drift, value distribution), stores results in a time-series DB, and displays trends. Alert includes sample bad rows so you know exactly what broke.',
      problemStatement: 'Data engineers spend 30% of their time debugging silent data quality failures. Prod dashboards show wrong numbers for days.',
      solution: 'Decorator-based instrumentation. Zero-config for Airflow. Statistical drift detection from day 1.',
      impact: 'Used in 2 data teams. Caught 14 data incidents before they hit prod dashboards.',
      techStack: ['Python', 'Apache Airflow', 'Apache Spark', 'TimescaleDB', 'Grafana', 'FastAPI'],
      category: 'Data Engineering', domain: 'Analytics', sdgMapping: [],
      teamMembers: [{ userId: 's-011', name: 'Vikram Reddy', role: 'Lead', avatar: '' }],
      githubLink: 'https://github.com/vikramreddy/pipelineiq', liveDemo: '',
      demoVideo: '', pptLink: '', screenshots: [], attachments: [],
      buildStatus: 'Used in Production', challengesFaced: 'Distributed tracing across Spark executors needs custom serialization.',
      learnings: 'Tools that save time paying for themselves. Real users came from one Tweet.',
      futureScope: 'Add dbt integration and anomaly detection ML.',
      tags: ['Data Engineering', 'Airflow', 'Python', 'Data Quality', 'DevOps'], visibility: 'public', status: 'published',
      moderationStatus: 'approved', isFeatured: false, views: 1760, likes: ['s-003', 's-006', 'r-002'],
      bookmarks: ['r-002'], comments: [], version: 2,
      versionHistory: [{ version: 1, savedAt: past(35), summary: 'Initial' }, { version: 2, savedAt: past(10), summary: 'Added Spark support' }],
      createdAt: past(45), updatedAt: past(10),
    },
  ];

  for (const p of projects) ProjectStore.save(p);

  // ── Ideas ──────────────────────────────────────────────────────────────────
  const ideas: Idea[] = [
    {
      id: 'i-001', authorId: 's-002', title: 'PillPal', summary: 'Smart pill dispenser that texts your family if you miss a dose',
      problem: 'Elderly patients miss 50%+ of their prescribed doses. Family members live far away and have no visibility.',
      solution: 'IoT pill dispenser with ESP32. Logs each compartment opening. Sends WhatsApp alert if dose missed after 1h window.',
      targetUsers: 'Elderly patients with chronic conditions, their families',
      impact: 'Could prevent 25% of hospital readmissions due to medication non-compliance.',
      feasibility: 'Hardware BOM under ₹800. WhatsApp integration via Twilio. 2 month build.',
      novelty: 'Existing dispensers cost ₹15,000+. This is ₹800 and has family alerts.',
      category: 'Healthcare', domain: 'IoT', sdgAlignment: ['SDG 3'],
      neededResources: ['ESP32 dev kits', 'WhatsApp Business API access', '3D printer for casing'],
      neededSkills: ['Embedded C', 'Android development'],
      stage: 'refined', risks: 'WhatsApp API approval is slow. Hardware requires FCC/BIS certification for commercial sale.',
      roadmap: 'Prototype → clinical validation pilot → manufacturing partner',
      visibility: 'public', status: 'published', moderationStatus: 'featured', isFeatured: true,
      views: 1240, likes: ['s-001', 's-003', 's-008'], bookmarks: ['s-003'], comments: [],
      tags: ['IoT', 'Healthcare', 'Elderly', 'ESP32'], version: 1, versionHistory: [{ version: 1, savedAt: past(20), summary: 'First draft' }],
      createdAt: past(25), updatedAt: past(5),
    },
    {
      id: 'i-002', authorId: 's-004', title: 'CollegeDAO', summary: 'Student body that allocates college welfare funds through on-chain voting',
      problem: "Student welfare funds in colleges are managed opaquely. Students don't know how ₹50L/year is spent.",
      solution: 'Each student gets governance tokens at enrollment. Proposals are submitted on-chain. Votes are tallied transparently. Funds release through multi-sig.',
      targetUsers: 'Engineering college students, student council members',
      impact: 'Full transparency on student fund allocation. Higher participation in governance.',
      feasibility: 'Smart contracts on Polygon = negligible gas. UI is standard Web3 app.',
      novelty: 'First DAO governance system designed specifically for college student bodies.',
      category: 'Blockchain', domain: 'Governance', sdgAlignment: ['SDG 16'],
      neededResources: ['College admin buy-in', 'Legal review'],
      neededSkills: ['Solidity', 'Next.js', 'Wagmi'], stage: 'raw',
      risks: 'Requires college administration approval. Legal status of token governance in India unclear.',
      roadmap: 'Legal research → college pilot → multi-college expansion',
      visibility: 'public', status: 'published', moderationStatus: 'approved', isFeatured: false,
      views: 680, likes: ['s-001', 's-007'], bookmarks: [], comments: [],
      tags: ['DAO', 'Blockchain', 'Governance', 'College', 'Web3'], version: 1, versionHistory: [{ version: 1, savedAt: past(12), summary: 'Initial idea' }],
      createdAt: past(14), updatedAt: past(2),
    },
    {
      id: 'i-003', authorId: 's-005', title: 'JobLetter', summary: 'AI that writes cover letters by reading the JD and your resume — not a template filler',
      problem: 'Cover letters are ignored when they are generic. Writing a good one for each job takes 45 minutes most people skip.',
      solution: 'Upload your resume + paste the JD. GPT-4o reads both and writes a cover letter that maps your experience to their actual requirements. You edit, not write from scratch.',
      targetUsers: 'Final-year students and freshers applying to 20+ jobs',
      impact: 'Save 40min/application. 3x more tailored letters → higher interview rate.',
      feasibility: 'OpenAI API + Next.js. MVP in 2 weeks.',
      novelty: 'Existing tools use templates. This does semantic matching between JD requirements and resume bullets.',
      category: 'AI/ML', domain: 'Productivity', sdgAlignment: [],
      neededResources: ['OpenAI API credits'],
      neededSkills: ['Next.js developer'], stage: 'prototype-ready',
      risks: 'OpenAI cost at scale. Users may over-rely on AI letters.',
      roadmap: 'Free tier → freemium → enterprise (bulk campus hiring)',
      visibility: 'public', status: 'published', moderationStatus: 'approved', isFeatured: false,
      views: 920, likes: ['s-002', 's-006', 's-010', 'r-001'], bookmarks: ['r-001', 's-002'], comments: [],
      tags: ['AI', 'Job Search', 'LLM', 'Students', 'Productivity'], version: 2, versionHistory: [{ version: 1, savedAt: past(18), summary: 'First version' }, { version: 2, savedAt: past(6), summary: 'Added JD parsing detail' }],
      createdAt: past(20), updatedAt: past(6),
    },
    {
      id: 'i-004', authorId: 's-012', title: 'PhishGuard Campus', summary: 'Phishing simulation + awareness training built for college students, not enterprises',
      problem: 'Enterprise security training (KnowBe4, Proofpoint) costs ₹5000/user. Colleges cannot afford it. Students fall for phishing at 3x the rate of working professionals.',
      solution: 'Run simulated phishing campaigns on campus email. Students who click get a 5-min micro-lesson. Admin sees click rates by hostel/department.',
      targetUsers: 'College IT administrators, cybersecurity clubs',
      impact: 'Reduce student phishing click rates from 32% to under 8% in 3 months (based on enterprise benchmarks).',
      feasibility: 'Email sending via SES. Landing pages on static hosting. Django admin panel.',
      novelty: 'Price point and college-specific targeting. Gamified with department leaderboards.',
      category: 'Cybersecurity', domain: 'Security', sdgAlignment: [],
      neededResources: ['AWS SES access', 'College IT buy-in'],
      neededSkills: ['Django developer'], stage: 'refined',
      risks: "Students may complain about fake phishing. Need clear consent from college IT.",
      roadmap: 'Single college pilot → open source release → paid hosting',
      visibility: 'admin-only', status: 'published', moderationStatus: 'approved', isFeatured: false,
      views: 340, likes: ['s-001', 's-006'], bookmarks: [], comments: [],
      tags: ['Security', 'Phishing', 'Cybersecurity', 'Campus', 'Django'], version: 1, versionHistory: [{ version: 1, savedAt: past(8), summary: 'Initial submission' }],
      createdAt: past(10), updatedAt: past(2),
    },
    {
      id: 'i-005', authorId: 's-007', title: 'LocalePay', summary: 'UPI-integrated offline payments for kirana stores using QR + SMS fallback',
      problem: 'Small kirana stores in Tier 3 cities lose 15-20% of potential digital payments because the internet drops mid-transaction.',
      solution: 'UPI deep link with SMS fallback. Payment confirmation sent via SMS if internet fails. Reconciliation happens when connectivity returns.',
      targetUsers: 'Kirana store owners in Tier 2/3 cities',
      impact: 'Reduce failed digital transactions by 70% for stores with unstable connectivity.',
      feasibility: 'UPI API + Twilio SMS. Existing QR infrastructure reused.',
      novelty: 'No existing UPI solution handles offline gracefully without expensive hardware.',
      category: 'Fintech', domain: 'Payments', sdgAlignment: ['SDG 10'],
      neededResources: ['UPI API access', 'Twilio credits', 'Field testing in Tier 3'],
      neededSkills: ['Android developer for merchant app'], stage: 'raw',
      risks: 'RBI regulations around offline UPI are strict. Need NPCI approval.',
      roadmap: 'Regulatory research → pilot with 10 stores → NPCI submission',
      visibility: 'public', status: 'published', moderationStatus: 'approved', isFeatured: false,
      views: 540, likes: ['s-004', 's-011', 'r-001'], bookmarks: ['s-004'], comments: [],
      tags: ['Fintech', 'UPI', 'Payments', 'Kirana', 'Offline'], version: 1, versionHistory: [{ version: 1, savedAt: past(15), summary: 'Initial idea' }],
      createdAt: past(16), updatedAt: past(3),
    },
  ];

  for (const i of ideas) IdeaStore.save(i);

  // ── Teams ──────────────────────────────────────────────────────────────────
  const teams: Team[] = [
    {
      id: 't-001', name: 'Byte Builders', description: 'We build production-ready side projects, not hackathon demos.',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=BB&backgroundColor=6366f1&textColor=ffffff',
      leaderId: 's-001',
      members: [
        { userId: 's-001', role: 'leader', joinedAt: past(50) },
        { userId: 's-008', role: 'developer', joinedAt: past(45) },
        { userId: 's-009', role: 'developer', joinedAt: past(40) },
      ],
      projectIds: ['p-001', 'p-006'], ideaIds: ['i-001'],
      skills: ['React', 'Python', 'ML', 'Embedded', 'FastAPI'],
      lookingFor: ['UI/UX Designer', 'DevOps Engineer'],
      isOpen: true, activity: [], createdAt: past(50),
    },
    {
      id: 't-002', name: 'Chain Gang', description: 'Web3 builders focused on real utility, not speculation.',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=CG&backgroundColor=8b5cf6&textColor=ffffff',
      leaderId: 's-004',
      members: [
        { userId: 's-004', role: 'leader', joinedAt: past(40) },
        { userId: 's-007', role: 'developer', joinedAt: past(35) },
      ],
      projectIds: ['p-003'], ideaIds: ['i-002'],
      skills: ['Solidity', 'React', 'Ethereum', 'TypeScript'],
      lookingFor: ['Smart Contract Auditor', 'Frontend Developer'],
      isOpen: true, activity: [], createdAt: past(40),
    },
    {
      id: 't-003', name: 'DataForge', description: 'Data engineering and ML infrastructure projects.',
      avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=DF&backgroundColor=0ea5e9&textColor=ffffff',
      leaderId: 's-011',
      members: [
        { userId: 's-011', role: 'leader', joinedAt: past(45) },
        { userId: 's-005', role: 'developer', joinedAt: past(42) },
      ],
      projectIds: ['p-008', 'p-004'], ideaIds: [],
      skills: ['Python', 'Spark', 'Airflow', 'ML', 'PostgreSQL'],
      lookingFor: ['ML Engineer', 'Data Visualization'],
      isOpen: false, activity: [], createdAt: past(45),
    },
  ];

  for (const t of teams) TeamStore.save(t);

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifications: Notification[] = [
    { id: 'n-001', userId: 's-001', type: 'like', message: 'Priya Sharma liked your project MedAssist AI', link: '/project/p-001', isRead: false, createdAt: past(1) },
    { id: 'n-002', userId: 's-001', type: 'follow', message: 'Karan Patel started following you', link: '/profile/s-003', isRead: false, createdAt: past(2) },
    { id: 'n-003', userId: 's-001', type: 'bookmark', message: 'A recruiter bookmarked your profile', link: '/dashboard', isRead: true, createdAt: past(3) },
    { id: 'n-004', userId: 's-003', type: 'like', message: 'Ananya Roy liked your project CloudTrace', link: '/project/p-002', isRead: false, createdAt: past(1) },
    { id: 'n-005', userId: 's-006', type: 'like', message: '5 people liked your project Fieldr', link: '/project/p-005', isRead: false, createdAt: past(1) },
  ];
  for (const n of notifications) NotificationStore.save(n);

  markSeeded();
}
