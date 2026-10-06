/**
 * Primary editing surface for identity, navigation and launch state.
 * Page copy lives in src/data/pages.ts; repeatable content lives in
 * src/content/ and public/citations/*.bib.
 */

export type Link = {
  label: string;
  href: string;
};

// User content using this version remains compatible with visual-only updates.
export const contentFormatVersion = 1 as const;

export const site = {
  name: 'Benjamin Hou',
  language: 'en',
};

export const profile = {
  name: 'Benjamin Hou',
  discipline: 'Medical Image Analysis · Natural Language Processing · Clinical Translation',
  introduction: 'Research Fellow in Artificial Intelligence for Bioinformatics, Division of Intramural Research, National Library of Medicine, National Institutes of Health.',
  email: 'farrell236@outlook.com',
  portrait: '/images/benjamin-hou.jpg',
  portraitAlt: 'Portrait of Benjamin Hou',
  cv: '/files/benjamin-hou-cv.pdf',
  orcid: 'https://orcid.org/0000-0003-3968-1707',
  links: [
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=_c3RvvQAAAAJ' },
    { label: 'GitHub', href: 'https://github.com/farrell236' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/farrell236' },
    { label: 'Hugging Face', href: 'https://huggingface.co/farrell236' },
    { label: 'Instagram', href: 'https://www.instagram.com/farrell.236' },
    { label: 'X', href: 'https://x.com/farrell192' },
  ] satisfies Link[],
};

export const navigation = [
  { label: 'Research', href: '/research/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Academic', href: '/academic/' },
  { label: 'Musings', href: '/writing/' },
  { label: 'About', href: '/about/' },
] satisfies Link[];

// Leave preview mode on until the finished site is ready for search engines.
export const isPreview = import.meta.env.PUBLIC_IS_PREVIEW !== 'false';

// Personalised profile content enables Person structured data on the homepage.
export const demoContent = false;
