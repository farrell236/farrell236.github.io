import { z } from 'astro/zod';

/**
 * Stable data contract between user-owned content and the replaceable theme.
 * Visual-only releases must remain compatible with this version.
 */
export const supportedContentFormatVersion = 1 as const;

export function assertContentFormat(version: number) {
  if (version !== supportedContentFormatVersion) {
    throw new Error(
      `Unsupported content format ${version}; this theme supports format ${supportedContentFormatVersion}.`,
    );
  }
}

const requiredText = z.string().trim().min(1);
const link = z.object({
  label: requiredText,
  href: requiredText,
});

export const researchSchema = z.object({
  title: requiredText,
  shortTitle: requiredText,
  description: requiredText,
  field: requiredText,
  year: z.number().int().min(1900).max(2100),
  // Optional additive fields preserve compatibility with content format v1.
  period: requiredText.optional(),
  order: z.number().int().nonnegative(),
  selected: z.boolean().default(false),
  // A theme hint, not a content requirement. Unknown values use neutral artwork.
  illustration: requiredText.default('default'),
  links: z.array(link).default([]),
  leadPublications: z.array(requiredText).default([]),
  relatedPublications: z.array(requiredText).default([]),
});

export const publicationSchema = z.object({
  citationKey: requiredText,
  entryType: requiredText,
  title: requiredText,
  authors: z.array(requiredText).min(1),
  venue: requiredText,
  year: z.number().int().min(1900).max(2100),
  order: z.number().int().nonnegative(),
  selected: z.boolean().default(false),
  abstract: requiredText.optional(),
  links: z.array(link).default([]),
});

export const writingSchema = z.object({
  title: requiredText,
  description: requiredText,
  published: z.coerce.date(),
  category: requiredText,
  // When present, listing cards bypass the local article and open this URL.
  externalUrl: requiredText.optional(),
  draft: z.boolean().default(false),
  archived: z.boolean().default(false),
});
