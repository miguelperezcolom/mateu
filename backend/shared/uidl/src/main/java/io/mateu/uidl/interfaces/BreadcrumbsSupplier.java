package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Breadcrumb;
import java.util.List;

/**
 * Implemented by a page to supply the breadcrumb trail shown above its content. {@link
 * #breadcrumbs(HttpRequest)} returns the ordered list of {@link Breadcrumb}s for the current
 * request.
 */
public interface BreadcrumbsSupplier {

  List<Breadcrumb> breadcrumbs(HttpRequest httpRequest);
}
