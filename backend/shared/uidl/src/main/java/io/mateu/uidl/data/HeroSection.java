package io.mateu.uidl.data;

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
    List<Component> content,
    String style,
    String cssClasses)
    implements Component {}
