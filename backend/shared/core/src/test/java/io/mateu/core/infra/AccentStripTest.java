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
