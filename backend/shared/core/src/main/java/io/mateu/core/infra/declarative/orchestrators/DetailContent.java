package io.mateu.core.infra.declarative.orchestrators;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DetailContentSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.function.Supplier;

/**
 * The content of a record's read-only detail page (a CRUD's view route, an editable view's view
 * mode): what the record supplies through {@link DetailContentSupplier}, else the default read-only
 * form. Only the content: the callers keep building the header and the toolbar.
 */
@io.mateu.uidl.annotations.Internal
public final class DetailContent {

  private DetailContent() {}

  public static List<Component> of(
      Object view, HttpRequest httpRequest, Supplier<List<Component>> readOnlyForm) {
    if (view instanceof DetailContentSupplier supplier) {
      var content = supplier.detailContent(httpRequest);
      if (content instanceof ComponentTreeSupplier tree) {
        // Expanded in place, not mapped as an island of its own: an island would be a server-side
        // component of the supplier's type (an ItemOverview built from the record has no no-arg
        // constructor to be hydrated with), so its buttons would never reach the page's handlers.
        content = tree.component(httpRequest);
      }
      if (content != null) {
        return List.of(content);
      }
    }
    return readOnlyForm.get();
  }
}
