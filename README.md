# Benjamin Hou — Academic Website

Source for Benjamin Hou's academic website at
[farrell236.github.io](https://farrell236.github.io/). The site presents research,
publications, academic activities and occasional project notes.

The site is built with Astro from the Clearform Academic theme. Content and
theme implementation remain separated through Clearform's versioned content
contract; see [THEME.md](THEME.md) and [EDITING.md](EDITING.md) before making
structural changes.

## Local development

Use Node.js 22.13 or later and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server runs at <http://127.0.0.1:4326/>. Run the complete check
before committing:

```sh
pnpm verify
```

## Content map

- `src/config.ts`: identity, profile links and navigation.
- `src/data/pages.ts`: homepage, About and academic activities.
- `src/data/research.ts`: research groupings, summaries and artwork crops.
- `public/citations/`: one BibTeX record per publication.
- `public/files/references.bib`: complete publication library.
- `src/content/research/`: retained project-page content.
- `src/content/writing/`: Musings entries.
- `src/styles/theme.css`: colour, typography and shape tokens.
- `src/styles/global.css`: layout, responsive and accessibility rules.

See [EDITING.md](EDITING.md) for detailed update procedures.

## Deployment

Pushing `main` runs `.github/workflows/deploy-pages.yml`. The workflow verifies
the site, builds it with `SITE_URL=https://farrell236.github.io`, `ASTRO_BASE=/`
and `PUBLIC_IS_PREVIEW=false`, then publishes the generated `dist/` directory
through GitHub Pages.

The repository must be named `farrell236.github.io` and Pages must use GitHub
Actions as its deployment source for the root URL to work.

## License and attribution

The Clearform-derived implementation is distributed under
[GPL-3.0-or-later](LICENSE). [ATTRIBUTION.md](ATTRIBUTION.md) records the design
references, AI-assisted development and sources for research-paper figures.

Personal biographical material, the CV, portrait and publication content are
provided for this website and are not intended as generic template content.
