package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.UICommand;
import java.util.List;

/**
 * Implemented by a view to emit {@link UICommand}s (e.g. set window title, navigate, mark
 * dirty/clean) on render. {@link #commands(HttpRequest)} returns the commands to include in the
 * response for the current request.
 */
public interface CommandSupplier {

  List<UICommand> commands(HttpRequest httpRequest);
}
