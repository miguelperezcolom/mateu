package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.annotations.PageWidthStyle;

/**
 * Resolves the page width a view asks for (the first parameter of the Oracle Redwood page
 * templates) to its wire name. {@code null} means "no opinion" — the renderer then infers the width
 * from the page content (defaulting to {@code fixed}).
 */
public final class PageWidthResolver {

  /**
   * The view's declared page width as its wire name ({@code fixed}|{@code fullWidth}|{@code
   * edgeToEdge}), or {@code null} when neither {@code @PageWidth} nor the {@code PageWidthSupplier}
   * hook says anything.
   */
  public static String wirePageWidth(Object instance) {
    return toWireName(PageMetadataExtractor.getPageWidth(instance));
  }

  /** Wire name of a {@link PageWidthStyle}: lowercase camel, like the grid layout values. */
  public static String toWireName(PageWidthStyle pageWidth) {
    if (pageWidth == null) {
      return null;
    }
    return switch (pageWidth) {
      case FIXED -> "fixed";
      case FULL_WIDTH -> "fullWidth";
      case EDGE_TO_EDGE -> "edgeToEdge";
    };
  }
}
