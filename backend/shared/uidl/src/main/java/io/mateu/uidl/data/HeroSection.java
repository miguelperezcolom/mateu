package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A prominent page hero: a large title and subtitle, optionally over a background image, with
 * slotted content below (search box, call-to-action buttons…). Used by hero search and welcome
 * pages.
 */
@Builder
public record HeroSection(
    String id,
    String title,
    String subtitle,
    String image,
    String height,
    boolean centered,
    /**
     * The band's tone (the Redwood welcome-page palette): {@code null}/{@code auto} keeps the
     * default look, any other {@link HeroTone} paints a dark tinted band with light ink.
     */
    @Experimental("hero tone (3.0-alpha.409)") HeroTone tone,
    List<Component> content,
    String style,
    String cssClasses)
    implements Component {

  /** The 3.0-alpha.408 shape (no tone), kept so code compiled against it keeps linking. */
  public HeroSection(
      String id,
      String title,
      String subtitle,
      String image,
      String height,
      boolean centered,
      List<Component> content,
      String style,
      String cssClasses) {
    this(id, title, subtitle, image, height, centered, null, content, style, cssClasses);
  }
}
