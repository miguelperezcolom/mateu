package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.HeaderValue;
import java.util.List;

/**
 * Implemented by the app class to put LIVE values on the header ("Business date: 12 Oct"). Read
 * when the shell is built; after that a value changes through {@code
 * UICommand.updateHeaderValue(id, value)} or {@code LiveHeaderValues.publish(id, value)} — see
 * {@link HeaderValue}.
 */
@Experimental("live header values (3.0-alpha, E2 patterns)")
public interface HeaderValuesSupplier {

  List<HeaderValue> headerValues(HttpRequest httpRequest);
}
