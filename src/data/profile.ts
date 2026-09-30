// Single source of public facts. Every line traces to the knowledge base,
// the résumé, or Rafif's messages. Keep it that way.
import certJwd from '../assets/certs/bnsp-junior-web-developer.jpg';
import certCsa from '../assets/certs/bnsp-system-analyst.jpg';
import certBest from '../assets/certs/icicos-best-presenter.jpg';
import certPresenter from '../assets/certs/icicos-presenter.jpg';
import certCisco from '../assets/certs/cisco-netacadriders-gold.jpg';

export const person = {
  name: 'Rafif Dzaky Daniswara',
  short: 'R. D. Daniswara',
  role: 'DevOps Engineer',
  employer: 'PT Pengembang Sistem Manajemen',
  employerShort: 'PT PSM',
  location: 'West Java, Indonesia',
  email: 'rafifdzaky27@gmail.com',
  phone: '+62 851-5689-1462',
  phoneHref: 'tel:+6285156891462',
  linkedin: 'https://www.linkedin.com/in/rafifdzaky',
  github: 'https://github.com/rafifdzaky27',
  resumePage: '/resume',
  resumePdf: '/Rafif_Dzaky_Daniswara_Resume.pdf',
  resumeFile: 'Rafif_Dzaky_Daniswara_Resume.pdf',
};

export { careerStart, devopsStart, monthsSince, formatDuration } from './time';

export type Context = 'professional' | 'freelance' | 'internship' | 'teaching';

export interface Role {
  title: string;
  org: string;
  place: string;
  period: string;
  context: Context;
  points: string[];
  link?: { href: string; label: string };
}

export const experience: Role[] = [
  {
    title: 'DevOps Engineer',
    org: 'PT Pengembang Sistem Manajemen',
    place: 'Jakarta',
    period: 'Jan 2026 – now',
    context: 'professional',
    points: [
      'Moved every one of 20+ production services off SSH-and-git-pull releases onto GitHub Actions pipelines. About 60% deploy fully automatically; production releases for the rest are dispatched and confirmed by me through the same pipeline.',
      'Under 2% of production deploy runs failed on core services, measured from GitHub Actions run history.',
      'Provision, scale and harden the Linode VPS fleet; manage domains, DNS and SSL certificates, access and IAM, secrets, backups and databases.',
      'Built Prometheus, Grafana and Uptime Kuma monitoring for CPU, memory, disk and availability, and handle incidents when it goes red.',
      'Wrote the deployment SOPs and workflow docs developers release with.',
    ],
    link: { href: '/work/ci-cd', label: 'CI/CD case study' },
  },
  {
    title: 'Full-stack Developer (Freelance)',
    org: 'PT Pengembang Sistem Manajemen',
    place: 'Jakarta',
    period: 'Feb – Jun 2025',
    context: 'freelance',
    points: [
      'Refactored the checkout flow in React.js and Node.js, moving participant data entry to the end to shorten the path to payment.',
      'Rebuilt the homepage hero to pull promotional content from upcoming training dates automatically, and built a keyword-driven broadcast funnel.',
    ],
  },
  {
    title: 'Software Developer Intern, IT Architecture & Governance',
    org: 'bank bjb',
    place: 'Bandung',
    period: 'Jun – Aug 2025',
    context: 'internship',
    points: [
      'Engineered and deployed 5+ backend microservices for the AGW platform during its move to a service-oriented architecture.',
      'Resolved 25+ critical bugs, and built frontend components that digitized paper-based approval and documentation workflows.',
    ],
  },
  {
    title: 'Practicum Assistant, Web Application Development',
    org: 'EAD Laboratory, Telkom University',
    place: 'Bandung',
    period: 'Feb – Jun 2025',
    context: 'teaching',
    points: [
      'Co-authored a Laravel module (MVC, databases, APIs) delivered to 400+ students.',
      'Ran the LMS practicum portal: 30+ materials and assignments, about 95% on time.',
    ],
  },
  {
    title: 'Full-stack Developer Intern',
    org: 'PT Pengembang Sistem Manajemen',
    place: 'Jakarta',
    period: 'Jan – Feb 2025',
    context: 'internship',
    points: [
      'Built a responsive lead-generation landing page and evaluated self-hosted LLMs (OpenAI, Ollama) on an Azure VPS for internal use.',
    ],
  },
];

/** What the DevOps job covers, grouped for the About section and the ops case. */
export const responsibilities = [
  { area: 'Delivery', items: ['GitHub Actions CI/CD', 'production release approvals', 'deployment SOPs'] },
  { area: 'Servers', items: ['Linode VPS provisioning & setup', 'scaling & capacity', 'Docker', 'OS patching'] },
  { area: 'Edge', items: ['domains & DNS', 'SSL/TLS certificates', 'Nginx / Apache / Caddy config'] },
  { area: 'Access & security', items: ['IAM & SSH access', 'server hardening (firewall, fail2ban, SSH)', 'secrets & .env management'] },
  { area: 'Data', items: ['PostgreSQL & MySQL administration', 'backups & restore'] },
  { area: 'Operations', items: ['monitoring & alerting', 'incident response', 'logs, cron & queue workers', 'cost & capacity'] },
];

export const skills = {
  work: {
    label: 'Used at work',
    note: 'production, as part of the DevOps team',
    groups: [
      { area: 'Delivery', items: ['GitHub Actions', 'pipeline templates', 'release SOPs'] },
      { area: 'Infrastructure', items: ['Linux', 'Linode VPS', 'Docker', 'PHP-FPM', 'Supervisor'] },
      { area: 'Edge & access', items: ['DNS', 'SSL/TLS', 'Nginx / Apache', 'IAM & SSH', 'firewalls'] },
      { area: 'Observability', items: ['Prometheus', 'Grafana', 'Uptime Kuma'] },
      { area: 'Data', items: ['PostgreSQL', 'MySQL', 'backups'] },
      { area: 'Application', items: ['Laravel', 'PHP', 'Node.js', 'React.js', 'Next.js'] },
    ],
  },
  lab: {
    label: 'Built in my homelab',
    note: 'personal, single host, not production',
    groups: [
      { area: 'Virtualization', items: ['Proxmox VE 9.x', 'Ubuntu VM templates'] },
      { area: 'IaC / automation', items: ['Terraform (Proxmox provider)', 'Ansible from WSL'] },
      { area: 'Network', items: ['AdGuard Home', 'Tailscale', 'Caddy'] },
      { area: 'Scripting', items: ['Bash', 'Python'] },
    ],
  },
  learning: {
    label: 'Currently learning',
    note: 'direction, not experience',
    groups: [
      { area: 'Orchestration', items: ['k3s / Kubernetes', 'GitOps (Argo CD)'] },
      { area: 'Cloud', items: ['AWS / GCP fundamentals'] },
      { area: 'Reliability', items: ['SRE practices', 'Loki', 'restore drills'] },
    ],
  },
};

export const education = {
  school: 'Telkom University',
  faculty: 'Faculty of Industrial Engineering',
  degree: 'Bachelor of Information Systems (S.Kom.)',
  gpa: '3.87 / 4.00',
  honours: 'Cum laude',
  years: '2022 – 2026',
  status: 'Degree requirements completed Aug 2026 · commencement Nov 2026',
};

export interface Credential {
  name: string;
  issuer: string;
  period: string;
  /** One or two sentences for the detail view on the home page, from the CV. */
  detail: string;
  link?: { href: string; label: string };
  image?: ImageMetadata;
  alt?: string;
}

export const credentials: Credential[] = [
  {
    name: 'Certified System Analyst (CSA)',
    issuer: 'BNSP',
    period: 'Nov 2025 – Nov 2028',
    detail: 'System Analyst certificate of competence from Badan Nasional Sertifikasi Profesi (BNSP). Valid November 2025 to November 2028.',
    image: certCsa,
    alt: 'BNSP certificate of competence, System Analyst, issued 27 November 2025 to Rafif Dzaky Daniswara. Certificate numbers blurred.',
  },
  {
    name: 'Junior Web Developer',
    issuer: 'BNSP',
    period: 'Jun 2025 – Jun 2028',
    detail: 'Junior Web Developer certificate of competence from Badan Nasional Sertifikasi Profesi (BNSP). Valid June 2025 to June 2028.',
    image: certJwd,
    alt: 'BNSP certificate of competence, Junior Web Developer, issued 23 June 2025 to Rafif Dzaky Daniswara. Certificate numbers blurred.',
  },
  {
    name: 'Best Presenter, ICICoS 2026',
    issuer: 'Universitas Diponegoro',
    period: 'Aug 2026',
    detail: 'Best Presenter at the 9th International Conference on Informatics and Computational Sciences (ICICoS 2026), Universitas Diponegoro. The talk presented my research on digital point-of-sale adoption among MSMEs, using UTAUT2 and PLS-SEM.',
    link: { href: '/research', label: 'The research' },
    image: certBest,
    alt: 'ICICoS 2026 certificate awarding Rafif Dzaky Daniswara Best Presenter in Room 8, Semarang, 12–13 August 2026. Certificate number blurred.',
  },
  {
    name: 'NetAcadRiders 2024 — Gold Certificate',
    issuer: 'Cisco Networking Academy (APJC)',
    period: 'Mar 2024',
    detail: 'Gold Certificate in NetAcadRiders 2024, a Cisco Networking Academy competition for the Asia Pacific, Japan and China region.',
    image: certCisco,
    alt: 'Cisco Networking Academy APJC NetAcadRiders Gold Certificate presented to Rafif Dzaky Daniswara for scoring gold in NetAcad Riders 2024, 26 March 2024.',
  },
];

export const presenterCert = {
  image: certPresenter,
  alt: 'ICICoS 2026 presenter certificate for the paper "Explaining Digital POS Adoption Among MSMEs: A Pilot Study Using UTAUT2". Certificate number blurred.',
};
