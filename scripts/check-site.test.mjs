import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { parse as parseBibTeX } from '@retorquere/bibtex-parser';

const output = resolve('dist');
const base = `/${(process.env.ASTRO_BASE || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
async function files(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(resolve(folder, entry.name)) : resolve(folder, entry.name)))).flat();
}
const htmlFiles = (await files(output)).filter(path => path.endsWith('.html'));

test('all template page types are built', async () => {
  for (const path of ['index.html', 'research/index.html', 'research/multimodal-clinical-ai/index.html', 'research/quantitative-clinical-imaging/index.html', 'research/spatial-reasoning-reconstruction/index.html', 'research/synthetic-data-generation/index.html', 'publications/index.html', 'academic/index.html', 'writing/index.html', 'writing/interactive-radiology/index.html', 'writing/rufuspp/index.html', 'writing/pydrr/index.html', 'about/index.html', 'about/demo-resources/index.html', '404.html']) {
    assert.ok((await stat(resolve(output, path))).isFile(), path);
  }
});

test('public demo uses fictional identities and neutral resource placeholders', async t => {
  const config = await readFile(resolve('src/config.ts'), 'utf8');
  if (!/export const demoContent = true/.test(config)) return t.skip('Personalised site, not the generic demo');
  const citationDirectory = resolve('public/citations');
  const citationFiles = (await readdir(citationDirectory)).filter(path => path.endsWith('.bib')).sort();
  const publications = [];
  for (const filename of citationFiles) {
    const filenameMatch = filename.match(/^(\d{4})-(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.bib$/);
    assert.ok(filenameMatch, `Invalid citation filename: ${filename}`);
    const source = await readFile(resolve(citationDirectory, filename), 'utf8');
    const library = parseBibTeX(source, { sentenceCase: false, unsupported: 'ignore' });
    assert.equal(library.errors.length, 0, filename);
    assert.equal(library.entries.length, 1, filename);
    const [entry] = library.entries;
    assert.equal(Number(entry.fields.year), Number(filenameMatch[1]), filename);
    assert.match(source, /Fictional template example\. Not a real publication\./);
    publications.push({
      year: Number(filenameMatch[1]),
      order: Number(filenameMatch[2]),
      selected: /^(?:true|yes|1)$/i.test(String(entry.fields.selected || '')),
      authors: entry.fields.author || [],
    });
  }
  const permittedHosts = new Set(['example.org', new URL(process.env.SITE_URL || 'https://example.org').hostname]);
  const permittedPlatformUrls = new Set(['https://huggingface.co/', 'https://www.instagram.com/', 'https://x.com/']);
  assert.ok(publications.every(publication => publication.authors.every(author => {
    const name = author.name || [author.firstName, author.prefix, author.lastName, author.suffix].filter(Boolean).join(' ');
    return /(?:Example|Sample|Placeholder)$/.test(name);
  })));
  assert.equal(publications.filter(publication => publication.selected).length, 3);
  const publicationsPerYear = Map.groupBy(publications, publication => publication.year);
  for (const entries of publicationsPerYear.values()) {
    assert.ok(entries.length >= 2);
    assert.equal(new Set(entries.map(publication => publication.order)).size, entries.length);
  }
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    assert.ok(!html.includes('Fictional demo content · Replace with your own profile and research.'));
    assert.ok(!html.includes('"@type":"Person"'));
    for (const match of html.matchAll(/href="mailto:([^"]+)"/g)) assert.ok(match[1].endsWith('@example.org'));
    for (const match of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      assert.ok(permittedHosts.has(new URL(match[1]).hostname) || permittedPlatformUrls.has(match[1]), `Non-generic external destination: ${match[1]}`);
    }
  }
  const publicFiles = (await files(resolve('public'))).map(path => relative(resolve('public'), path)).sort();
  assert.deepEqual(publicFiles, [
    ...citationFiles.map(path => `citations/${path}`),
    'favicon.svg',
    'files/sample-cv.pdf',
    'images/avatar.svg',
    'social-preview.png',
    'social-preview.svg',
  ].sort());
});

test('personalised bibliography matches the complete BibTeX library', async t => {
  const config = await readFile(resolve('src/config.ts'), 'utf8');
  if (/export const demoContent = true/.test(config)) return t.skip('Generic demo, not a personalised bibliography');

  const completeSource = await readFile(resolve('public/files/references.bib'), 'utf8');
  const completeLibrary = parseBibTeX(completeSource, { sentenceCase: false, unsupported: 'ignore' });
  assert.equal(completeLibrary.errors.length, 0);
  assert.doesNotMatch(completeSource, /\band\s+others\b/i, 'The source bibliography must contain complete author lists');

  const citationFiles = (await readdir(resolve('public/citations')))
    .filter(path => path.endsWith('.bib'))
    .sort();
  assert.equal(citationFiles.length, completeLibrary.entries.length);

  const importedKeys = [];
  const ordersByYear = new Map();
  for (const filename of citationFiles) {
    const filenameMatch = filename.match(/^(\d{4})-(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.bib$/);
    assert.ok(filenameMatch, `Invalid citation filename: ${filename}`);
    const library = parseBibTeX(
      await readFile(resolve('public/citations', filename), 'utf8'),
      { sentenceCase: false, unsupported: 'ignore' },
    );
    assert.equal(library.errors.length, 0, filename);
    assert.equal(library.entries.length, 1, filename);
    const [entry] = library.entries;
    assert.equal(Number(entry.fields.year), Number(filenameMatch[1]), filename);
    importedKeys.push(entry.key);
    const year = Number(filenameMatch[1]);
    const order = Number(filenameMatch[2]);
    ordersByYear.set(year, [...(ordersByYear.get(year) || []), order]);
  }

  assert.deepEqual(importedKeys.sort(), completeLibrary.entries.map(entry => entry.key).sort());
  for (const orders of ordersByYear.values()) {
    assert.deepEqual(orders.sort((a, b) => a - b), Array.from({ length: orders.length }, (_, index) => index + 1));
  }
});

test('profile links and identity render consistently without the decorative tagline', async () => {
  const config = await readFile(resolve('src/config.ts'), 'utf8');
  const profileName = config.match(/export const profile = \{\s*name: '([^']+)'/)?.[1];
  assert.ok(profileName, 'Profile name is configured');
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    assert.match(html, /<nav class="profile-links" aria-label="Profile links"/);
    for (const href of ['https://github.com/farrell236', 'https://huggingface.co/farrell236', 'https://www.instagram.com/farrell.236', 'https://x.com/farrell192']) {
      assert.ok(html.includes(`href="${href}"`), `Missing ${href} in ${path}`);
    }
    const discipline = html.match(/<p class="discipline">([\s\S]*?)<\/p>/)?.[1];
    assert.match(discipline, /Medical Image Analysis[\s\S]*?Natural Language Processing[\s\S]*?Clinical Translation/);
    assert.equal([...discipline.matchAll(/class="discipline-separator"/g)].length, 2);
    assert.doesNotMatch(html, /Scientific questions\.|Thoughtful methods\.|Open research\.|profile-note/);
    const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer, `Missing footer in ${path}`);
    assert.equal([...footer.matchAll(/<span>/g)].length, 1);
    assert.match(footer, new RegExp(`© \\d{4} ${profileName}`));
    assert.doesNotMatch(footer, /Imperfect Academic|Fictional demo|Design preview/);
  }
});

test('about page uses a concise email link label', async () => {
  const html = await readFile(resolve(output, 'about/index.html'), 'utf8');
  const emailLink = html.match(
    /<a class="button button-primary" href="mailto:[^"]+">([\s\S]*?)<\/a>/,
  )?.[1];

  assert.ok(emailLink, 'Expected the About page email button to be rendered');
  assert.match(emailLink, /Email\s*$/);
  assert.doesNotMatch(emailLink, /Email\s+Benjamin Hou/);
});

test('personalised about page presents a complete academic profile', async () => {
  const html = await readFile(resolve(output, 'about/index.html'), 'utf8');
  for (const heading of ['Biography', 'Research interests', 'Get in touch']) {
    assert.match(html, new RegExp(`>${heading}<\\/h[12]>`));
  }
  for (const fact of [
    'artificial intelligence for craniofacial imaging',
    'multimodal large language models',
    'PhD in Machine Learning and Biomedical Image Analysis',
  ]) assert.ok(html.includes(fact), `Missing About page fact: ${fact}`);
  for (const removedHeading of ['Experience', 'Education', 'Selected recognition']) {
    assert.doesNotMatch(html, new RegExp(`>${removedHeading}<\\/h2>`));
  }
  const biography = html.match(/<article class="panel prose about-biography">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(biography, 'Expected the About biography panel');
  assert.match(biography, /My research spans/);
  assert.match(html, /href="\/files\/benjamin-hou-cv\.pdf" download/);
  const contact = html.match(/<section class="panel contact-panel"[\s\S]*?<\/section>/)?.[0];
  assert.ok(contact, 'Expected the About contact section');
  for (const label of ['Google Scholar', 'GitHub', 'LinkedIn', 'Hugging Face', 'Instagram', 'X']) {
    assert.match(contact, new RegExp(`>${label}<`));
  }
  assert.doesNotMatch(contact, />ORCID</);
  assert.doesNotMatch(html, /fictional|Example University|sample CV/i);
  assert.match(css, /\.about-research \.summary-content p \{[^}]*max-width:\s*none;/);
});

test('academic page presents CV-backed professional activities', async () => {
  const html = await readFile(resolve(output, 'academic/index.html'), 'utf8');
  for (const heading of ['Professional service', 'Invited talks', 'Mentoring and teaching']) {
    assert.match(html, new RegExp(`>${heading}<\\/h2>`));
  }
  assert.equal([...html.matchAll(/class="summary-list academic-list"/g)].length, 3);
  assert.match(css, /\.academic-list \.summary-content p \{[^}]*max-width:\s*none;/);
  for (const fact of [
    'Conference Area Chair',
    'Learning with Longitudinal Medical Images and Data (LMID)',
    'Vision-Language Modelling in 3D Medical Imaging (VLM3D)',
    'Multi-modal Learning with Chest Radiographs',
    'Deep Learning in Medical Image Analysis',
    'Summer research supervision',
  ]) assert.ok(html.includes(fact), `Missing Academic page fact: ${fact}`);
  assert.match(html, /href="https:\/\/link\.springer\.com\/book\/10\.1007\/978-3-032-16128-4"[^>]*>\s*Proceedings/);
  assert.match(html, /href="https:\/\/zenodo\.org\/records\/15052708"[^>]*>\s*Challenge record/);
  assert.match(html, /<details class="academic-details">\s*<summary>GTA courses<\/summary>/);
  for (const course of [
    'EE1-07: Software Engineering 1 - Introduction to Computing (2017)',
    'CO112: Hardware (2018–2020)',
    'CO120.3: Programming III (2017–2019)',
    'CO317 (COMP60005): Graphics (2016–2021)',
  ]) assert.ok(html.includes(course), `Missing GTA course: ${course}`);
  const summerProjects = html.match(/<details class="academic-details">\s*<summary>Student projects<\/summary>([\s\S]*?)<\/details>/)?.[1];
  assert.ok(summerProjects, 'Expected the Student projects disclosure');
  assert.equal([...summerProjects.matchAll(/<li>/g)].length, 2);
  assert.ok(summerProjects.includes('Dylan Wu'));
  assert.ok(summerProjects.includes('A Novel Deep Learning Pipeline for Age-Related Macular Degeneration Risk Prediction with Reticular Pseudodrusen'));
  assert.ok(summerProjects.includes('Tiffany Wei'));
  assert.match(summerProjects, /href="https:\/\/siim\.org\/wp-content\/uploads\/2024\/08\/Evaluating-TotalSegmentator_Wei\.pdf"/);
  assert.doesNotMatch(html, /Supervision of NIH Summer Internship Program students/);
  const supervisor = html.match(/<details class="academic-details">\s*<summary>As Supervisor<\/summary>([\s\S]*?)<\/details>/)?.[1];
  const coSupervisor = html.match(/<details class="academic-details">\s*<summary>As Co-supervisor<\/summary>([\s\S]*?)<\/details>/)?.[1];
  assert.ok(supervisor, 'Expected the As Supervisor disclosure');
  assert.ok(coSupervisor, 'Expected the As Co-supervisor disclosure');
  assert.doesNotMatch(html, /class="academic-disclosures"/);
  assert.equal([...supervisor.matchAll(/<li>/g)].length, 7);
  assert.equal([...coSupervisor.matchAll(/<li>/g)].length, 13);
  const supervision = `${supervisor}${coSupervisor}`;
  for (const student of [
    'Li, Charlie', 'Yan, Jerry', 'Zhao, Xuan', 'Liu, Zhaojiang', 'Xu, Ming', 'Zhang, Wanshunyu', 'Son, Joon-Ho',
    'Zhu, Jerry', 'Chen, Yitang', 'Sorokin, Mike', 'Bailey, Jacob', 'Mihalik, Daniel', 'Khan, Seyhan',
    'Catea, Bianca', 'Bouas, Nikolaos', 'Lu, Kuan', 'Richter, Leo', 'Soteriou, George', 'Xie, Yiming', 'Roy, Sukant',
  ]) assert.ok(supervision.includes(student), `Missing supervised student: ${student}`);
  assert.doesNotMatch(html, /Supervision and co-supervision of undergraduate and master’s research projects/);
  assert.doesNotMatch(html, /Laboratory teaching, coursework marking and academic support/);
  assert.doesNotMatch(html, /fictional|sample slides|Example University|View sample slides/i);
});

test('header uses one functional Home link without a duplicate identity or Overview', async () => {
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
    const home = header.match(/<a class="home-link"[^>]+>([\s\S]*?)<\/a>/);
    assert.ok(home, `Missing Home link in ${path}`);
    assert.ok(home[0].includes(`href="${base}/"`));
    assert.match(home[1], /<svg\b[^>]+aria-hidden="true"/);
    assert.ok(home[1].includes('<span>Home</span>'));
    assert.equal([...header.matchAll(/class="home-link"/g)].length, 1);
    assert.doesNotMatch(header, /class="brand(?:-|"|\s)|>Overview</);
    assert.equal(home[0].includes('aria-current="page"'), path === resolve(output, 'index.html'));
  }
});

test('every local link, asset and fragment resolves under the configured base', async () => {
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    const route = `/${relative(output, path).replace(/index\.html$/, '')}`;
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href = match[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:|data:)/.test(href)) continue;
      assert.ok(href.length > 0 && href !== '#', `Empty link in ${path}`);
      const target = new URL(href, `https://template.test${base}${route}`);
      assert.ok(!base || target.pathname === base || target.pathname.startsWith(`${base}/`), `${href} is missing ${base}`);
      const targetPath = decodeURIComponent(target.pathname.slice(base.length));
      let diskPath = resolve(output, `.${targetPath}`);
      assert.ok(diskPath === output || diskPath.startsWith(`${output}/`), 'Path must stay inside output');
      if ((await stat(diskPath)).isDirectory()) diskPath = resolve(diskPath, 'index.html');
      assert.ok((await stat(diskPath)).isFile(), `${href} in ${relative(output, path)}`);
      if (target.hash && diskPath.endsWith('.html')) {
        assert.ok((await readFile(diskPath, 'utf8')).includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${href} fragment missing`);
      }
    }
  }
});

test('semantic and metadata essentials are present on every page', async () => {
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    assert.match(html, /<html lang="en"/);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, path);
    assert.doesNotMatch(html, /class="eyebrow"/, 'No decorative introductory labels');
    assert.match(html, /<main[^>]+id="main"/);
    assert.match(html, /name="description" content="[^"]+"/);
    assert.match(html, /rel="canonical" href="https:\/\//);
    const robots = process.env.PUBLIC_IS_PREVIEW === 'false' ? 'index, follow' : 'noindex, nofollow';
    assert.ok(html.includes(`name="robots" content="${robots}"`));
    assert.ok(!html.includes('0001-01-01'));
    for (const img of html.matchAll(/<img\b[^>]*>/g)) assert.match(img[0], /alt="[^"]+"/);
    assert.ok(!/<script(?![^>]*type="application\/ld\+json")/.test(html), 'No client runtime required');
  }
});

test('heading outlines, identifiers and navigation remain consistent', async () => {
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    let previous = 0;
    for (const heading of html.matchAll(/<h([1-6])(?:\s|>)/g)) {
      const level = Number(heading[1]);
      assert.ok(level <= previous + 1, `Skipped heading level in ${relative(output, path)}`);
      previous = level;
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate identifiers in ${path}`);
    const currentLinks = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*aria-current="page"/g)].map(match => match[1]);
    if (!path.endsWith('404.html')) assert.equal(new Set(currentLinks).size, 1, `Expected one active section in ${path}`);
  }
});

test('social image and preview indexing policy are complete', async () => {
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const socialImage = html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.ok(new URL(socialImage).pathname.startsWith(`${base}/`));
  const bytes = await readFile(resolve(output, 'social-preview.png'));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
  const robots = await readFile(resolve(output, 'robots.txt'), 'utf8');
  assert.ok(robots.includes(process.env.PUBLIC_IS_PREVIEW === 'false' ? 'Allow: /' : 'Disallow: /'));
});

test('the personalised homepage restores the original three-section structure', async () => {
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const content = html.slice(html.indexOf('<main'));
  assert.match(content, /<span class="intro-title-line">Machine Learning for<\/span>\s*<span class="intro-title-line">Bioinformatics<\/span>/);
  assert.doesNotMatch(content, /hero-visual/);
  assert.doesNotMatch(content, /Research focus|Current appointments/);
  assert.ok(content.indexOf('Selected research') < content.indexOf('Selected publications'));
  assert.ok(content.indexOf('Selected publications') < content.indexOf('Beyond the papers'));
  assert.match(content, />All musings<svg/);
  assert.ok(!content.includes('Recent Posts'));
});

test('Musings replaces Writing in user-facing navigation and headings', async () => {
  const index = await readFile(resolve(output, 'index.html'), 'utf8');
  const archive = await readFile(resolve(output, 'writing/index.html'), 'utf8');
  const article = await readFile(resolve(output, 'writing/interactive-radiology/index.html'), 'utf8');
  assert.match(index, /href="\/writing\/"[^>]*>Musings<\/a>/);
  assert.match(archive, /<h1>Musings<\/h1>/);
  assert.match(article, />All musings<\/a>/);
  assert.doesNotMatch(`${index}${archive}${article}`, />Writing<\/a>|<h1>Writing<\/h1>|>All writing<\/a>/);
});

test('research is a compact index of first-authored papers with disabled project links', async () => {
  const archive = await readFile(resolve(output, 'research/index.html'), 'utf8');
  for (const paper of [
    'Automatic Cephalometric Landmark Localization',
    'One year on: assessing progress',
    'Deep Learning Segmentation of Ascites',
    'RATCHET:',
    'Predicting Slice-to-Volume Transformation',
  ]) assert.ok(archive.includes(paper), `Missing first-authored paper: ${paper}`);
  assert.doesNotMatch(archive, /fictional|sample project|Example University/i);
  assert.equal((archive.match(/class="research-card research-paper-card"/g) || []).length, 11);
  assert.equal((archive.match(/class="research-paper-image"/g) || []).length, 11);
  assert.equal((archive.match(/style="--research-image-scale:[^"]+--research-image-focus:[^"]+"/g) || []).length, 11);
  assert.doesNotMatch(archive, /class="research-art/);
  assert.equal((archive.match(/aria-disabled="true"/g) || []).length, 11);
  assert.doesNotMatch(archive, /href="\/research\/[^"#]+\/"/);
  assert.doesNotMatch(archive, /research-feature/);
  const themes = [
    ['Quantitative Clinical Imaging', 4],
    ['Multimodal Clinical AI', 2],
    ['Generative Medical Imaging', 2],
    ['Spatial Reasoning and Reconstruction', 3],
  ];
  let previousThemePosition = -1;
  for (const [index, [theme, paperCount]] of themes.entries()) {
    const position = archive.indexOf(`>${theme}</h2>`);
    assert.ok(position > previousThemePosition, `Missing or misordered research theme: ${theme}`);
    previousThemePosition = position;
    const nextTheme = themes[index + 1]?.[0];
    const nextPosition = nextTheme ? archive.indexOf(`>${nextTheme}</h2>`) : archive.length;
    const section = archive.slice(position, nextPosition);
    assert.equal(
      (section.match(/class="research-card research-paper-card"/g) || []).length,
      paperCount,
      `${theme} paper count`,
    );
  }

  const home = await readFile(resolve(output, 'index.html'), 'utf8');
  assert.equal((home.match(/class="research-card research-paper-card"/g) || []).length, 3);
  assert.equal((home.match(/class="research-paper-image"/g) || []).length, 3);
  assert.equal((home.match(/aria-disabled="true"/g) || []).length, 3);
  assert.match(home, />All research<svg/);
  assert.doesNotMatch(home, /research-feature/);

  const imagePaths = [...archive.matchAll(/class="research-paper-image" src="([^"]+)"/g)]
    .map(match => match[1]);
  assert.equal(new Set(imagePaths).size, 11, 'Each paper should have a distinct hero image');
  for (const imagePath of imagePaths) {
    const bytes = await readFile(resolve(output, imagePath.replace(/^\//, '')));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', imagePath);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', imagePath);
  }

  for (const slug of [
    'multimodal-clinical-ai',
    'quantitative-clinical-imaging',
    'spatial-reasoning-reconstruction',
    'synthetic-data-generation',
  ]) {
    const html = await readFile(resolve(output, `research/${slug}/index.html`), 'utf8');
    assert.match(html, />Lead-authored work<\/h2>/);
    assert.match(html, />Related collaborative work<\/h2>/);
    assert.match(html, /class="panel prose research-prose"/);
    assert.doesNotMatch(html, /fictional|sample publication|Alex Example/i);
  }
});

test('the homepage hero uses a balanced wide measure', () => {
  assert.match(css, /\.intro h1 \{[^}]*width:\s*90%;[^}]*max-width:\s*none;/);
  assert.match(css, /\.intro \.lede \{[^}]*width:\s*90%;[^}]*max-width:\s*none;/);
});

test('page headings use the same balanced wide measure', () => {
  assert.match(css, /\.page-heading h1 \{[^}]*width:\s*90%;[^}]*max-width:\s*none;/);
  assert.match(css, /\.page-heading p \{[^}]*width:\s*90%;[^}]*max-width:\s*none;/);
});

// Read both the replaceable skin and structural CSS so design assertions cannot drift.
const themeCss = await readFile(resolve('src/styles/theme.css'), 'utf8');
const globalCss = await readFile(resolve('src/styles/global.css'), 'utf8');
const css = `${themeCss}\n${globalCss}`;

test('content format v1 stays independent from the visual theme', async () => {
  const config = await readFile(resolve('src/config.ts'), 'utf8');
  const contract = await readFile(resolve('src/lib/content-contract.ts'), 'utf8');
  const contentConfig = await readFile(resolve('src/content.config.ts'), 'utf8');
  const researchArt = await readFile(resolve('src/components/ResearchArt.astro'), 'utf8');
  assert.match(config, /contentFormatVersion\s*=\s*1 as const/);
  assert.match(contract, /supportedContentFormatVersion\s*=\s*1 as const/);
  assert.match(contract, /illustration:\s*requiredText\.default\('default'\)/);
  assert.match(contract, /leadPublications:\s*z\.array\(requiredText\)\.default\(\[\]\)/);
  assert.match(contract, /relatedPublications:\s*z\.array\(requiredText\)\.default\(\[\]\)/);
  assert.match(contentConfig, /publicationSchema, researchSchema, writingSchema/);
  assert.match(researchArt, /:\s*'geometry';/);
  assert.match(globalCss, /^@import '\.\/theme\.css';/);
  for (const path of [resolve('src/config.ts'), ...(await files(resolve('src/data')))]) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /from\s+['"][^'"]*(?:components|layouts|styles|pages)\//, `Content imports presentation code: ${path}`);
  }
});

test('the visual system keeps its restrained iOS 7-inspired accents', () => {
  assert.match(css, /--canvas:\s*#f2f2f7/);
  assert.match(css, /--accent:\s*#005fc4/);
  for (const colour of ['007aff', '34aadc', '4cd964', 'ff2d55', 'ffcc00']) assert.match(css, new RegExp(`--ios-[^:]+:\\s*#${colour}`));
  assert.match(css, /--ambient-cool:\s*rgba\(18, 68, 128, \.1\)/);
  assert.match(css, /radial-gradient\(circle at 90% 22%, var\(--ambient-cool\), transparent 30rem\)/);
  assert.match(css, /--radius:\s*\.25rem/);
  assert.match(css, /--control-radius:\s*\.125rem/);
  assert.match(css, /--hairline:\s*1px/);
  assert.match(css, /@media \(min-resolution: 2dppx\)[\s\S]*--hairline:\s*\.5px/);
  assert.match(css, /\.button-primary, \.button-secondary \{[^}]*background:\s*transparent;[^}]*border:\s*none;/);
  assert.match(css, /\.button-primary:hover, \.button-secondary:hover \{[^}]*background:\s*transparent;/);
  assert.match(css, /\.profile-links a:hover \{[^}]*background:\s*transparent;/);
  assert.doesNotMatch(css, /box-shadow:/);
});

test('prose panels and borderless resource actions retain the content grid', () => {
  assert.match(css, /\.prose \{[^}]*max-width:\s*none;[^}]*width:\s*100%;/);
  assert.match(css, /\.prose > :where\(p, ul, ol, blockquote, pre\) \{[^}]*max-width:\s*68ch;/);
  assert.match(css, /\.musing-prose > :where\(p, ul, ol, blockquote, pre\) \{[^}]*max-width:\s*none;/);
  assert.match(css, /\.research-prose > :where\(p, ul, ol, blockquote, pre\) \{[^}]*max-width:\s*none;/);
  assert.match(css, /\.prose > :first-child \{[^}]*margin-top:\s*0;/);
  assert.match(css, /\.resource-links \.button \{[^}]*padding-inline:\s*0;/);
  assert.match(css, /\.resource-links \.button:hover \{[^}]*background:\s*transparent;/);
});

test('glass surfaces are progressive and respect transparency preferences', () => {
  assert.match(css, /--glass-header:\s*rgba\(255, 255, 255, \.82\)/);
  assert.match(css, /@supports \(\(-webkit-backdrop-filter: blur\(1px\)\) or \(backdrop-filter: blur\(1px\)\)\)/);
  assert.match(css, /backdrop-filter:\s*blur\(22px\) saturate\(150%\)/);
  assert.match(css, /@media \(prefers-reduced-transparency: reduce\)[\s\S]*backdrop-filter:\s*none;/);
  assert.match(css, /@media \(prefers-contrast: more\)[\s\S]*backdrop-filter:\s*none;/);
  assert.match(css, /@media \(forced-colors: active\)[\s\S]*backdrop-filter:\s*none;/);
});

test('content uses flat iOS-style grouped surfaces instead of glass cards', () => {
  assert.match(css, /font-family:\s*'Helvetica Neue', -apple-system/);
  assert.match(css, /\.research-list \{[^}]*gap:\s*0;[^}]*border-block:\s*var\(--hairline\) solid var\(--separator\);/);
  assert.match(css, /\.research-card \{[^}]*border:\s*0;[^}]*border-radius:\s*0;/);
  assert.match(css, /\.publication-list \{[^}]*border-block:[^}]*border-inline:\s*0;[^}]*border-radius:\s*0;/);
  assert.match(css, /\.panel \{[^}]*border-block:[^}]*border-inline:\s*0;[^}]*border-radius:\s*0;/);
  const glassBlock = css.slice(css.indexOf('@supports ((-webkit-backdrop-filter'), css.indexOf('@keyframes menu-reveal'));
  assert.doesNotMatch(glassBlock, /\.research-card|\.publication-list|\.panel|\.illustration-caption/);
});

test('publication rows stay compact without shrinking action targets', () => {
  assert.match(css, /\.publication \{[^}]*padding:\s*1\.125rem 0;/);
  assert.match(css, /\.authors \{[^}]*line-height:\s*1\.5;[^}]*margin-top:\s*\.25rem;/);
  assert.match(css, /\.publication-actions \{[^}]*margin-top:\s*\.125rem;/);
  assert.match(css, /\.publication-actions > a, \.publication-abstract summary \{[^}]*min-height:\s*2\.75rem;/);
  assert.match(css, /\.publication-abstract p \{[^}]*max-width:\s*none;/);
});

test('publication actions use papers, verified code and expandable abstracts', async () => {
  const html = await readFile(resolve(output, 'publications/index.html'), 'utf8');
  assert.equal([...html.matchAll(/<article class="publication publication-no-year">/g)].length, 48);
  assert.equal([...html.matchAll(/>BibTeX<\/a>/g)].length, 48);
  assert.doesNotMatch(html, /Complete BibTeX/);
  assert.match(html, /href="https:\/\/orcid\.org\/0000-0003-3968-1707"[^>]*>\s*ORCID/);
  assert.equal([...html.matchAll(/>Abstract<\/summary>/g)].length, 48);
  assert.equal([...html.matchAll(/>Paper<\/a>/g)].length, 48);
  assert.ok([...html.matchAll(/>Code<\/a>/g)].length >= 16);
  assert.doesNotMatch(html, />Summary<\/summary>|doi\.org\/TBD|href="[^"]*\\_/);
});

test('publication rows render every imported author without visual abbreviation', async () => {
  const html = await readFile(resolve(output, 'publications/index.html'), 'utf8');
  const authorRows = [...html.matchAll(/<p class="authors">([\s\S]*?)<\/p>/g)].map(match => match[1]);
  assert.equal(authorRows.length, 48);
  for (const row of authorRows) assert.doesNotMatch(row, /\bet al\.|\u2026|>others</i);

  const config = await readFile(resolve('src/config.ts'), 'utf8');
  if (!/export const demoContent = true/.test(config)) {
    assert.ok(authorRows.some(row => row.includes('Zhiyong Lu') && row.includes('Chui Ming Gemmy Cheung')));
    assert.ok(authorRows.some(row => row.includes('Pearse Andrew Keane') && row.includes('Siegfried Karl Wagner')));
  }
});

test('mobile navigation expands as a full-width hairline-separated list', () => {
  assert.match(css, /\.header-inner \{[^}]*position:\s*relative;/);
  assert.match(css, /\.mobile-menu \{[^}]*position:\s*static;/);
  assert.match(css, /\.mobile-menu nav \{[^}]*inset-inline:\s*0;[^}]*top:\s*100%;[^}]*width:\s*auto;[^}]*border-radius:\s*0;/);
  assert.match(css, /\.mobile-menu nav a \+ a \{[^}]*border-top:\s*var\(--hairline\) solid var\(--separator\);/);
  assert.match(css, /\.mobile-menu nav a\[aria-current\] \{[^}]*background:\s*transparent;/);
});

test('the responsive profile presents centered links and dot-separated disciplines', () => {
  assert.match(css, /\.discipline-separator\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media \(max-width:\s*56rem\)[\s\S]*?\.discipline br\s*\{[^}]*display:\s*none;/);
  assert.match(css, /@media \(max-width:\s*56rem\)[\s\S]*?\.discipline-separator\s*\{[^}]*display:\s*inline;/);
  assert.match(css, /@media \(max-width:\s*56rem\)[\s\S]*?\.profile-links\s*\{[^}]*justify-content:\s*center;/);
});

const roles = ['canvas', 'surface', 'quiet', 'text', 'secondary', 'accent'];
function paletteFrom(block) {
  return Object.fromEntries(roles.map(role => [role, block.match(new RegExp(`--${role}:\\s*(#[a-f\\d]{6})`, 'i'))[1]]));
}
const palettes = {
  light: paletteFrom(css.slice(css.indexOf(':root {'), css.indexOf('@media'))),
  dark: paletteFrom(css.slice(css.indexOf('@media (prefers-color-scheme: dark)'), css.indexOf('* {'))),
};
function luminance(hex) {
  const rgb = hex.match(/[\da-f]{2}/gi).map(value => Number.parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
test('all text-role combinations exceed 4.5:1 in both palettes', () => {
  for (const [appearance, palette] of Object.entries(palettes)) {
    for (const fg of ['text', 'secondary', 'accent']) {
      for (const bg of ['canvas', 'surface', 'quiet']) {
        const [lighter, darker] = [luminance(palette[fg]), luminance(palette[bg])].sort((a, b) => b - a);
        const ratio = (lighter + .05) / (darker + .05);
        assert.ok(ratio >= 4.5, `${appearance} ${fg}/${bg}: ${ratio.toFixed(2)}`);
        console.log(`${appearance} ${fg}/${bg}: ${ratio.toFixed(2)}:1`);
      }
    }
  }
});
