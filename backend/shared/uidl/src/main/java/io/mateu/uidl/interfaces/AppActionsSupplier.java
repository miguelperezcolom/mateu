package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.AppHeaderAction;
import java.util.List;

/**
 * Implemented by an app shell to contribute action buttons to the app header, next to the
 * {@code @AppContext} selectors. Evaluated on every shell build, so actions can appear and
 * disappear with server-side state (e.g. only when the app context is fully selected).
 */
public interface AppActionsSupplier {

  List<AppHeaderAction> appActions(HttpRequest httpRequest);
}
