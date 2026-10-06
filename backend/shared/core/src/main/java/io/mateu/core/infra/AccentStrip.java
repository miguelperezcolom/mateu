package io.mateu.core.infra;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * The accent strip — the decorative band Redwood draws under a page's header — generated from one
 * colour, so an app that declares {@code @App(accentColor = "#D2232A")} gets a strip without
 * drawing an image of its own.
 *
 * <p>The strip is drawn in Redwood's visual language (hills, arches, peaks and blocks, some with a
 * dot or dash texture) in a palette derived from the base colour, in HLS:
 *
 * <ul>
 *   <li>{@code base} — the colour itself, the band's background;
 *   <li>{@code dark} — lightness × 0.78;
 *   <li>{@code ink} — lightness × 0.42, saturation × 0.9: the texture;
 *   <li>four {@code tints} of the same hue, at f = 0.15, 0.35, 0.58 and 0.82: lightness L + (1 −
 *       L)·f, saturation min(S, 0.55)·(1 − 0.55·f);
 *   <li>two {@code accents}: a warm gold, HLS(42°, 0.69, 0.80), and the base's complement, HLS(h +
 *       180°, 0.71, 0.55).
 * </ul>
 *
 * <p>The drawing is a seeded random walk along the width, so the same colour, seed and size always
 * give the same strip; another seed gives another strip in the same palette. The result is cached.
 * The strip tiles without a seam: shapes cut by one edge are drawn again, shifted, at the other.
 *
 * <p>To keep the file (to serve it yourself, or to tweak it by hand):
 *
 * <pre>{@code
 * Files.writeString(Path.of("strip.svg"), AccentStrip.svg("#D2232A", 7));
 * }</pre>
 *
 * Only hex colours ({@code #rgb} or {@code #rrggbb}) can be turned into a strip.
 */
public final class AccentStrip {

  /** The seed {@code @App(accentStripSeed)} defaults to. */
  public static final int DEFAULT_SEED = 7;

  public static final int DEFAULT_WIDTH = 1440;
  public static final int DEFAULT_HEIGHT = 24;

  private static final Pattern HEX = Pattern.compile("#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})");
  private static final int CACHE_LIMIT = 256;
  private static final Map<String, String> SVGS = new ConcurrentHashMap<>();
  private static final Map<String, String> DATA_URIS = new ConcurrentHashMap<>();

  private AccentStrip() {}

  /** The strip's colours, all {@code #rrggbb}. */
  public record Palette(
      String base, String dark, String ink, List<String> tints, List<String> accents) {}

  /**
   * True when {@code color} is a colour a strip can be generated from: {@code #rgb}/{@code
   * #rrggbb}.
   */
  public static boolean supports(String color) {
    return color != null && HEX.matcher(color.trim()).matches();
  }

  /** The palette derived from {@code color} (see the class comment). */
  public static Palette palette(String color) {
    var base = normalize(color);
    double[] hls = hexToHls(base);
    double h = hls[0], l = hls[1], s = hls[2];
    var tints = new ArrayList<String>();
    for (double f : new double[] {0.15, 0.35, 0.58, 0.82}) {
      tints.add(hlsToHex(h, l + (1 - l) * f, Math.min(s, 0.55) * (1 - f * 0.55)));
    }
    return new Palette(
        base,
        hlsToHex(h, l * 0.78, s),
        hlsToHex(h, l * 0.42, s * 0.9),
        List.copyOf(tints),
        List.of(hlsToHex(42 / 360.0, 0.69, 0.80), hlsToHex(h + 0.5, 0.71, 0.55)));
  }

  /** The strip for {@code color} and {@code seed}, 1440×24, as an SVG document. */
  public static String svg(String color, int seed) {
    return svg(color, seed, DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  /**
   * The strip for {@code color} and {@code seed} at {@code width}×{@code height} (height at least
   * 11), as an SVG document with {@code preserveAspectRatio="none"}.
   */
  public static String svg(String color, int seed, int width, int height) {
    if (width < 1 || height < 11) {
      throw new IllegalArgumentException("a strip is at least 1×11, not " + width + "×" + height);
    }
    var key = normalize(color) + "|" + seed + "|" + width + "|" + height;
    return cached(SVGS, key, () -> draw(palette(color), seed, width, height));
  }

  /**
   * The 1440×24 strip as a {@code data:image/svg+xml;base64,…} URI, ready for a CSS {@code url()}
   * or an {@code <img src>}; null when {@code color} is not a hex colour.
   */
  public static String dataUri(String color, int seed) {
    if (!supports(color)) return null;
    var key = normalize(color) + "|" + seed;
    return cached(
        DATA_URIS,
        key,
        () ->
            "data:image/svg+xml;base64,"
                + Base64.getEncoder()
                    .encodeToString(svg(color, seed).getBytes(StandardCharsets.UTF_8)));
  }

  private static String cached(
      Map<String, String> cache, String key, java.util.function.Supplier<String> value) {
    var hit = cache.get(key);
    if (hit != null) return hit;
    if (cache.size() >= CACHE_LIMIT) cache.clear();
    var computed = value.get();
    cache.put(key, computed);
    return computed;
  }

  /**
   * One shape of the walk with its texture, drawn already: {@code render(dx)} gives its SVG
   * elements moved {@code dx} to the right. Its horizontal extent is {@code [x0, x1]}.
   */
  private record Motif(double x0, double x1, java.util.function.IntFunction<String> render) {}

  private static String draw(Palette p, int seed, int width, int height) {
    var rnd = new Random(seed);
    int H = height;
    var out = new StringBuilder();
    out.append("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"")
        .append(width)
        .append("\" height=\"")
        .append(H)
        .append("\" viewBox=\"0 0 ")
        .append(width)
        .append(' ')
        .append(H)
        .append("\" preserveAspectRatio=\"none\">\n");
    out.append("<rect width=\"")
        .append(width)
        .append("\" height=\"")
        .append(H)
        .append("\" fill=\"")
        .append(p.base())
        .append("\"/>\n");

    var fills = new ArrayList<String>(p.tints());
    fills.addAll(p.accents());
    fills.add(p.dark());
    int[] weights = {3, 3, 2, 1, 2, 1, 3};
    String[] kinds = {"hill", "hill", "arch", "block", "peak"};

    // SEAMLESS TILING. The strip is a background repeated along x (repeat-x) and scaled to the
    // band's height with its aspect kept (background-size: auto <h>): at the Vaadin shell's 10px a
    // 1440×24 tile is 600 CSS px wide, so a wide page shows two or three tiles side by side. A
    // shape cut by the tile's right edge would end abruptly where the next tile starts afresh: a
    // visible seam. Stretching one tile over the page instead (background-size: 1440px 10px, or a
    // wider
    // aspect) would remove the seam only up to that width and squash every shape sideways, so the
    // drawing is made periodic instead: every motif is also drawn shifted by ±width wherever that
    // copy reaches into the tile. Tile N's right edge then continues exactly into tile N+1's left
    // edge. Each copy is drawn right next to its original, so where shapes overlap they stack in
    // the same order on both sides of the seam.
    int x = -20;
    while (x < width) {
      int w = randint(rnd, 36, 110);
      String fill = fills.get(weighted(rnd, weights));
      String kind = kinds[rnd.nextInt(kinds.length)];
      Motif motif =
          switch (kind) {
            case "hill" -> hill(rnd, p, H, x, w, fill);
            case "arch" -> arch(H, x, w, fill);
            case "block" -> block(rnd, p, H, x, w, fill);
            default -> peak(rnd, H, x, w, fill);
          };
      // every whole-width shift k·width at which the motif shows inside the tile (0 included)
      for (int k = (int) Math.floor(-motif.x1() / width);
          k <= (int) Math.ceil((width - motif.x0()) / width);
          k++) {
        double from = motif.x0() + (double) k * width, to = motif.x1() + (double) k * width;
        if (k == 0 || (to > 0 && from < width)) out.append(motif.render().apply(k * width));
      }
      x += (int) (w * uniform(rnd, 0.35, 0.75));
    }
    out.append("</svg>\n");
    return out.toString();
  }

  private static Motif hill(Random rnd, Palette p, int H, int x, int w, String fill) {
    double top = uniform(rnd, 2, H * 0.45);
    long c1x = r0(x + w * 0.3), c1y = r0(top - 10), c2x = r0(x + w * 0.6), c2y = r0(top + 14);
    long y0 = r0(top + 4), y1 = r0(top + 2);
    var marks = rnd.nextDouble() < 0.7 ? texture(rnd, H, x + 4, x + w - 4, true) : List.<Mark>of();
    return new Motif(
        x,
        x + w,
        dx -> {
          var s = new StringBuilder();
          s.append("<path d=\"M")
              .append(x + dx)
              .append(' ')
              .append(H)
              .append(" L")
              .append(x + dx)
              .append(' ')
              .append(y0)
              .append(" C")
              .append(c1x + dx)
              .append(' ')
              .append(c1y)
              .append(' ')
              .append(c2x + dx)
              .append(' ')
              .append(c2y)
              .append(' ')
              .append(x + w + dx)
              .append(' ')
              .append(y1)
              .append(" L")
              .append(x + w + dx)
              .append(' ')
              .append(H)
              .append(" Z\" fill=\"")
              .append(fill)
              .append("\"/>\n");
          marks.forEach(m -> m.render(s, p, dx));
          return s.toString();
        });
  }

  private static Motif arch(int H, int x, int w, String fill) {
    long cx = r0(x + w / 2.0), cy = r0(H * 1.6);
    return new Motif(
        x,
        x + w,
        dx ->
            "<path d=\"M"
                + (x + dx)
                + " 0 Q"
                + (cx + dx)
                + ' '
                + cy
                + ' '
                + (x + w + dx)
                + " 0 Z\" fill=\""
                + fill
                + "\"/>\n");
  }

  private static Motif block(Random rnd, Palette p, int H, int x, int w, String fill) {
    var marks = rnd.nextDouble() < 0.6 ? texture(rnd, H, x + 2, x + w - 2, false) : List.<Mark>of();
    // a dash may run a little past the block's right side
    double x1 = x + w;
    for (var m : marks) x1 = Math.max(x1, m.x() + m.width());
    return new Motif(
        x,
        x1,
        dx -> {
          var s = new StringBuilder();
          s.append("<rect x=\"")
              .append(x + dx)
              .append("\" y=\"0\" width=\"")
              .append(w)
              .append("\" height=\"")
              .append(H)
              .append("\" fill=\"")
              .append(fill)
              .append("\"/>\n");
          marks.forEach(m -> m.render(s, p, dx));
          return s.toString();
        });
  }

  private static Motif peak(Random rnd, int H, int x, int w, String fill) {
    long px = r0(x + w / 2.0), py = r0(uniform(rnd, 1, H * 0.4));
    return new Motif(
        x,
        x + w,
        dx ->
            "<path d=\"M"
                + (x + dx)
                + ' '
                + H
                + " L"
                + (px + dx)
                + ' '
                + py
                + " L"
                + (x + w + dx)
                + ' '
                + H
                + " Z\" fill=\""
                + fill
                + "\"/>\n");
  }

  /** One dot (on a hill) or dash (on a block) of a texture, in the ink colour. */
  private record Mark(boolean dot, long x, String y, int width) {
    void render(StringBuilder out, Palette p, int dx) {
      if (dot) {
        out.append("<circle cx=\"")
            .append(x + dx)
            .append("\" cy=\"")
            .append(y)
            .append("\" r=\"0.9\" fill=\"")
            .append(p.ink())
            .append("\" opacity=\"0.5\"/>\n");
      } else {
        out.append("<rect x=\"")
            .append(x + dx)
            .append("\" y=\"")
            .append(y)
            .append("\" width=\"")
            .append(width)
            .append("\" height=\"1.4\" fill=\"")
            .append(p.ink())
            .append("\" opacity=\"0.55\"/>\n");
      }
    }
  }

  /** A run of dots (on a hill) or dashes (on a block). */
  private static List<Mark> texture(Random rnd, int H, double x0, double x1, boolean dots) {
    int n = randint(rnd, 6, 12);
    var marks = new ArrayList<Mark>(n);
    for (int i = 0; i < n; i++) {
      if (dots) {
        marks.add(new Mark(true, r0(uniform(rnd, x0, x1)), f1(uniform(rnd, 4, H - 3)), 0));
      } else {
        long mx = r0(uniform(rnd, x0, x1 - 6));
        int my = randint(rnd, 6, H - 5);
        marks.add(new Mark(false, mx, Integer.toString(my), randint(rnd, 4, 10)));
      }
    }
    return marks;
  }

  // ── Python's random, on java.util.Random ─────────────────────────────────────────────────

  /** randint(a, b): a ≤ n ≤ b. */
  private static int randint(Random rnd, int a, int b) {
    return a + rnd.nextInt(b - a + 1);
  }

  /** uniform(a, b): a + (b − a)·random(). */
  private static double uniform(Random rnd, double a, double b) {
    return a + (b - a) * rnd.nextDouble();
  }

  /** choices(population, weights)[0]: the index whose cumulative weight first exceeds r·total. */
  private static int weighted(Random rnd, int[] weights) {
    int total = 0;
    for (int w : weights) total += w;
    double r = rnd.nextDouble() * total;
    int cumulative = 0;
    for (int i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (r < cumulative) return i;
    }
    return weights.length - 1;
  }

  // ── formatting, as Python's "{:.0f}" / "{:.1f}" ─────────────────────────────────────────

  private static long r0(double v) {
    return (long) Math.rint(v);
  }

  private static String f1(double v) {
    return String.format(Locale.ROOT, "%.1f", v);
  }

  // ── colours: Python's colorsys ──────────────────────────────────────────────────────────

  /** {@code #rrggbb}, lower case, from {@code #rgb}/{@code #rrggbb} (the # optional). */
  static String normalize(String color) {
    if (!supports(color)) {
      throw new IllegalArgumentException("not a hex colour: " + color);
    }
    var hex = color.trim().toLowerCase(Locale.ROOT);
    if (hex.startsWith("#")) hex = hex.substring(1);
    if (hex.length() == 3) {
      hex =
          ""
              + hex.charAt(0)
              + hex.charAt(0)
              + hex.charAt(1)
              + hex.charAt(1)
              + hex.charAt(2)
              + hex.charAt(2);
    }
    return "#" + hex;
  }

  private static double[] hexToHls(String hex) {
    double r = Integer.parseInt(hex.substring(1, 3), 16) / 255.0;
    double g = Integer.parseInt(hex.substring(3, 5), 16) / 255.0;
    double b = Integer.parseInt(hex.substring(5, 7), 16) / 255.0;
    double maxc = Math.max(r, Math.max(g, b));
    double minc = Math.min(r, Math.min(g, b));
    double sumc = maxc + minc;
    double rangec = maxc - minc;
    double l = sumc / 2.0;
    if (minc == maxc) return new double[] {0.0, l, 0.0};
    double s = l <= 0.5 ? rangec / sumc : rangec / (2.0 - maxc - minc);
    double rc = (maxc - r) / rangec;
    double gc = (maxc - g) / rangec;
    double bc = (maxc - b) / rangec;
    double h;
    if (r == maxc) h = bc - gc;
    else if (g == maxc) h = 2.0 + rc - bc;
    else h = 4.0 + gc - rc;
    return new double[] {mod1(h / 6.0), l, s};
  }

  private static String hlsToHex(double h, double l, double s) {
    h = mod1(h);
    l = Math.max(0.0, Math.min(1.0, l));
    s = Math.max(0.0, Math.min(1.0, s));
    double r, g, b;
    if (s == 0.0) {
      r = g = b = l;
    } else {
      double m2 = l <= 0.5 ? l * (1.0 + s) : l + s - (l * s);
      double m1 = 2.0 * l - m2;
      r = v(m1, m2, h + 1.0 / 3.0);
      g = v(m1, m2, h);
      b = v(m1, m2, h - 1.0 / 3.0);
    }
    return String.format(
        Locale.ROOT,
        "#%02x%02x%02x",
        (int) Math.rint(r * 255),
        (int) Math.rint(g * 255),
        (int) Math.rint(b * 255));
  }

  private static double v(double m1, double m2, double hue) {
    hue = mod1(hue);
    if (hue < 1.0 / 6.0) return m1 + (m2 - m1) * hue * 6.0;
    if (hue < 0.5) return m2;
    if (hue < 2.0 / 3.0) return m1 + (m2 - m1) * (2.0 / 3.0 - hue) * 6.0;
    return m1;
  }

  /** Python's {@code x % 1.0}: always in [0, 1). */
  private static double mod1(double x) {
    double m = x % 1.0;
    return m < 0 ? m + 1.0 : m;
  }
}
