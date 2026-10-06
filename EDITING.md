# Website maintenance guide

This guide covers routine maintenance for Benjamin Hou's personal academic
website. The site separates authored content from the Clearform-derived visual
theme so that most updates do not require changing page components.

## 1. Repository structure

| Content | Edit |
| --- | --- |
| Identity, portrait, CV, external links and navigation | [`src/config.ts`](src/config.ts) |
| Homepage, About and Academic page text | [`src/data/pages.ts`](src/data/pages.ts) |
| Research entries, themes and image crops | [`src/data/research.ts`](src/data/research.ts) |
| Complete bibliography | [`public/files/references.bib`](public/files/references.bib) |
| Individual publication records | [`public/citations/`](public/citations/) |
| Musings articles | [`src/content/writing/`](src/content/writing/) |
| Research-page drafts | [`src/content/research/`](src/content/research/) |
| Colours and visual tokens | [`src/styles/theme.css`](src/styles/theme.css) |
| Layout and responsive styling | [`src/styles/global.css`](src/styles/global.css) |
| GitHub Pages deployment | [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) |

Do not manually edit `dist/`, `.astro/` or `node_modules/`. They are generated
and can be replaced at any time.

## 2. Start a maintenance session

Open a terminal and run:

```sh
cd /Users/houbb/Documents/website-v2
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:4326/>. The port is deliberately fixed at `4326`.
Astro normally refreshes the browser when a source file is saved.

`pnpm install --frozen-lockfile` is only required after cloning the repository
or when the dependency manifest or lockfile changes.

## 3. Finish and publish an update

Before committing, run:

```sh
pnpm verify
git diff --check
git status --short
git diff
```

If everything is correct, stage only the files intended for the update:

```sh
git add src/data/pages.ts
git commit -m "Update academic activities"
git push origin main
```

Adjust the staged paths and commit message for the actual change. A push to
`main` automatically installs the locked dependencies, checks the Astro and
TypeScript source, builds every route, runs the site tests and deploys the
generated site to <https://farrell236.github.io/>.

Monitor deployments on the repository's
[GitHub Actions page](https://github.com/farrell236/farrell236.github.io/actions).

The remotes have distinct purposes:

- `origin` is the personal website repository and accepts pushes.
- `upstream` is the generic Clearform theme and is deliberately fetch-only.

Never push personal content to `upstream`.

## 4. Update identity, links, CV or portrait

Edit [`src/config.ts`](src/config.ts). The principal fields are:

```text
profile.name
profile.discipline
profile.introduction
profile.email
profile.portrait
profile.portraitAlt
profile.cv
profile.orcid
profile.links
```

The disciplines are separated using ` · ` because the responsive profile
splits that string into separate items.

### Replace the portrait

The simplest method is to replace `public/images/benjamin-hou.jpg` while
keeping the filename unchanged. Prefer a square, compressed JPEG or WebP image
of at least 400 × 400 pixels. If the filename changes, update
`profile.portrait` and `profile.portraitAlt` in `src/config.ts`.

### Replace the CV

Replace `public/files/benjamin-hou-cv.pdf`. Keeping the filename means no source
change is required. If it changes, update `profile.cv` in `src/config.ts`.
Always open the local CV link after replacing the file.

## 5. Maintain the homepage

Edit the `homePage` object in [`src/data/pages.ts`](src/data/pages.ts).

### Headline and introduction

```ts
title: ['Machine Learning for', 'Bioinformatics'],
lede: '...',
```

The two title strings produce the intentional line break.

### Primary actions

The two homepage actions are configured with `primaryAction` and
`secondaryAction`. Local routes should begin and end with `/`, for example:

```ts
href: '/publications/'
```

### Selected publications

The homepage publication list is manually curated in:

```text
homePage.publications
```

It is not automatically selected from the complete bibliography. Update each
item's `year`, `title`, `authors`, `venue` and optional `href`. The full
Publications page remains generated from BibTeX.

### Selected research

Homepage research cards come from entries in `src/data/research.ts` where:

```ts
selected: true
```

The current layout and tests expect three selected research entries.

### Musings

The homepage displays the newest published Musings entries. The number shown is
controlled by:

```ts
writingLimit: 2
```

## 6. Update the About page

Edit `aboutPage` in [`src/data/pages.ts`](src/data/pages.ts). Important fields
include:

```text
introduction
biography
researchAreas
contactTitle
contactText
```

Each biography paragraph is a separate string in the array. Each research area
uses this shape:

```ts
{
  label: 'Medical imaging',
  title: 'Quantitative image analysis',
  description: '...',
}
```

Keep commas, quotes and brackets intact. `pnpm verify` identifies most
structural errors.

## 7. Update Academic activities

Edit `academicPage` in [`src/data/pages.ts`](src/data/pages.ts).

### Professional service

Add or edit objects under `academicPage.service`. Optional links use:

```ts
href: 'https://...',
linkLabel: 'Proceedings',
```

### Talks

Talks use:

```ts
{
  year: '2026',
  title: 'Talk title',
  context: 'Institution or event',
}
```

### Mentoring and teaching

The teaching section supports the established `projects`, `supervision` and
`courses` forms. Copy the nearest existing object of the same type rather than
inventing a new structure.

## 8. Add or update publications

The recommended source of truth is
[`public/files/references.bib`](public/files/references.bib).

### Recommended process

1. Add or update the entry in `references.bib`.
2. Keep the BibTeX citation key stable.
3. Regenerate and verify the publication files:

```sh
pnpm import:publications
pnpm verify
```

The importer deletes and recreates the generated files in `public/citations/`.
Review the resulting Git diff before committing. Any field that must survive
regeneration must also exist in `references.bib`.

### Required BibTeX fields

Every entry needs `author`, `title` and `year`, plus at least one venue field,
normally `journal` or `booktitle`:

```bibtex
@article{stableCitationKey,
  author = {Benjamin Hou and Coauthor Name},
  title = {Full Publication Title},
  journal = {Journal Name},
  year = {2026}
}
```

Do not shorten the list with `and others`; the site intentionally renders
complete author lists.

### Paper and resource links

The Paper action prefers sources in this order:

1. Publisher DOI
2. Official non-arXiv URL
3. arXiv entry
4. Any other available URL

Useful optional fields include:

```bibtex
doi = {10.xxxx/...},
url = {https://...},
eprint = {2601.12345},
archiveprefix = {arXiv},
code = {https://github.com/...},
slides = {https://...},
abstract = {Full abstract text.}
```

The BibTeX download action is added automatically.

### Publication ordering

The order of entries within each year in `references.bib` becomes
`YYYY-01-...`, `YYYY-02-...` and so on. The website displays newer years first,
then the numbered order within each year.

### Research citation keys

Research entries refer to BibTeX keys, for example:

```ts
citationKey: 'hou2025one'
```

If a key changes in the bibliography, update every matching reference in
`src/data/research.ts` and `src/content/research/`.

## 9. Add a research paper

Research cards are defined in [`src/data/research.ts`](src/data/research.ts).
The paper must already exist in the bibliography, and Benjamin Hou must be its
first author exactly as configured in `profile.name`.

An entry looks like:

```ts
{
  citationKey: 'citationKeyFromBibTeX',
  summary: 'One concise sentence describing the contribution.',
  image: {
    src: '/images/research/example.webp',
    alt: 'Accessible description of the visible figure.',
    credit: 'Cropped from Figure 2 of the paper.',
    sourceUrl: 'https://original-paper-source',
    scale: 1,
    focus: '50% 50%',
  },
  theme: 'multimodal-clinical-ai',
  selected: false,
}
```

### Research themes

The available themes are declared at the top of `src/data/research.ts`:

- `quantitative-clinical-imaging`
- `multimodal-clinical-ai`
- `generative-medical-imaging`
- `spatial-reasoning-reconstruction`

To add a theme, add it to `researchThemes` and use its exact `id` in entries.

### Research images

Store research artwork in [`public/images/research/`](public/images/research/)
and use WebP when possible.

The image controls are:

- `scale`: zoom level.
- `focus`: zoom origin, such as `'70% 50%'`.
- `position`: optional alignment adjustment.
- `clip`: optional inset for isolating one panel.
- `fit: 'contain'`: show the whole image instead of filling the frame.

Start with:

```ts
scale: 1,
focus: '50% 50%',
```

Then adjust the card visually in the browser. Every image should have useful
alternative text, a figure credit, the original paper URL and a corresponding
entry in [`ATTRIBUTION.md`](ATTRIBUTION.md). Do not publish identifiable patient
data or material without appropriate permission.

### Research verification expectations

The current test suite records the expected eleven research cards, number of
papers within each theme, three homepage cards, distinct WebP images and
disabled Explore project controls.

When intentionally adding or removing research entries, update the matching
expected titles and counts in
[`scripts/check-site.test.mjs`](scripts/check-site.test.mjs). Preserve the
underlying validation instead of deleting it.

The existing Markdown project pages remain available for future development,
but the Explore project controls are intentionally disabled until their design
and scope are decided.

## 10. Add a Musing

Copy [`src/content/templates/writing.md`](src/content/templates/writing.md) to a
new lowercase, hyphenated filename such as:

```text
src/content/writing/my-new-article.md
```

Use frontmatter like:

```yaml
---
title: My article title
description: One sentence used in listings and metadata.
published: 2026-10-05
category: Research notes
draft: true
archived: false
---
```

Write the article below the closing `---`. Keep `draft: true` while editing and
change it to `false` when the article is ready to publish. Use `archived: true`
only when an article should remain available with an archival warning.

The filename determines the URL:

```text
/writing/my-new-article/
```

## 11. Adjust colours or styling

For colour, typography and shape changes, start with
[`src/styles/theme.css`](src/styles/theme.css). The safest variables are:

```css
--canvas
--surface
--text
--secondary
--accent
--separator
--quiet
--radius
--control-radius
```

There are separate light and dark palettes. Check both. Use
[`src/styles/global.css`](src/styles/global.css) only for structural changes
such as widths, spacing, grids, responsive rules or component layouts.

Always run `pnpm verify` after colour changes. The checks enforce a minimum
4.5:1 contrast ratio for the tested text combinations.

## 12. Social preview, favicon and other assets

The social preview files are:

- `public/social-preview.svg`
- `public/social-preview.png`

Keep them synchronized. The PNG should remain 1200 × 630 pixels. The favicon is
`public/favicon.svg`.

After changing these assets, use a hard refresh when checking them. Social
networks may retain an older preview until their caches expire.

## 13. Safely receive Clearform updates

The generic theme remains available through the fetch-only `upstream` remote.
Inspect updates without changing the working site:

```sh
cd /Users/houbb/Documents/website-v2
git fetch upstream
git log --oneline main..upstream/main
git diff --stat main..upstream/main
```

Before applying a theme update, create a dedicated branch:

```sh
git switch -c maintenance/clearform-update
```

Review upstream changes carefully. Preserve the content-owned paths:

- `src/config.ts`
- `src/data/pages.ts`
- `src/data/research.ts`
- `src/content/`
- `public/citations/`
- `public/files/`
- Personal images

Do not blindly overwrite those paths with generic template content. Run
`pnpm verify` after resolving an update and inspect every page before merging it
into `main`. If a merge produces substantial content conflicts, stop and seek
help rather than discarding files or using `git reset --hard`.

## 14. Recovery and troubleshooting

### The development server will not start

Confirm the installed versions:

```sh
node --version
pnpm --version
```

The project expects Node.js 22.13 or newer and pnpm 11. Check whether another
process already owns the fixed port:

```sh
lsof -nP -iTCP:4326 -sTCP:LISTEN
```

### Generated state appears stale

From the project directory, remove only the generated directories and rebuild:

```sh
rm -rf dist .astro
pnpm verify
```

Never delete `src/`, `public/`, `package.json` or `pnpm-lock.yaml` as cleanup.

### A publication fails verification

Check that:

- The filename year matches the BibTeX `year`.
- Each generated citation file contains exactly one entry.
- Citation keys are unique.
- Authors are separated using `and`.
- A venue field exists.
- The complete library and generated citation files contain the same entries.

### Local verification succeeds but deployment fails

1. Open the failed run on
   [GitHub Actions](https://github.com/farrell236/farrell236.github.io/actions).
2. Expand the first failed step.
3. Reproduce and fix that exact error locally.
4. Run `pnpm verify` again.
5. Commit and push the correction.

### Deployment succeeds but an old page remains visible

GitHub Pages and browser caches may take a short time to update. Wait for the
workflow to finish, then hard-refresh the live page.

## 15. Checklist for every update

Before pushing:

- Pull the latest `main`.
- Make one category of change at a time.
- Review the page locally at port `4326`.
- Check desktop and narrow/mobile widths.
- Check light and dark appearance.
- Test every new external link.
- Run `pnpm verify`.
- Review `git diff` and `git status`.
- Confirm no `.env`, credentials, patient information or private documents are
  staged.
- Use a descriptive commit message.
- Push to `origin main`.
- Confirm the GitHub Actions deployment succeeds.
- Check the live site at <https://farrell236.github.io/>.
