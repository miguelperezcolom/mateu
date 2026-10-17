package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** The layout a {@code DocumentRenderer} receives: a usable page whatever the caller left out. */
class PageSetupTest {

  @Test
  void aSparseSetupIsA4WithTheDefaultMargin() {
    var setup = new PageSetup(null, false, 0, null, null, null);

    assertThat(setup.paper()).isEqualTo(PageSetup.Paper.A4);
    assertThat(setup.marginMm()).isEqualTo(18f);
    assertThat(new PageSetup(null, false, -3, null, null, null).marginMm()).isEqualTo(18f);
  }

  @Test
  void thePresetsArePortraitWithPageNumbers() {
    assertThat(PageSetup.a4())
        .isEqualTo(new PageSetup(PageSetup.Paper.A4, false, 18, null, null, "||{page} / {pages}"));
    assertThat(PageSetup.letter().paper()).isEqualTo(PageSetup.Paper.LETTER);
    assertThat(PageSetup.letter().footer()).isEqualTo(PageSetup.PAGE_NUMBERS);
  }

  @Test
  void eachWitherChangesOnlyItsOwnPart() {
    var setup =
        PageSetup.a4()
            .withLandscape(true)
            .withMarginMm(10)
            .withTitle("Invoice")
            .withHeader("ACME||{title}")
            .withFooter(null);

    assertThat(setup)
        .isEqualTo(new PageSetup(PageSetup.Paper.A4, true, 10, "Invoice", "ACME||{title}", null));
  }

  @Test
  void paperSizesAreInPostScriptPoints() {
    assertThat(PageSetup.Paper.A4.widthPt()).isEqualTo(595.28f);
    assertThat(PageSetup.Paper.A4.heightPt()).isEqualTo(841.89f);
    assertThat(PageSetup.Paper.LETTER.widthPt()).isEqualTo(612f);
    assertThat(PageSetup.Paper.LETTER.heightPt()).isEqualTo(792f);
  }
}
