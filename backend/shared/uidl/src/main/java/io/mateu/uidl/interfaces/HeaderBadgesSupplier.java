package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Badge;
import java.util.List;

/**
 * Implemented by a page to supply its header-strip badges programmatically — the code twin of
 * {@code @BadgeInHeader} fields, over which it takes precedence. {@link #headerBadges()} returns
 * the {@link Badge} chips to render in the page header; a badge with a blank text is skipped.
 *
 * @since 3.0-alpha.412 (replaces {@link BadgeSupplier}, whose name did not say WHERE the badges go)
 */
public interface HeaderBadgesSupplier {

  List<Badge> headerBadges();
}
