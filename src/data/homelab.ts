// Homelab evidence states. Only move an item to 'live' or 'partial' when Rafif
// supplies a concrete configuration or troubleshooting fact for it.

export type State = 'live' | 'partial' | 'planned';

export const stateLabel: Record<State, string> = {
  live: 'Running',
  partial: 'Partial',
  planned: 'Planned',
};

export interface LabItem {
  id: string;
  name: string;
  state: State;
  summary: string;
}

// What exists today (roadmap P01–P05 plus the Ansible workflow).
export const builtNow: LabItem[] = [
  {
    id: 'site',
    name: 'This portfolio',
    state: 'live',
    summary: 'The site you are reading: a static Astro build, served from the lab instead of a hosting platform.',
  },
  {
    id: 'P01',
    name: 'Proxmox VE + Terraform VM provisioning',
    state: 'partial',
    summary:
      'Proxmox VE 9.x host with an Ubuntu VM template; VMs are provisioned through the Terraform Proxmox provider instead of the web UI.',
  },
  {
    id: '—',
    name: 'Ansible configuration from WSL',
    state: 'live',
    summary: 'Ansible runs from WSL on my workstation, using SSH keys and roles to configure the VMs Terraform creates.',
  },
  {
    id: 'P02',
    name: 'AdGuard Home — local DNS',
    state: 'partial',
    summary: 'AdGuard Home on a dedicated DNS VM provides local DNS resolution and filtering for the lab.',
  },
  {
    id: 'P03',
    name: 'Tailscale remote access',
    state: 'partial',
    summary: 'A Tailscale subnet router advertises the home LAN, so I can reach lab services remotely without opening inbound ports.',
  },
  {
    id: 'P04',
    name: 'Caddy reverse proxy & DNS',
    state: 'partial',
    summary: 'Caddy and DNS work in progress to put lab services behind friendly names. Internal TLS is not done yet.',
  },
  {
    id: 'P05',
    name: 'Jellyfin media servers',
    state: 'partial',
    summary: 'Jellyfin instances running as Docker workloads. The playbook’s full isolation model is not verified yet.',
  },
];

export interface Note {
  title: string;
  state: 'resolved' | 'investigating';
  symptom: string;
  cause: string;
  lesson: string;
}

export const notes: Note[] = [
  {
    title: 'AdGuard vs. systemd-resolved on port 53',
    state: 'resolved',
    symptom: 'AdGuard Home could not bind its DNS listener on port 53 on the Ubuntu VM.',
    cause: 'systemd-resolved already held port 53 with its local stub resolver.',
    lesson: 'Check what owns a port before blaming the new service. On Ubuntu the DNS port is taken by default.',
  },
  {
    title: 'Terraform → Proxmox returns HTTP 403',
    state: 'resolved',
    symptom: 'Terraform plans against the Proxmox API failed with HTTP 403.',
    cause: 'The Proxmox role assigned to the Terraform user lacked the privileges the provider needs to create and configure VMs.',
    lesson: 'A 403 is an authorization problem, not a network one. Give the automation user its own role with exactly the privileges it uses.',
  },
  {
    title: 'Docker permission denied after joining the group',
    state: 'resolved',
    symptom: 'Docker commands still failed with permission denied after adding my user to the docker group.',
    cause: 'Group membership is evaluated at login; the existing session did not have the new group.',
    lesson: 'Start a new login session (or use newgrp) after changing group membership.',
  },
  {
    title: 'Clients bypassing local DNS',
    state: 'investigating',
    symptom: 'Some devices appeared to resolve names without going through AdGuard.',
    cause: 'Investigating IPv6 DNS paths and encrypted DNS (DoH) as bypass routes.',
    lesson: 'Open. DNS filtering is only as strong as the paths a client is allowed to use.',
  },
];

export interface MapNode {
  name: string;
  id: string;
  state: State;
}

export interface MapZone {
  key: string;
  label: string;
  note?: string;
  nodes: MapNode[];
}

/** Target architecture: what runs today plus every planned module, by zone. */
export const labMap: { outside: MapZone[]; host: MapZone[]; offHost: MapZone[] } = {
  outside: [
    {
      key: 'ws',
      label: 'Workstation · WSL',
      nodes: [
        { name: 'Terraform', id: 'P01', state: 'partial' },
        { name: 'Ansible', id: '—', state: 'live' },
      ],
    },
    {
      key: 'remote',
      label: 'Remote access',
      nodes: [
        { name: 'Tailscale subnet router', id: 'P03', state: 'partial' },
        { name: 'WireGuard fallback', id: 'P03B', state: 'planned' },
        { name: 'Cloudflare Tunnel + Access', id: 'P18', state: 'planned' },
      ],
    },
    {
      key: 'edge',
      label: 'Network edge',
      nodes: [
        { name: 'AdGuard Home DNS', id: 'P02', state: 'partial' },
        { name: 'Pi-hole (2nd resolver)', id: 'P02B', state: 'planned' },
        { name: 'Caddy reverse proxy', id: 'P04', state: 'partial' },
        { name: 'OPNsense + VLANs', id: 'P16', state: 'planned' },
      ],
    },
  ],
  host: [
    {
      key: 'home',
      label: 'Home services',
      nodes: [
        { name: 'This portfolio (rafifdzaky.com)', id: 'site', state: 'live' },
        { name: 'Jellyfin', id: 'P05', state: 'partial' },
        { name: 'Seerr + Arr stack', id: 'P05B', state: 'planned' },
        { name: 'Nextcloud', id: 'P07', state: 'planned' },
        { name: 'Vaultwarden', id: 'P07B', state: 'planned' },
        { name: 'Immich', id: 'P08', state: 'planned' },
        { name: 'Home Assistant', id: 'P09', state: 'planned' },
        { name: 'Homepage dashboard', id: 'P09B', state: 'planned' },
      ],
    },
    {
      key: 'platform',
      label: 'Platform lab',
      nodes: [
        { name: 'Harbor + golden workload', id: 'P06', state: 'planned' },
        { name: 'Gitea + CI runner', id: 'P11', state: 'planned' },
        { name: 'Prometheus · Grafana · Loki', id: 'P10', state: 'planned' },
        { name: 'k3s × 3 VMs', id: 'P12', state: 'planned' },
        { name: 'Argo CD (GitOps)', id: 'P13', state: 'planned' },
        { name: 'Trivy · gitleaks · Vault', id: 'P15', state: 'planned' },
      ],
    },
    {
      key: 'sec',
      label: 'Security lab',
      note: 'runs at different times from k3s',
      nodes: [{ name: 'Active Directory + Kali', id: 'P17', state: 'planned' }],
    },
  ],
  offHost: [
    {
      key: 'off',
      label: 'Off the box',
      nodes: [
        { name: '3-2-1 backups + restore test', id: 'P14', state: 'planned' },
        { name: 'AWS bridge (one stack)', id: 'P19', state: 'planned' },
        { name: 'Incident Day drill', id: 'P20', state: 'planned' },
      ],
    },
  ],
};

export interface Phase {
  phase: string;
  items: { id: string; name: string; state: State; why: string }[];
}

// Curriculum order from the Homelab DevOps Playbook, not completion dates.
export const roadmap: Phase[] = [
  {
    phase: '0 · Engineering fundamentals',
    items: [
      { id: 'L00A', name: 'Linux under the hood', state: 'planned', why: 'Processes, signals, systemd, journals, filesystem diagnosis.' },
      { id: 'L00B', name: 'Bash and text processing', state: 'planned', why: 'Pipelines, parsing and basic scripting.' },
      { id: 'L00C', name: 'Git for infrastructure', state: 'planned', why: 'Versioned config, readable commits, rollback.' },
      { id: 'L00D', name: 'Networking fundamentals', state: 'planned', why: 'DNS, ports, routing, connectivity investigation.' },
      { id: 'L00E', name: 'Anatomy of one HTTP request', state: 'planned', why: 'Browser → DNS → proxy → app → response, traced end to end.' },
    ],
  },
  {
    phase: '1 · Foundations',
    items: [
      { id: 'P01', name: 'Proxmox + Terraform VM provisioning', state: 'partial', why: 'Repeatable VMs from code.' },
      { id: 'P02', name: 'AdGuard Home DNS filtering', state: 'partial', why: 'Local DNS and filtering.' },
      { id: 'P02B', name: 'Pi-hole as a second resolver', state: 'planned', why: 'What DNS redundancy actually requires.' },
      { id: 'P03', name: 'Tailscale remote access', state: 'partial', why: 'Reach the lab without inbound ports.' },
      { id: 'P03B', name: 'Manual WireGuard fallback', state: 'planned', why: 'An access path that does not depend on one vendor.' },
      { id: 'P04', name: 'Caddy reverse proxy, DNS, internal TLS', state: 'partial', why: 'Named services behind one proxy.' },
    ],
  },
  {
    phase: '2 · Applications & CI/CD',
    items: [
      { id: 'P05', name: 'Jellyfin private and shared servers', state: 'partial', why: 'Separate instances for separate audiences.' },
      { id: 'P05B', name: 'Request and media automation stack', state: 'planned', why: 'Controlled mounts and service-to-service auth.' },
      { id: 'P06', name: 'Golden workload + Harbor registry', state: 'planned', why: 'A reference app built into an image, scanned, and pushed to a private registry — the lab target for my containerized pipeline template.' },
      { id: 'P07', name: 'Nextcloud file service', state: 'planned', why: 'Storage and backup trade-offs.' },
      { id: 'P07B', name: 'Vaultwarden password manager', state: 'planned', why: 'Secrets handling for a personal service.' },
      { id: 'P08', name: 'Immich photo platform', state: 'planned', why: 'Resource and storage planning.' },
      { id: 'P09', name: 'Home Assistant + power monitoring', state: 'planned', why: 'Failure domains at home.' },
      { id: 'P09B', name: 'Homepage dashboard as config-as-code', state: 'planned', why: 'A service directory kept in Git.' },
    ],
  },
  {
    phase: '3 · Platform engineering',
    items: [
      { id: 'P10', name: 'Prometheus, Grafana, Loki', state: 'planned', why: 'Metrics, logs and alerting for the lab itself (separate from my work monitoring).' },
      { id: 'P11', name: 'Gitea + self-hosted CI runner', state: 'planned', why: 'Run the pipeline template end to end on infrastructure I control.' },
      { id: 'P12', name: 'Three-node k3s cluster', state: 'planned', why: 'Orchestration and failure tests. All nodes share one host, so no physical HA.' },
      { id: 'P13', name: 'GitOps with Argo CD', state: 'planned', why: 'Declarative deploys and drift reconciliation.' },
      { id: 'P14', name: '3-2-1 backups', state: 'planned', why: 'Backups only count once a restore has been tested.' },
    ],
  },
  {
    phase: '4 · Security',
    items: [
      { id: 'P15', name: 'DevSecOps pass: Trivy, gitleaks, Vault', state: 'planned', why: 'Scanning and secrets, and the difference between a scan and a gate.' },
      { id: 'P16', name: 'OPNsense + VLAN segmentation', state: 'planned', why: 'Network zones and firewall policy.' },
      { id: 'P17', name: 'Isolated AD + Kali lab (elective)', state: 'planned', why: 'Authorized security learning in an isolated environment.' },
      { id: 'P18', name: 'Public app via Cloudflare Tunnel + Access', state: 'planned', why: 'Publishing one service safely.' },
    ],
  },
  {
    phase: '5 · Real-world DevOps',
    items: [
      { id: 'P19', name: 'Cloud bridge: one stack to AWS', state: 'planned', why: 'A bounded AWS experiment.' },
      { id: 'P20', name: 'Incident Day', state: 'planned', why: 'Detection → diagnosis → recovery → postmortem, with real timestamps.' },
    ],
  },
  {
    phase: 'Optional',
    items: [{ id: 'P05C', name: 'Custom media portal', state: 'planned', why: 'A product experiment outside the core path.' }],
  },
];
