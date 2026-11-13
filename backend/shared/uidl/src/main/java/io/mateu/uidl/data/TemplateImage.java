package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * An image a page template shows in its own place and size: a {@code src} (may hold {@code
 * ${state.x}}), for an avatar the {@code initials} shown when there is no image, and the {@code
 * alt} text a screen reader reads for it (the page's title when absent).
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record TemplateImage(String src, String initials, String alt) {

  /** As the canonical constructor, with no alt text (the page's title is read instead). */
  public TemplateImage(String src, String initials) {
    this(src, initials, null);
  }
}
