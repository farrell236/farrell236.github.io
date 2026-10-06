import { parse } from '@retorquere/bibtex-parser';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const sourcePath = resolve(process.argv[2] || 'public/files/references.bib');
const targetDirectory = resolve(process.argv[3] || 'public/citations');
const filenamePattern = /^\d{4}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.bib$/;

function splitEntries(source) {
  const entries = [];
  const startPattern = /@[a-z]+\s*([({])/gi;
  let match;

  while ((match = startPattern.exec(source))) {
    const open = match[1];
    const close = open === '{' ? '}' : ')';
    let depth = 1;
    let escaped = false;
    let end = -1;

    for (let index = startPattern.lastIndex; index < source.length; index += 1) {
      const character = source[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === open) depth += 1;
      if (character === close) depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }

    if (end < 0) throw new Error(`Unclosed BibTeX entry near character ${match.index}`);
    entries.push(source.slice(match.index, end).trim());
    startPattern.lastIndex = end;
  }

  return entries;
}

function parserMessage(error) {
  return error.input
    ? `${error.error} near ${JSON.stringify(error.input.slice(0, 80))}`
    : error.error;
}

function slug(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const source = await readFile(sourcePath, 'utf8');
const rawEntries = splitEntries(source);
const parsedEntries = rawEntries.map((rawEntry, index) => {
  const library = parse(rawEntry, { sentenceCase: false, unsupported: 'ignore' });
  if (library.errors.length > 0) {
    throw new Error(`Entry ${index + 1}: ${library.errors.map(parserMessage).join('; ')}`);
  }
  if (library.entries.length !== 1) {
    throw new Error(`Entry ${index + 1}: expected one publication, found ${library.entries.length}`);
  }
  return { rawEntry, entry: library.entries[0] };
});

if (parsedEntries.length === 0) throw new Error(`${sourcePath} contains no BibTeX entries`);

const citationKeys = parsedEntries.map(({ entry }) => entry.key);
const duplicateKeys = citationKeys.filter((key, index) => citationKeys.indexOf(key) !== index);
if (duplicateKeys.length > 0) {
  throw new Error(`Duplicate citation keys: ${[...new Set(duplicateKeys)].join(', ')}`);
}

const orderByYear = new Map();
const outputs = parsedEntries.map(({ rawEntry, entry }, index) => {
  const year = Number(entry.fields.year);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error(`${entry.key || `Entry ${index + 1}`}: invalid or missing year`);
  }
  const order = (orderByYear.get(year) || 0) + 1;
  orderByYear.set(year, order);
  const entrySlug = slug(entry.key) || `publication-${index + 1}`;
  const filename = `${year}-${String(order).padStart(2, '0')}-${entrySlug}.bib`;
  return { filename, source: `${rawEntry}\n` };
});

const duplicateFilenames = outputs
  .map(({ filename }) => filename)
  .filter((filename, index, filenames) => filenames.indexOf(filename) !== index);
if (duplicateFilenames.length > 0) {
  throw new Error(`Duplicate output filenames: ${[...new Set(duplicateFilenames)].join(', ')}`);
}

await mkdir(targetDirectory, { recursive: true });
const existingFiles = await readdir(targetDirectory, { withFileTypes: true });
await Promise.all(existingFiles
  .filter(item => item.isFile() && filenamePattern.test(item.name))
  .map(item => unlink(resolve(targetDirectory, item.name))));
await Promise.all(outputs.map(({ filename, source: entrySource }) => (
  writeFile(resolve(targetDirectory, filename), entrySource, 'utf8')
)));

console.log(
  `Imported ${outputs.length} publications from ${basename(sourcePath)} across ${orderByYear.size} years.`,
);
