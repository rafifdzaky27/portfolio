// The résumé as terminal text: `curl -sL rafifdzaky.com` gets the coloured
// version (Caddy rewrites / to /cli.txt for curl, wget and HTTPie), and
// /resume.txt is the same text without colour codes.
import { person, experience, skills, education, credentials } from './profile';
import { careerStart, devopsStart, monthsSince, formatDuration } from './time';
import { build } from './build';

const W = 76;
const esc = (code: string) => `\x1b[${code}m`;

export function resumeText(color: boolean) {
  const c = (code: string, s: string) => (color ? esc(code) + s + esc('0') : s);
  const bold = (s: string) => c('1', s);
  const teal = (s: string) => c('36', s);
  const dim = (s: string) => c('2', s);
  const green = (s: string) => c('32', s);

  const wrap = (text: string, indent: string) => {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
      if ((indent + line + ' ' + word).trim().length > W && line) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
    return lines.map((l, i) => (i ? indent : '') + l).join('\n');
  };

  const cmd = (s: string) => `\n${teal('$')} ${bold(s)}`;
  const title = `${person.name.toUpperCase()}  ·  ${person.role}`;
  const bar = '─'.repeat(title.length + 4);
  const out: string[] = [];

  out.push(
    '',
    teal(`  ┌${bar}┐`),
    `${teal('  │')}  ${bold(title)}  ${teal('│')}`,
    teal(`  └${bar}┘`),
    `  ${person.location} · ${person.email} · ${person.phone}`,
    `  ${dim(`${formatDuration(monthsSince(careerStart))} in software, ${formatDuration(monthsSince(devopsStart))} in DevOps`)}`,
  );

  out.push(
    cmd('whoami'),
    wrap(
      `DevOps Engineer at ${person.employer}. I look after everything after a merge for 20+ production services: CI/CD pipelines, Linux VPS operations, domains, DNS and SSL, access, monitoring and incident response.`,
      '',
    ),
  );

  out.push(cmd('cat experience.log'));
  for (const r of experience) {
    out.push(`${green('▸')} ${bold(r.title)} ${dim('@')} ${r.org} ${dim(`(${r.period})`)}`);
    for (const p of r.points) out.push(`  • ${wrap(p, '    ')}`);
    out.push('');
  }

  out.push(cmd('cat skills.yml'));
  for (const g of [skills.work, skills.lab, skills.learning]) {
    out.push(`${teal(g.label.toLowerCase().replace(/ /g, '_'))}:  ${dim(`# ${g.note}`)}`);
    for (const a of g.groups) out.push(`  ${a.area.toLowerCase()}: ${wrap(a.items.join(', '), '    ')}`);
  }

  out.push(
    cmd('cat education'),
    `${bold(education.degree)}, ${education.school}`,
    `GPA ${education.gpa} · ${education.honours} · ${education.years}`,
    dim(education.status),
  );

  out.push(cmd('ls certs/'));
  for (const cr of credentials) out.push(`${cr.name} ${dim(`· ${cr.issuer} · ${cr.period}`)}`);

  out.push(
    cmd('cat links'),
    `site      https://rafifdzaky.com`,
    `resume    https://rafifdzaky.com${person.resumePdf}`,
    `github    ${person.github}`,
    `linkedin  ${person.linkedin}`,
  );

  out.push(
    '',
    dim(`# served from my homelab: Cloudflare → Tunnel → Caddy. release ${build.sha}, built ${build.builtAt.slice(0, 16).replace('T', ' ')} UTC`),
    `${green('✓')} hiring? ${bold(`mail ${person.email}`)}`,
    '',
  );

  return out.join('\n');
}
