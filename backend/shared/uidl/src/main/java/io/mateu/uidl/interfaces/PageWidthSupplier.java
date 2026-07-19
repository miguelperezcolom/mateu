package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.PageWidthStyle;

/**
 * Hook for views (typically archetypes) to declare their page width programmatically — the
 * programmatic counterpart of {@code @PageWidth}. The annotation on the concrete view class wins
 * over this hook; when both are absent the renderer infers the width from the page content. Return
 * {@code null} for "no opinion".
 */
public interface PageWidthSupplier {

  /** The page width this view asks for, or {@code null} to defer to annotation/inference. */
  default PageWidthStyle pageWidth() {
    return null;
  }
}
