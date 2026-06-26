package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.AdaptedView;
import java.util.Map;

/**
 * Adapts an arbitrary domain object (one that is NOT a Mateu component and carries no Mateu
 * annotations) to and from the UI. Register it as a bean (e.g. {@code @Service}); Mateu indexes all
 * {@code ComponentAdapter} beans by {@link #type()}.
 *
 * <ul>
 *   <li>{@link #adapt} turns the object into components + state + data (an {@link AdaptedView}).
 *   <li>{@link #deserialize} rebuilds the object from the state that comes back on an action.
 * </ul>
 *
 * @param <T> the adapted domain type
 */
public interface ComponentAdapter<T> {

  /** The domain type this adapter handles (subtypes are matched too). */
  Class<T> type();

  /** Render the model as components + state + data. */
  AdaptedView adapt(T model, HttpRequest httpRequest);

  /** Rebuild the model from the state map that the frontend sends back. */
  T deserialize(Map<String, Object> state, HttpRequest httpRequest);
}
