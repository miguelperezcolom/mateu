package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * Implemented by an app shell or page to supply the components rendered in its header region.
 * {@link #header(HttpRequest)} returns the fluent {@link Component}s for the current request.
 */
public interface HeaderSupplier {

  List<Component> header(HttpRequest httpRequest);
}
