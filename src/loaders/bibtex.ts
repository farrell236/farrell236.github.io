import { parse, type Creator, type Entry } from '@retorquere/bibtex-parser';
import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';

const filenamePattern = /^(?<year>\d{4})-(?<order>\d{2})-(?<slug>[a-z0-9]+(?:-[a-z0-9]+)*)\.bib$/;

interface BibtexLoaderOptions {
  base: string;
}

function plainText(value: string) {
  return value
    .replace(/\x0e\/?[a-z]+\x0f/gi, '')
    .replace(/\\([%&_#])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function field(entry: Entry, name: string) {
  const value = (entry.fields as Record<string, unknown>)[name];
  if (typeof value === 'string') return plainText(value);
  if (Array.isArray(value)) return value.map(String).join(', ');
  return undefined;
}

function requiredField(entry: Entry, name: string, filename: string) {
  const value = field(entry, name);
  if (!value) throw new Error(`${filename}: missing required BibTeX field "${name}"`);
  return value;
}

function creatorName(creator: Creator) {
  if (creator.name) return plainText(creator.name);
  const name = [creator.firstName, creator.prefix, creator.lastName, creator.suffix]
    .filter(Boolean)
    .map(part => plainText(part as string))
    .join(' ');
  return /^others$/i.test(name) ? 'et al.' : name;
}

function authors(entry: Entry, filename: string) {
  const creators = entry.fields.author;
  if (!Array.isArray(creators) || creators.length === 0) {
    throw new Error(`${filename}: missing required BibTeX field "author"`);
  }
  return creators.map(creatorName).filter(Boolean);
}

function venue(entry: Entry, filename: string) {
  const publication = [
    'journal',
    'booktitle',
    'publisher',
    'institution',
    'school',
    'howpublished',
  ].map(name => field(entry, name)).find(Boolean);

  if (!publication) {
    throw new Error(
      `${filename}: add a journal, booktitle, publisher, institution, school or howpublished field`,
    );
  }

  const volume = field(entry, 'volume');
  const number = field(entry, 'number') || field(entry, 'issue');
  const pages = field(entry, 'pages');
  const issue = volume ? `${volume}${number ? `(${number})` : ''}` : number ? `(${number})` : '';
  const locator = issue && pages ? `${issue}:${pages}` : issue || pages;

  return [publication, locator].filter(Boolean).join(' · ');
}

function publicationLinks(entry: Entry, filename: string) {
  const links: Array<{ label: string; href: string }> = [];
  const validValue = (value?: string) => (
    value && !/^(?:tbd|n\/?a|none|unknown)$/i.test(value) ? value : undefined
  );
  const directUrl = validValue(field(entry, 'url'));
  const doiValue = validValue(field(entry, 'doi'))
    ?.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  const doi = doiValue && /^10\.\d{4,9}\//.test(doiValue) ? doiValue : undefined;
  const eprint = field(entry, 'eprint');
  const archive = field(entry, 'archiveprefix')?.toLowerCase();
  const isArxiv = (value?: string) => Boolean(value && /(?:arxiv\.org|10\.48550\/arxiv)/i.test(value));
  const publisherDoi = doi && !isArxiv(doi) ? `https://doi.org/${doi}` : undefined;
  const publisherUrl = directUrl && !isArxiv(directUrl) ? directUrl : undefined;
  const arxivUrl = eprint && archive === 'arxiv' ? `https://arxiv.org/abs/${eprint}` : undefined;
  const paper = publisherDoi
    || publisherUrl
    || arxivUrl
    || directUrl
    || (doi ? `https://doi.org/${doi}` : undefined);

  if (paper) links.push({ label: 'Paper', href: paper });
  const code = field(entry, 'code');
  if (code) links.push({ label: 'Code', href: code });
  const slides = field(entry, 'slides');
  if (slides) links.push({ label: 'Slides', href: slides });
  links.push({ label: 'BibTeX', href: `/citations/${filename}` });

  return links;
}

function parserError(error: { error: string; input?: string }) {
  return error.input ? `${error.error} near ${JSON.stringify(error.input.slice(0, 80))}` : error.error;
}

export function bibtexLoader({ base }: BibtexLoaderOptions): Loader {
  return {
    name: 'clearform-bibtex-loader',
    async load({ config, generateDigest, logger, parseData, store, watcher }) {
      const baseUrl = new URL(base.endsWith('/') ? base : `${base}/`, config.root);
      const directory = fileURLToPath(baseUrl);
      const root = fileURLToPath(config.root);
      const fileToId = new Map<string, string>();

      async function syncFile(filePath: string) {
        const filename = basename(filePath);
        const match = filename.match(filenamePattern);
        if (!match?.groups) {
          throw new Error(
            `${filename}: expected YYYY-NN-kebab-case.bib (for example 2025-01-my-paper.bib)`,
          );
        }

        const source = await readFile(filePath, 'utf8');
        const library = parse(source, { sentenceCase: false, unsupported: 'ignore' });
        if (library.errors.length > 0) {
          throw new Error(`${filename}: ${library.errors.map(parserError).join('; ')}`);
        }
        if (library.entries.length !== 1) {
          throw new Error(`${filename}: each file must contain exactly one BibTeX entry`);
        }

        const [entry] = library.entries;
        const year = Number(match.groups.year);
        const order = Number(match.groups.order);
        const declaredYear = Number(requiredField(entry, 'year', filename));
        if (declaredYear !== year) {
          throw new Error(
            `${filename}: filename year ${year} does not match BibTeX year ${declaredYear}`,
          );
        }

        const id = filename.slice(0, -extname(filename).length);
        const duplicate = store.values().find(item => (
          item.id !== id && item.data.citationKey === entry.key
        ));
        if (duplicate) {
          throw new Error(`${filename}: duplicate citation key "${entry.key}"`);
        }

        const rawData = {
          citationKey: entry.key,
          entryType: entry.type,
          title: requiredField(entry, 'title', filename),
          authors: authors(entry, filename),
          venue: venue(entry, filename),
          year,
          order,
          selected: /^(?:true|yes|1)$/i.test(field(entry, 'selected') || ''),
          abstract: field(entry, 'abstract') || field(entry, 'summary'),
          links: publicationLinks(entry, filename),
        };
        const data = await parseData({ id, data: rawData, filePath });
        const filePathFromRoot = relative(root, filePath).split(sep).join('/');

        store.set({
          id,
          data,
          filePath: filePathFromRoot,
          digest: generateDigest(source),
        });
        fileToId.set(filePath, id);
      }

      store.clear();
      const files = (await readdir(directory, { withFileTypes: true }))
        .filter(item => item.isFile() && item.name.endsWith('.bib'))
        .map(item => join(directory, item.name))
        .sort();

      if (files.length === 0) logger.warn(`No .bib files found in ${base}`);
      for (const filePath of files) await syncFile(filePath);

      if (!watcher) return;
      watcher.add(directory);
      const isCitation = (filePath: string) => dirname(filePath) === directory && filePath.endsWith('.bib');

      const reload = async (filePath: string) => {
        if (!isCitation(filePath)) return;
        try {
          await syncFile(filePath);
          logger.info(`Reloaded publication from ${basename(filePath)}`);
        } catch (error) {
          logger.error(error instanceof Error ? error.message : String(error));
        }
      };

      watcher.on('add', reload);
      watcher.on('change', reload);
      watcher.on('unlink', filePath => {
        if (!isCitation(filePath)) return;
        const id = fileToId.get(filePath) || basename(filePath, '.bib');
        store.delete(id);
        fileToId.delete(filePath);
      });
    },
  };
}
