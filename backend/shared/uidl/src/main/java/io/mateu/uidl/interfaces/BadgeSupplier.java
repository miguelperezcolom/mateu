package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Badge;
import java.util.List;

/**
 * Implemented by a page to supply header-strip badges programmatically (an alternative to
 * {@code @BadgeInHeader} fields, over which this takes precedence). {@link #badges()} returns the
 * list of {@link Badge} chips to render in the page header.
 *
 * <p>Kept working as an alias of {@link HeaderBadgesSupplier}: Mateu reads either one (the new
 * interface wins when a page implements both).
 *
 * @deprecated use {@link HeaderBadgesSupplier} instead (same contract, named after
 *     {@code @BadgeInHeader}: implement {@code headerBadges()} rather than {@code badges()}).
 */
@Deprecated(since = "3.0-alpha.412", forRemoval = true)
public interface BadgeSupplier {

  List<Badge> badges();
}
