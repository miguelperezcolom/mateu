package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;

/**
 * The accent strip Mateu draws from {@code @App(accentColor)}: a port of ec-demo1's
 * deploy/branding/strip.py. The palette must match the Python formulas; the drawing must be
 * deterministic per (colour, seed, size) — not byte-identical to Python's, whose random differs.
 */
class AccentStripTest {

  @Test
  void thePaletteMatchesTheReferenceForABrandRed() {
    // python3 -c "import strip; print(strip.palette('#D2232A'))"
    var p = AccentStrip.palette("#D2232A");
    assertThat(p.base()).isEqualTo("#d2232a");
    assertThat(p.dark()).isEqualTo("#a41b21");
    assertThat(p.ink()).isEqualTo("#551215");
    assertThat(p.tints()).containsExactly("#c7565a", "#cf8386", "#dcb3b4", "#eee0e1");
    assertThat(p.accents()).containsExactly("#efc971", "#8cdeda");
  }

  @Test
  void thePaletteMatchesTheReferenceForAnIndigo() {
    // python3 -c "import strip; print(strip.palette('#464c68'))"
    var p = AccentStrip.palette("#464c68");
    assertThat(p.base()).isEqualTo("#464c68");
    assertThat(p.dark()).isEqualTo("#373b51");
    assertThat(p.ink()).isEqualTo("#1e202b");
    assertThat(p.tints()).containsExactly("#5c6384", "#8187a3", "#afb2c2", "#dedfe4");
    assertThat(p.accents()).containsExactly("#efc971", "#decf8c");
  }

  @Test
  void shortHexAndCaseAndSpacesAreTheSameColour() {
    assertThat(AccentStrip.palette(" #ABC ")).isEqualTo(AccentStrip.palette("#aabbcc"));
    assertThat(AccentStrip.svg("#D2232A", 7)).isEqualTo(AccentStrip.svg("#d2232a", 7));
  }

  @Test
  void theSameInputAlwaysGivesTheSameStrip() {
    assertThat(AccentStrip.svg("#D2232A", 7)).isEqualTo(AccentStrip.svg("#D2232A", 7));
    // also bypassing the cache: another size is computed afresh, twice
    assertThat(AccentStrip.svg("#D2232A", 7, 800, 30))
        .isEqualTo(AccentStrip.svg("#D2232A", 7, 800, 30));
  }

  @Test
  void anotherSeedOrColourGivesAnotherStrip() {
    assertThat(AccentStrip.svg("#D2232A", 7)).isNotEqualTo(AccentStrip.svg("#D2232A", 8));
    assertThat(AccentStrip.svg("#D2232A", 7)).isNotEqualTo(AccentStrip.svg("#464c68", 7));
  }

  @Test
  void itIsAValidSvgOfTheRightSizeDrawnInThePalette() throws Exception {
    var svg = AccentStrip.svg("#D2232A", 7);
    var factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    var doc =
        factory
            .newDocumentBuilder()
            .parse(new ByteArrayInputStream(svg.getBytes(StandardCharsets.UTF_8)));
    Element root = doc.getDocumentElement();
    assertThat(root.getLocalName()).isEqualTo("svg");
    assertThat(root.getNamespaceURI()).isEqualTo("http://www.w3.org/2000/svg");
    assertThat(root.getAttribute("width")).isEqualTo("1440");
    assertThat(root.getAttribute("height")).isEqualTo("24");
    assertThat(root.getAttribute("viewBox")).isEqualTo("0 0 1440 24");
    assertThat(root.getAttribute("preserveAspectRatio")).isEqualTo("none");
    // the background in the base colour, then shapes walking along the whole width
    var first = (Element) doc.getElementsByTagName("rect").item(0);
    assertThat(first.getAttribute("fill")).isEqualTo("#d2232a");
    assertThat(doc.getElementsByTagName("path").getLength()).isGreaterThan(15);
    var palette = AccentStrip.palette("#D2232A");
    var allowed = new java.util.HashSet<>(List.of(palette.base(), palette.dark(), palette.ink()));
    allowed.addAll(palette.tints());
    allowed.addAll(palette.accents());
    var fills = java.util.regex.Pattern.compile("fill=\"(#[0-9a-f]{6})\"").matcher(svg);
    while (fills.find()) {
      assertThat(allowed).contains(fills.group(1));
    }
    // reasonable for a data URI on every app payload (the Python one is ~9 KB)
    assertThat(svg.length()).isBetween(2_000, 20_000);
  }

  /**
   * The strip is repeated along x, so tile N's right edge meets tile N+1's left edge: whatever is
   * drawn across x = width must be drawn, identically and stacked in the same order, across x = 0
   * shifted by −width — and the other way round. Checked on the SVG's elements, without rendering:
   * the shapes covering x = width, moved by −width, are exactly the shapes covering x = 0.
   */
  @Test
  void theStripTilesWithoutASeam() {
    for (var color : List.of("#D2232A", "#464c68", "#0a7")) {
      for (int seed : new int[] {1, 7, 8, 11, 42, 1234}) {
        for (int[] size : new int[][] {{1440, 24}, {800, 30}, {100, 24}, {60, 11}}) {
          int width = size[0];
          var svg = AccentStrip.svg(color, seed, size[0], size[1]);
          var shapes = shapes(svg);
          var atRightEdge =
              shapes.stream().filter(s -> s.covers(width)).map(s -> s.shifted(-width)).toList();
          var atLeftEdge = shapes.stream().filter(s -> s.covers(0)).map(Shape::text).toList();
          assertThat(atRightEdge)
              .as("%s seed %d at %d×%d", color, seed, size[0], size[1])
              .isEqualTo(atLeftEdge);
        }
      }
    }
    // and there is something to check: the default strip has shapes across both edges
    var shapes = shapes(AccentStrip.svg("#D2232A", 7));
    assertThat(shapes.stream().filter(s -> s.covers(0))).isNotEmpty();
    assertThat(shapes.stream().filter(s -> s.covers(1440))).isNotEmpty();
  }

  /** The original drawing is kept: the seam fix only adds the wrapped copies. */
  @Test
  void theWrappedCopiesOnlyAddToTheDrawing() {
    var shapes = shapes(AccentStrip.svg("#D2232A", 7));
    // the walk starts at x = −20: the first shape is cut by the left edge, and its copy shifted by
    // +width closes the right edge
    assertThat(shapes.get(0).text())
        .isEqualTo("<path d=\"M-20 24 L28 4 L77 24 Z\" fill=\"#efc971\"/>");
    assertThat(shapes.get(1).text()).isEqualTo(shapes.get(0).shifted(1440));
  }

  /** An SVG element of the strip with the x coordinates it is drawn at. */
  private record Shape(String text, double x0, double x1) {
    boolean covers(double x) {
      return x0 < x && x < x1;
    }

    /** The element's text with every x coordinate moved by dx. */
    String shifted(int dx) {
      var m = java.util.regex.Pattern.compile("(d|x|cx)=\"([^\"]*)\"").matcher(text);
      var out = new StringBuilder();
      while (m.find()) {
        String moved;
        if (m.group(1).equals("d")) {
          // M x y L x y C x y x y x y … Q x y x y: the numbers alternate x, y
          var parts = m.group(2).split(" ");
          var numbers = 0;
          for (int i = 0; i < parts.length; i++) {
            var token = parts[i];
            var command = token.matches("^[A-Z].*") ? token.substring(0, 1) : "";
            var number = token.substring(command.length());
            if (number.isEmpty()) continue;
            if (numbers++ % 2 == 0) number = Long.toString(Long.parseLong(number) + dx);
            parts[i] = command + number;
          }
          moved = String.join(" ", parts);
        } else {
          moved = Long.toString(Long.parseLong(m.group(2)) + dx);
        }
        m.appendReplacement(
            out, java.util.regex.Matcher.quoteReplacement(m.group(1) + "=\"" + moved + "\""));
      }
      m.appendTail(out);
      return out.toString();
    }
  }

  /** The strip's shapes (the background excluded), in drawing order. */
  private static List<Shape> shapes(String svg) {
    var shapes = new java.util.ArrayList<Shape>();
    for (var line : svg.split("\n")) {
      if (!line.startsWith("<path")
          && !line.startsWith("<rect x=")
          && !line.startsWith("<circle")) {
        continue;
      }
      double x0, x1;
      if (line.startsWith("<path")) {
        var d = line.replaceAll(".* d=\"([^\"]*)\".*", "$1").replaceAll("[A-Z]", "").trim();
        var numbers = d.split("\\s+");
        x0 = Double.MAX_VALUE;
        x1 = -Double.MAX_VALUE;
        for (int i = 0; i < numbers.length; i += 2) {
          var x = Double.parseDouble(numbers[i]);
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
        }
      } else if (line.startsWith("<rect")) {
        x0 = Double.parseDouble(line.replaceAll(".* x=\"([^\"]*)\".*", "$1"));
        x1 = x0 + Double.parseDouble(line.replaceAll(".* width=\"([^\"]*)\".*", "$1"));
      } else {
        var cx = Double.parseDouble(line.replaceAll(".* cx=\"([^\"]*)\".*", "$1"));
        x0 = cx - 0.9;
        x1 = cx + 0.9;
      }
      shapes.add(new Shape(line, x0, x1));
    }
    return shapes;
  }

  @Test
  void theDataUriIsTheSvgInBase64() {
    var uri = AccentStrip.dataUri("#D2232A", 7);
    assertThat(uri).startsWith("data:image/svg+xml;base64,");
    var decoded =
        new String(
            Base64.getDecoder().decode(uri.substring("data:image/svg+xml;base64,".length())),
            StandardCharsets.UTF_8);
    assertThat(decoded).isEqualTo(AccentStrip.svg("#D2232A", 7));
    assertThat(AccentStrip.dataUri("#D2232A", 7)).isSameAs(uri); // cached
  }

  @Test
  void onlyHexColoursCanBeDrawn() {
    assertThat(AccentStrip.dataUri("rgb(210, 35, 42)", 7)).isNull();
    assertThat(AccentStrip.dataUri("red", 7)).isNull();
    assertThat(AccentStrip.dataUri(null, 7)).isNull();
    assertThatThrownBy(() -> AccentStrip.svg("red", 7))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> AccentStrip.svg("#D2232A", 7, 100, 5))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
