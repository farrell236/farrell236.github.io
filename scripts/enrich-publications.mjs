import { parse } from '@retorquere/bibtex-parser';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const bibliographyPath = resolve(process.argv[2] || 'public/files/references.bib');
const reportPath = resolve(process.argv[3] || 'publication-enrichment-report.json');
const applyChanges = process.argv.includes('--apply');
const cacheArgument = process.argv.find(argument => argument.startsWith('--cache='));
const cachePath = cacheArgument ? resolve(cacheArgument.slice('--cache='.length)) : undefined;
const userAgent = 'clearform-academic/1.0 (mailto:farrell236@outlook.com)';

// Curated fallbacks are reserved for metadata verified against an official
// publisher, repository, proceedings, or author/project page. API discoveries
// remain the default so this list stays small and auditable.
const curatedMetadata = {
  jin2026tutorial: {
    code: 'https://github.com/ncbi-nlp/LLM-Medicine-Primer',
    abstract: 'Frontier large language models (LLMs), such as GPT-5, Claude 4.5, Gemini 3, Llama 4 and DeepSeek-R1, represent a transformative class of artificial intelligence tools capable of revolutionizing various aspects of healthcare by generating human-like responses across diverse contexts and adapting to novel tasks following human instructions. Their potential application spans a broad range of medical tasks, such as clinical documentation, matching patients to clinical trials and answering medical questions. Here in this Tutorial, we discuss an actionable set of best practices to help healthcare professionals utilize LLMs more effectively and efficiently. The overall workflow follows sequential phases from formulating the task, choosing the most appropriate LLMs, engineering the prompts, fine-tuning the requests and through to model deployment. We discuss critical considerations in identifying medical tasks that align with the core capabilities of LLMs and selecting models based on the required task, data, performance and model interface. We then review strategies such as prompt engineering and fine-tuning to adapt standard LLMs to specialized medical tasks, followed by deployment considerations including regulatory compliance, ethical guidelines and continuous monitoring for fairness and bias.',
  },
  keenan2026ocularchat: {
    eprint: '2604.25720',
    archiveprefix: 'arXiv',
    code: 'https://huggingface.co/ncbi/OcularChat',
  },
  hou2022segmentation: {
    url: 'https://www.cse.cuhk.edu.hk/~qdou/public/medneurips2022/97.pdf',
    abstract: 'Quantification of the volume of ascites can be an accurate predictor of clinical outcomes in certain pathological settings, including ovarian cancer. Because ascites is a liquid, accurate segmentation can be challenging. This paper shows that tuning nnU-Net, a model that learns the heuristics of the data, can achieve state-of-the-art segmentation performance. The trained model achieved a Dice score of 0.66, with 0.67 precision and 0.68 recall on pathological test cases, improving on the prior state of the art.',
  },
  'DBLP:conf/eccv/SchluterTHK22': {
    eprint: '2109.15222',
    archiveprefix: 'arXiv',
    code: 'https://github.com/hmsch/natural-synthetic-anomalies',
  },
  'DBLP:conf/miccai/TanKHBK21': {
    abstract: 'Using self-supervision in anomaly detection can increase sensitivity to subtle irregularities, but sensitivity to some classes of outlier can reduce sensitivity to others. This work explores whether meta-learning can make self-supervised methods more adaptive. It constructs a few-shot task from the test input and normal reference images, then uses second-order gradients to learn how to adapt while applying strong regularization near the bottleneck of an encoder-decoder architecture.',
  },
  'DBLP:conf/miccai/TanHDSRK21': {
    eprint: '2107.02622',
    archiveprefix: 'arXiv',
    code: 'https://github.com/jemtan/PII',
  },
  'DBLP:conf/miccai/HouKSK21': {
    eprint: '2107.02104',
    archiveprefix: 'arXiv',
    code: 'https://github.com/farrell236/RATCHET',
  },
  son2021synthesis: {
    url: 'https://openreview.net/forum?id=wiKDehhdnz',
    code: 'https://github.com/semantic-retina/semantic-retina-generation',
    abstract: 'Automatic segmentation of retinal lesions remains challenging, in part because accurate lesion-segmentation datasets are scarce. This paper proposes a two-stage process for generating photorealistic fundus images conditioned on synthetic semantic labels, and demonstrates its potential for downstream applications including diabetic-retinopathy grading, dataset balancing and training.',
  },
  'miolane:hal-02908006': {
    code: 'https://github.com/geomstats/geomstats',
  },
  'JMLR:v21:19-027': {
    code: 'https://github.com/geomstats/geomstats',
  },
  'DBLP:conf/miccai/QiuQFHSR19': {
    abstract: 'Deep learning registration methods can provide competitive accuracy with substantially shorter runtimes than traditional registration. This work directly compares supervised training, in which a model regresses to generated ground-truth deformation, with unsupervised training, in which the model optimizes similarity between registered images. Tests on real cardiac MRI show that supervised training produces more regular deformation, while unsupervised training more accurately captures the deformation of anatomical structures in cardiac motion.',
  },
  'DBLP:journals/mia/AlansaryOLFHVKV19': {
    code: 'https://github.com/amiralansary/rl-medical',
    abstract: 'Automatic anatomical-landmark detection is important for many medical-image-analysis applications, but manual annotation is time-consuming and prone to observer error. This study evaluates deep reinforcement-learning strategies that train agents to localize landmarks in three-dimensional scans. It compares fixed- and multiscale search, hierarchical coarse-to-fine actions and several deep Q-network architectures across fetal ultrasound, adult brain MRI and cardiac MRI. The proposed agents outperform supervised and reinforcement-learning baselines, while hierarchical steps accelerate search by a factor of four to five.',
  },
  alansary2018evaluating: {
    url: 'https://openreview.net/forum?id=SyQK4-nsz',
    code: 'https://github.com/amiralansary/rl-medical',
    abstract: 'Automatic detection of anatomical landmarks is essential for many medical-image-analysis and acquisition methods, while manual annotation is time-consuming and error-prone. This work evaluates reinforcement-learning strategies that train agents to localize landmarks in medical scans, including fixed- and multiscale search with hierarchical coarse-to-fine actions. Several deep Q-network architectures are tested on a challenging fetal-head-ultrasound dataset.',
  },
  'DBLP:conf/miccai/HouMKLAMHRGK18': {
    eprint: '1805.01026',
    archiveprefix: 'arXiv',
  },
  'DBLP:conf/miccai/MengBSHRGHTZTMR18': {
    url: 'https://openreview.net/forum?id=SkU16Ec5f',
    abstract: 'Automatically detecting acoustic shadows is important for ultrasound analysis tasks ranging from segmentation to landmark detection. This work generates a pixel-wise, shadow-focused confidence map from weakly labelled, anatomically focused images by initializing potential shadow regions with a classification task, extending them with a generative adversarial model and incorporating intensity information through a distance matrix. The method highlights shadow regions in fetal-screening ultrasound and improves on prior methods and downstream biometric measurements.',
  },
  'DBLP:conf/miccai/KhanalGTMZSMGWG18': {
    eprint: '1807.10583',
    archiveprefix: 'arXiv',
  },
  'DBLP:conf/miccai/HouAMDRHRGK17': {
    eprint: '1702.08891',
    archiveprefix: 'arXiv',
  },
  'DBLP:journals/tmi/ZimmererFIJAPKR22': {
    code: 'https://github.com/MIC-DKFZ/mood',
  },
  hou2026automatic: {
    code: 'https://huggingface.co/nlm-dir/CephViT',
  },
  Hamamci2026: {
    code: 'https://github.com/ibrahimethemhamamci/CT-CLIP',
  },
  zhuang2025mrisegmenter: {
    code: 'https://github.com/rsummers11/MRISegmenter',
  },
};

function mergeCuratedMetadata(entry, additions) {
  const curated = curatedMetadata[entry.key] || {};
  for (const [name, value] of Object.entries(curated)) {
    if (!field(entry, name) && !additions[name]) additions[name] = value;
  }
  return additions;
}

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
    entries.push({ start: match.index, end, source: source.slice(match.index, end) });
    startPattern.lastIndex = end;
  }

  return entries;
}

function field(entry, name) {
  const value = entry.fields[name];
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : undefined;
}

function normalizeTitle(value) {
  return value
    .normalize('NFKD')
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function titleScore(left, right) {
  const a = new Set(normalizeTitle(left).split(' ').filter(Boolean));
  const b = new Set(normalizeTitle(right).split(' ').filter(Boolean));
  const intersection = [...a].filter(word => b.has(word)).length;
  return intersection / Math.max(a.size, b.size, 1);
}

function reconstructAbstract(index) {
  if (!index) return undefined;
  const words = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  return words.join(' ').replace(/\s+/g, ' ').trim() || undefined;
}

function isArxiv(value = '') {
  return /(?:arxiv\.org|10\.48550\/arxiv)/i.test(value);
}

function arxivId(value) {
  return typeof value === 'string'
    ? value.match(/(?:arxiv[.:/]|abs\/|pdf\/)(\d{4}\.\d{4,5}(?:v\d+)?)/i)?.[1]
    : undefined;
}

function officialLocation(work) {
  const locations = work.locations || [];
  return locations.find(location => (
    location?.landing_page_url
    && !isArxiv(location.landing_page_url)
    && location.source?.type !== 'repository'
  ));
}

async function getJson(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (response.ok) return response.json();
    if (attempt === attempts || ![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, attempt * 800));
  }
  return undefined;
}

async function findOpenAlex(title, year) {
  const url = new URL('https://api.openalex.org/works');
  // OpenAlex's title-search filter rejects a few punctuation characters that
  // legitimately occur in paper titles. A normalized query is equally useful
  // because final acceptance is based on the untouched returned title.
  url.searchParams.set('search.title', normalizeTitle(title));
  url.searchParams.set('per-page', '5');
  url.searchParams.set(
    'select',
    'id,doi,display_name,publication_year,primary_location,best_oa_location,locations,abstract_inverted_index',
  );
  const response = await getJson(url);
  const candidates = (response.results || []).map(work => ({
    work,
    score: titleScore(title, work.display_name || ''),
    yearDifference: Math.abs(Number(work.publication_year) - Number(year)),
  })).sort((left, right) => right.score - left.score || left.yearDifference - right.yearDifference);
  const match = candidates.find(candidate => (
    candidate.score >= 0.92 && candidate.yearDifference <= 2
  ));
  return { match, candidates: candidates.slice(0, 3) };
}

async function findCrossref(title, year) {
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.title', title);
  url.searchParams.set('rows', '5');
  url.searchParams.set('select', 'DOI,title,published,URL,abstract');
  url.searchParams.set('mailto', 'farrell236@outlook.com');
  const response = await getJson(url);
  const candidates = (response.message?.items || []).map(item => {
    const publishedYear = item.published?.['date-parts']?.[0]?.[0];
    return {
      item,
      score: titleScore(title, item.title?.[0] || ''),
      yearDifference: Math.abs(Number(publishedYear) - Number(year)),
    };
  }).sort((left, right) => right.score - left.score || left.yearDifference - right.yearDifference);
  const match = candidates.find(candidate => (
    candidate.score >= 0.94 && candidate.yearDifference <= 2
  ));
  return { match, candidates: candidates.slice(0, 3) };
}

function cleanCrossrefAbstract(value) {
  return value
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value) {
  return value
    ?.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

async function findArxiv(id) {
  if (!id) return {};
  const response = await fetch(`https://arxiv.org/abs/${id}`, {
    headers: { 'User-Agent': userAgent },
  });
  if (!response.ok) return {};
  const html = await response.text();
  const abstract = decodeHtml(
    html.match(/<meta\s+name=["']citation_abstract["']\s+content=["']([^"']+)["']/i)?.[1],
  );
  const code = abstract?.match(/https?:\/\/(?:www\.)?(?:github\.com|gitlab\.com)\/[\w./-]+/i)?.[0]
    ?.replace(/[.,;)]+$/, '');
  return { abstract, code };
}

function bibtexValue(value) {
  return value
    .normalize('NFC')
    .replace(/[{}]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\s+/g, ' ')
    .trim();
}

function addFields(rawEntry, additions) {
  const fields = Object.entries(additions).filter(([, value]) => value);
  if (fields.length === 0) return rawEntry;
  const cleanedEntry = fields.reduce((source, [name]) => source.replace(
    new RegExp(`^\\s*${name}\\s*=\\s*[\\{\"](?:tbd|n\\/?a|none|unknown)[\\}\"]\\s*,?\\s*$`, 'im'),
    '',
  ), rawEntry);
  const finalIndex = cleanedEntry.search(/[})]\s*$/);
  if (finalIndex < 0) throw new Error('Could not find the end of a BibTeX entry');
  const prefix = cleanedEntry.slice(0, finalIndex).replace(/[\s,]+$/, '');
  const suffix = cleanedEntry.slice(finalIndex);
  const rendered = fields.map(([name, value]) => `  ${name} = {${bibtexValue(value)}},`).join('\n');
  return `${prefix},\n${rendered}\n${suffix}`;
}

const original = await readFile(bibliographyPath, 'utf8');
const rawEntries = splitEntries(original);
const records = rawEntries.map(({ source }, index) => {
  const library = parse(source, { sentenceCase: false, unsupported: 'ignore' });
  if (library.errors.length > 0 || library.entries.length !== 1) {
    throw new Error(`Could not parse bibliography entry ${index + 1}`);
  }
  return { raw: source, entry: library.entries[0] };
});
const cachedReport = cachePath
  ? new Map(JSON.parse(await readFile(cachePath, 'utf8')).map(item => [item.key, item]))
  : new Map();

const report = [];
for (const [index, record] of records.entries()) {
  const title = field(record.entry, 'title');
  const year = Number(field(record.entry, 'year'));
  process.stdout.write(`[${index + 1}/${records.length}] ${record.entry.key}\n`);
  const cached = cachedReport.get(record.entry.key);
  if (cached) {
    const additions = mergeCuratedMetadata(record.entry, { ...cached.additions });
    const cachedArxiv = additions.eprint || field(record.entry, 'eprint');
    const arxivMetadata = await findArxiv(cachedArxiv);
    if (!field(record.entry, 'abstract') && !additions.abstract && arxivMetadata.abstract) {
      additions.abstract = arxivMetadata.abstract;
    }
    if (!field(record.entry, 'code') && !additions.code && arxivMetadata.code) {
      additions.code = arxivMetadata.code;
    }
    const cachedItem = { ...cached, additions };
    report.push(cachedItem);
    record.enriched = addFields(record.raw, additions);
    continue;
  }
  const openAlex = await findOpenAlex(title, year);
  const crossref = await findCrossref(title, year);
  const work = openAlex.match?.work;
  const crossrefItem = crossref.match?.item;
  const official = work && officialLocation(work);
  const doi = (crossrefItem?.DOI || work?.doi || '')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '') || undefined;
  const arxiv = work && (
    arxivId(work.primary_location?.landing_page_url)
    || arxivId(work.best_oa_location?.landing_page_url)
    || arxivId(work.doi)
    || (work.locations || []).map(location => arxivId(location?.landing_page_url)).find(Boolean)
  );
  const arxivMetadata = await findArxiv(arxiv);
  const abstract = reconstructAbstract(work?.abstract_inverted_index)
    || cleanCrossrefAbstract(crossrefItem?.abstract)
    || arxivMetadata.abstract;
  const additions = {};
  const existingDoi = field(record.entry, 'doi');
  const existingUrl = field(record.entry, 'url');
  if ((!existingDoi || /^(?:tbd|n\/?a|none|unknown)$/i.test(existingDoi)) && doi) additions.doi = doi;
  if (!existingUrl && official?.landing_page_url) additions.url = official.landing_page_url;
  if (!field(record.entry, 'eprint') && arxiv) {
    additions.eprint = arxiv;
    additions.archiveprefix = 'arXiv';
  }
  if (!field(record.entry, 'abstract') && abstract) additions.abstract = abstract;
  if (!field(record.entry, 'code') && arxivMetadata.code) additions.code = arxivMetadata.code;
  mergeCuratedMetadata(record.entry, additions);

  report.push({
    key: record.entry.key,
    title,
    year,
    openAlex: openAlex.match ? {
      id: work.id,
      title: work.display_name,
      year: work.publication_year,
      score: openAlex.match.score,
    } : null,
    crossref: crossref.match ? {
      doi: crossrefItem.DOI,
      title: crossrefItem.title?.[0],
      score: crossref.match.score,
    } : null,
    additions,
    candidates: !openAlex.match ? openAlex.candidates.map(candidate => ({
      id: candidate.work.id,
      title: candidate.work.display_name,
      year: candidate.work.publication_year,
      score: candidate.score,
    })) : undefined,
  });
  record.enriched = addFields(record.raw, additions);
  await new Promise(resolveDelay => setTimeout(resolveDelay, 120));
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (applyChanges) {
  let cursor = 0;
  let enriched = '';
  rawEntries.forEach((rawEntry, index) => {
    enriched += original.slice(cursor, rawEntry.start);
    enriched += records[index].enriched;
    cursor = rawEntry.end;
  });
  enriched += original.slice(cursor);
  await writeFile(bibliographyPath, enriched, 'utf8');
}

const matched = report.filter(item => item.openAlex || item.crossref).length;
const abstracts = report.filter(item => item.additions.abstract).length;
const links = report.filter(item => item.additions.doi || item.additions.url || item.additions.eprint).length;
console.log(`Matched ${matched}/${report.length}; found ${abstracts} abstracts and new links for ${links} entries.`);
console.log(`${applyChanges ? 'Updated' : 'Dry run only; did not update'} ${bibliographyPath}`);
console.log(`Report: ${reportPath}`);
