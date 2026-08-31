package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.DeclaredRestSource;
import java.util.List;

/**
 * Implemented by a view that builds its REST sources at runtime rather than declaring them as
 * annotations, so that they too can be fetched in proxy mode.
 *
 * <p>Proxy mode — the fetch that goes through the Mateu server instead of the browser, resolving
 * CORS and injecting {@code ${secret.X}} server-side — needs the server to know what the view
 * declared, and it deliberately will not take the endpoint from the request: a proxy that fetched
 * whatever url the client asked for would be an open SSRF and secret-exfiltration relay. Until now
 * the only thing it would read was an annotation, which a view assembled from data — a form built
 * from a stored definition, a screen composed at runtime — does not have, so proxy mode was closed
 * to exactly the views that most need it. This is how such a view says the same thing.
 *
 * <p>The declarations are read on the server, from server-side state. <strong>An implementation
 * must build them from what the server holds — a stored definition, configuration, a catalogue —
 * and never from the request or the component state.</strong> That is the invariant the whole
 * feature rests on; supplying a url the client chose hands the relay back.
 *
 * <p>The descriptor a surface carries to the renderer and the one declared here are the same
 * source; a view that puts one on a {@code FormField.optionsSource} declares it here too, under
 * {@link io.mateu.uidl.data.RestSourceKind#OPTIONS} and the field's id.
 */
public interface RestSourceSupplier {

  /** Every REST source this view declares. Empty when it declares none. */
  List<DeclaredRestSource> declaredRestSources();
}
