import type { APIRoute } from 'astro';
import { resumeText } from '../data/resume-text';

// Coloured résumé for terminals. Caddy serves this for `curl rafifdzaky.com`.
export const GET: APIRoute = () =>
  new Response(resumeText(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
