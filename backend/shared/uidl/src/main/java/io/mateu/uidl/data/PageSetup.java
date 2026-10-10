package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How a {@link io.mateu.uidl.interfaces.DocumentRenderer} lays a document out: paper, orientation,
 * margins and the running header and footer.
 *
 * <p>The header and footer are plain text repeated on every page; {@code {page}}, {@code {pages}}
 * and {@code {title}} are replaced by the page number, the page count and {@code title}. Each may
 * hold up to three parts separated by {@code |} — left, centre and right ({@code "ACME Hotels||Page
 * {page} of {pages}"}).
 *
 * @param paper the paper size
 * @param landscape whether the long edge runs horizontally
 * @param marginMm the margin on every side, in millimetres
 * @param title the document title (PDF metadata and the {@code {title}} placeholder)
 * @param header the running header, or null for none
 * @param footer the running footer, or null for none
 */
@Experimental("documents API, 2026-10")
public record PageSetup(
    Paper paper, boolean landscape, float marginMm, String title, String header, String footer) {

  /** Paper sizes, in PostScript points (1/72 inch). */
  public enum Paper {
    A4(595.28f, 841.89f),
    LETTER(612f, 792f);

    private final float widthPt;
    private final float heightPt;

    Paper(float widthPt, float heightPt) {
      this.widthPt = widthPt;
      this.heightPt = heightPt;
    }

    public float widthPt() {
      return widthPt;
    }

    public float heightPt() {
      return heightPt;
    }
  }

  /** The default footer: the page number on the right. */
  public static final String PAGE_NUMBERS = "||{page} / {pages}";

  public PageSetup {
    if (paper == null) {
      paper = Paper.A4;
    }
    if (marginMm <= 0) {
      marginMm = 18;
    }
  }

  /** A4 portrait, 18 mm margins, page numbers in the footer. */
  public static PageSetup a4() {
    return new PageSetup(Paper.A4, false, 18, null, null, PAGE_NUMBERS);
  }

  /** US Letter portrait, 18 mm margins, page numbers in the footer. */
  public static PageSetup letter() {
    return new PageSetup(Paper.LETTER, false, 18, null, null, PAGE_NUMBERS);
  }

  public PageSetup withLandscape(boolean value) {
    return new PageSetup(paper, value, marginMm, title, header, footer);
  }

  public PageSetup withMarginMm(float value) {
    return new PageSetup(paper, landscape, value, title, header, footer);
  }

  public PageSetup withTitle(String value) {
    return new PageSetup(paper, landscape, marginMm, value, header, footer);
  }

  public PageSetup withHeader(String value) {
    return new PageSetup(paper, landscape, marginMm, title, value, footer);
  }

  public PageSetup withFooter(String value) {
    return new PageSetup(paper, landscape, marginMm, title, header, value);
  }
}
