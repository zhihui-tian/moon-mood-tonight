# Moon Mood Tonight

Classical Chinese poetry for the way you feel tonight.

Moon Mood Tonight is a bilingual digital exhibition that begins with a feeling.
Choose one of eight moods and receive a weighted, non-repeating recommendation
from a collection of 300 classical Chinese poems.

## What is included

- 300 poems: 28 original curated entries plus 272 works from the classic
  *Three Hundred Tang Poems* anthology
- eight overlapping moods: Stillness, Longing, Solitude, Melancholy, Joy,
  Courage, Nostalgia, and Wonder
- Chinese originals with attributed English literary renderings
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

## Editorial and source note

The first 28 mood assignments are individually curated. The Tang anthology
expansion uses transparent thematic rules to create overlapping mood weights;
these are editorial discovery aids rather than definitive literary labels.
Long poems may be presented as clearly marked curated passages.

The first 28 English versions are new literary renderings made for this
edition. The 272-poem Tang expansion uses Witter Bynner translations from the
1929 edition of *The Jade Mountain*, transcribed in the University of Virginia
Chinese Text Initiative's digital edition of *Three Hundred Tang Poems*.
Translations that the source identifies as coming from later copyrighted
editions are deliberately excluded.

Source collection:
https://cti.lib.virginia.edu/tangeng.html

## Licenses

- Software: [MIT License](LICENSE)
- Original Moon Mood Tonight translations and visual interpretations:
  [Creative Commons Attribution 4.0 International](CONTENT-LICENSE.md)
- Witter Bynner translations first published in 1929: public domain in the
  United States
- Classical Chinese source poems: public domain

The ten original ink-wash landscapes are reused from *Ten Poems Under One Moon*
under CC BY 4.0.
