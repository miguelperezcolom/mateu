package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * Supplies extra header widgets to render in an app shell's header area. Implement {@link
 * #widgets(HttpRequest)} to return the {@link Component}s placed in the header widgets slot (e.g. a
 * user badge, search box, or custom control).
 */
public interface WidgetSupplier {

  List<Component> widgets(HttpRequest httpRequest);
}
