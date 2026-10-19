package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * An image, by url or data URI.
 *
 * @param src the url or data URI
 * @param style inline CSS
 * @param cssClasses CSS classes
 * @param alt the text alternative a screen reader reads — what the image shows or does; {@code ""}
 *     declares it decorative. {@code null} = none declared (since 3.0-beta.4)
 */
@Builder
public record Image(String src, String style, String cssClasses, String alt) implements Component {

  public Image(String src) {
    this(src, "", "", null);
  }

  /** An image with its text alternative (since 3.0-beta.4). */
  public Image(String src, String alt) {
    this(src, "", "", alt);
  }

  /** The 3.0-beta.3 canonical constructor, kept for binary compatibility: no alt text. */
  public Image(String src, String style, String cssClasses) {
    this(src, style, cssClasses, null);
  }
}
