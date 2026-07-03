package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Badge;
import java.util.List;

/**
 * Implemented by a page to supply header-strip badges programmatically (an alternative to
 * {@code @BadgeInHeader} fields, over which this takes precedence). {@link #badges()} returns the
 * list of {@link Badge} chips to render in the page header.
 */
public interface BadgeSupplier {

  List<Badge> badges();
}
