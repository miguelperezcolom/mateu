---
title: "Accent colour and strip"
description: "The decorative band an app gets from its accent colour in the Vaadin renderer: generated from @App(accentColor), your own image, or none."
---

The **accent strip** is a thin decorative band in the app's brand colour, Mateu's take on Redwood's
colour strip. The Vaadin shell draws it where Redwood draws its strip: under a page's header, on top
of a listing's results and at the foot of the welcome hero. It says whose app this is, the way the
accent colour does, and it never means "click here".

![The strip generated for #D2232A, seed 7](/images/docs/branding/accent-strip-D2232A-7.svg)

:::note[Vaadin renderer only]
Everything on this page applies to the Vaadin renderer. The Redwood renderer ignores
`accentStrip`, `accentStripSeed` and the generated strip, and keeps showing its own Spectra strips.
:::

## Three ways to get a strip

The strip follows the app's accent, `@App(accentColor)` (see
[`@App` → Brand accent](/java-ui-definition/annotations/app/#brand-accent)). With no accent there
is no strip at all. With an accent, `accentStrip` decides what the strip looks like.

| `accentStrip` | The strip |
|---|---|
| blank (the default) | **Generated** by Mateu from the accent colour and `accentStripSeed` |
| a URL, e.g. `"/images/strip.svg"` | **Your own image**, repeated along the strip |
| `"none"` | **No drawing**: a plain band in the accent colour |

```java
// generated: the default, nothing else to declare
@App(accentColor = "#D2232A")

// generated, another drawing in the same palette
@App(accentColor = "#D2232A", accentStripSeed = 11)

// your own image
@App(accentColor = "#464c68", accentStrip = "/images/strip.svg")

// a plain band, no drawing
@App(accentColor = "#D2232A", accentStrip = "none")
```

Only a hex accent (`#rgb` or `#rrggbb`) can be drawn. Any other CSS colour, such as
`rgb(210, 35, 42)` or `crimson`, still gives the plain band.

## How the strip is drawn

The generated strip is an SVG, 1440×24 with `preserveAspectRatio="none"`. It uses Redwood's visual
language: hills, arches, peaks and blocks overlapping along the width, with a dot texture on some
hills and a dash texture on some blocks. Its colours are a palette derived from the accent in HLS
(hue, lightness, saturation), where *L* and *S* are the accent's own values:

| Colour | Derivation | Used for |
|---|---|---|
| base | the accent itself | the background |
| dark | lightness × 0.78 | shapes |
| ink | lightness × 0.42, saturation × 0.9 | the dot and dash texture |
| four tints | for f = 0.15, 0.35, 0.58, 0.82: lightness L + (1 − L)·f, saturation min(S, 0.55)·(1 − 0.55·f) | shapes |
| gold | HLS(42°, 0.69, 0.80), the same for every accent | shapes |
| complement | HLS(hue + 180°, 0.71, 0.55) | shapes |

The gold is always present because every Redwood strip carries one. The complement is the accent's
opposite hue, kept soft. For `#D2232A` the palette is base `#d2232a`, dark `#a41b21`, ink `#551215`,
tints `#c7565a` `#cf8386` `#dcb3b4` `#eee0e1`, and accents `#efc971` `#8cdeda`. For an indigo
`#464c68` the same rules give a quieter strip:

![The strip generated for #464c68, seed 7](/images/docs/branding/accent-strip-464c68-7.svg)

The shapes are placed by a seeded random walk. The same accent and seed always give the same strip,
so the strip doesn't change between requests or restarts. Mateu draws it once per accent and seed,
caches it, and sends it to the browser as a `data:image/svg+xml;base64,…` URI.

### Tiling without a seam

The shell repeats the strip along the band and scales it to the band's height, keeping its
proportions. At the shell's 10 px height a 1440×24 strip is 600 px wide, so a wide page shows two or
three copies side by side. To make those copies join invisibly, the generated SVG tiles seamlessly:
every shape that runs past the right edge is also drawn shifted left by the strip's width, and every
shape that runs past the left edge is also drawn shifted right by it. Where one copy ends, the next
continues the same shapes. Stretching a single copy across the page instead would only hide the
seam up to some width, and would squash every shape sideways.

This applies to the generated strip only. An image you declare with `accentStrip` is repeated as it
is, so draw it to tile if the band is wider than the image.

## Picking a seed

`accentStripSeed` defaults to 7. Another seed gives another arrangement of the same palette:

![Seed 7](/images/docs/branding/accent-strip-D2232A-7.svg)
![Seed 8](/images/docs/branding/accent-strip-D2232A-8.svg)
![Seed 11](/images/docs/branding/accent-strip-D2232A-11.svg)

To choose one, export a few strips with the Java helper below, open them side by side and keep the
seed you like. Some arrangements put a large gold or complement shape near the left edge, where it
sits under the page title. If that is distracting, try the next seed.

## Exporting the SVG

The generator is a public helper in `mateu-core`, `io.mateu.core.infra.AccentStrip`. Use it to keep
the strip as a file, for example to serve it as a static image, to edit it by hand, or to use it
outside Mateu:

```java
import io.mateu.core.infra.AccentStrip;
import java.nio.file.Files;
import java.nio.file.Path;

// 1440×24, the size Mateu uses
Files.writeString(Path.of("strip.svg"), AccentStrip.svg("#D2232A", 7));

// another size (height of at least 11)
Files.writeString(Path.of("strip-tall.svg"), AccentStrip.svg("#D2232A", 7, 1440, 48));

// the palette, to reuse its colours elsewhere
AccentStrip.Palette palette = AccentStrip.palette("#D2232A");

// the data URI that the Vaadin shell receives
String uri = AccentStrip.dataUri("#D2232A", 7);
```

An exported file can then be declared as the app's own image with
`@App(accentColor = "#D2232A", accentStrip = "/images/strip.svg")`.

## On the wire

`AppDto.accentStrip` carries only what the app declared, an image URL, or nothing for blank and
`"none"`. The generated strip travels in a separate field, `AppDto.generatedAccentStrip`, that only
the Vaadin shell reads. That keeps the Redwood payload exactly as it was. In the page, the strip
reaches its places through the `--mateu-page-band-h` and `--mateu-page-band-image` custom
properties on `mateu-app`, which an app's own CSS can also set.
