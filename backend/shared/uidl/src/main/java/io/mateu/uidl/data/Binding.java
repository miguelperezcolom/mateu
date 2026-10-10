package io.mateu.uidl.data;

/**
 * @deprecated nothing reads it: a component binds to the hosting view by convention (a {@code
 *     FormField} id binds to the property of the same name, a {@code Button} actionId to the method
 *     of the same name), and expressions read {@code state.<field>} / {@code appState.<key>}.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record Binding(BindingSource source, String propertyId) {

  public Binding(String propertyId) {
    this(BindingSource.componentData, propertyId);
  }

  @Override
  public BindingSource source() {
    return source != null ? source : BindingSource.componentData;
  }
}
