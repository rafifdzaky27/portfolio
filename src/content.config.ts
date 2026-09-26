import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    kicker: z.string(),
    summary: z.string(),
    order: z.number(),
    context: z.string(),
    period: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    glance: z.array(z.object({ k: z.string(), v: z.string() })),
  }),
});

export const collections = { work };
