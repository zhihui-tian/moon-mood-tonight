# Moon Mood Tonight

Classical Chinese poetry for the way you feel tonight.

Moon Mood Tonight is a bilingual digital exhibition that begins with a feeling.
Choose one of eight moods and receive a weighted, non-repeating recommendation
from a growing collection of classical Chinese poems.

## What is included

- 28 curated poems spanning the *Book of Songs*, Han, Jin, Tang, and Song
- eight overlapping moods: Stillness, Longing, Solitude, Melancholy, Joy,
  Courage, Nostalgia, and Wonder
- Chinese originals and new English literary renderings
- short historical context and an explanation of each mood relationship
- stable, shareable pages for every poem
- weighted recommendations that avoid recently viewed poems on the same device
- collection filters for mood, poet, dynasty, theme, title, and Chinese text
- responsive, accessible presentation with reduced-motion support

The earlier
[Ten Poems Under One Moon](https://github.com/zhihui-tian/ten-poems-under-one-moon)
project remains a separate exhibition and visual reference. It is not modified
by this repository.

## Structure

```text
app/
  mood/[mood]/       mood landing pages
  poems/[slug]/      stable poem pages
  explore/           collection filters
  about/             editorial method
components/          interactive reading and recommendation components
content/poems/       static, version-controlled poem content
lib/                 moods, content access, and weighted recommendation logic
public/poems/        unified ink-wash landscapes
```

The content remains static and version-controlled. A database is intentionally
not required for this phase; recent reading history is stored locally in the
reader’s browser.

## Development

Requires Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Create and validate a production build:

```bash
pnpm test
```

## Editorial note

Mood assignments and weights are editorial judgments, not automated sentiment
labels. Long poems may be presented as clearly marked curated passages.

The English versions are new literary renderings made for this edition. They
are not copied from published translations.

## Licenses

- Software: [MIT License](LICENSE)
- English translations and visual interpretations:
  [Creative Commons Attribution 4.0 International](CONTENT-LICENSE.md)
- Classical Chinese source poems: public domain

The ten original ink-wash landscapes are reused from *Ten Poems Under One Moon*
under CC BY 4.0.
