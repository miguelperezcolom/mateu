package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Breadcrumb;
import java.util.List;

public interface BreadcrumbsSupplier {

  List<Breadcrumb> breadcrumbs(HttpRequest httpRequest);
}
