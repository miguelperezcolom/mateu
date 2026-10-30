---
title: "Multimedia content"
---

Redwood's **Multimedia content page** gathers content with media assets in sections — text, images,
video — under a welcome-style banner, with a vertical anchor navigator to move between the sections.
It belongs to the *Overview* category: a page to read and explore (a film, a product story, a
release's notes).

## In YAML

A `type: Form` fills it with `template: {type: MultimediaContentPage}`: the banner is the form's own
header — `title`, `subtitle` (the description), `overline`, and its `toolbar` as the calls to action
(a `primary` one first) —, the template's `backgroundColor` is Spectra's (`dark-ocean` … or the bare
tone), and the form's `content` is the sections — see
[Page templates](/define/yaml/pages/#page-templates--template).

```yaml
type: Form
title: ${state.title}
overline: Episode ${state.episodeId}
subtitle: Directed by ${state.director}
toolbar:
  - {type: Button, label: Edit, buttonStyle: primary, actionable: {type: RouteLink, route: "films/${state.id}/edit"}}
template:
  type: MultimediaContentPage
  backgroundColor: dark-ocean
content:
  - type: Card
    cssClasses: mateu-section
    title: {type: Text, container: h3, text: Opening crawl}
    content: {type: Text, text: "${state.openingCrawl}"}
  - type: Card
    cssClasses: mateu-section
    title: {type: Text, container: h3, text: Poster}
    content: {type: Image, src: "${state.image}"}
```

## Redwood

Spectra's pack (2604) has no `oj-sp-multimedia-content-page` component, so the Redwood renderer
composes the template from Spectra's own pieces: the banner is `oj-sp-header-welcome-banner` (the
same banner as the welcome page, with its illustration or themed image), above the page; each
section is `oj-sp-section`; the index is the vertical anchor navigator Mateu mirrors for `@Toc` — on
a multimedia content page it is always shown, whatever the number of sections. Other renderers draw
the banner as a hero over the sections.
