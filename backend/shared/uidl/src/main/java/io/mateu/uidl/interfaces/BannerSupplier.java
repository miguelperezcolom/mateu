package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.PageBanner;
import java.util.List;

/**
 * Implemented by a page to supply banners programmatically (an alternative to {@code @Banner}
 * methods, over which this takes precedence). {@link #banners()} returns the list of {@link
 * PageBanner}s shown below the page header and above the first section.
 */
public interface BannerSupplier {

  List<PageBanner> banners();
}
