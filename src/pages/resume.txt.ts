import type { APIRoute } from 'astro';
import { resumeText } from '../data/resume-text';

// The same résumé without colour codes, readable in a browser.
export const GET: APIRoute = () =>
  new Response(resumeText(false), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
