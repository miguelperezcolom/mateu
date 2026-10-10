package io.mateu.uidl.data;

/**
 * @deprecated nothing reads it (see the deprecated {@link Binding}). Expressions read {@code
 *     state.<field>} or {@code appState.<key>} directly.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public enum BindingSource {
  componentData,
  appState
}
