import { getCollection } from 'astro:content';
import { profile } from '../config';
import { researchEntries, researchThemes } from '../data/research';

/** Centralised collection filters keep ordering identical on every page. */
export async function getResearchProjects(selectedOnly = false) {
  const projects = await getCollection(
    'research',
    ({ data }) => !selectedOnly || data.selected,
  );
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export async function getPublications(selectedOnly = false) {
  const publications = await getCollection(
    'publications',
    ({ data }) => !selectedOnly || data.selected,
  );
  return publications.sort((a, b) => (
    b.data.year - a.data.year
    || a.data.order - b.data.order
    || a.data.title.localeCompare(b.data.title)
  ));
}

/** Resolve the curated Research index against the bibliography source of truth. */
export async function getResearchPapers(selectedOnly = false) {
  const publications = await getPublications();
  const publicationsByKey = new Map(
    publications.map(publication => [publication.data.citationKey, publication]),
  );

  return researchEntries
    .filter(entry => !selectedOnly || entry.selected)
    .map(entry => {
      const publication = publicationsByKey.get(entry.citationKey);
      if (!publication) {
        throw new Error(`Unknown research citation key "${entry.citationKey}".`);
      }
      if (publication.data.authors[0] !== profile.name) {
        throw new Error(
          `Research citation "${entry.citationKey}" must be first-authored by ${profile.name}.`,
        );
      }
      return { publication, entry };
    });
}

/** Group the archive by research theme and newest publication first. */
export async function getResearchPaperGroups() {
  const papers = await getResearchPapers();
  return researchThemes.map(theme => ({
    theme,
    papers: papers
      .filter(({ entry }) => entry.theme === theme.id)
      .sort((a, b) => (
        b.publication.data.year - a.publication.data.year
        || a.publication.data.order - b.publication.data.order
      )),
  }));
}

export async function getWriting(limit?: number) {
  const posts = await getCollection('writing', ({ data }) => !data.draft);
  const sorted = posts.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );
  return limit === undefined ? sorted : sorted.slice(0, limit);
}
