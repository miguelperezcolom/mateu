package io.mateu.uidl.data;

/**
 * Which surface a {@link RestDataSource} feeds, and so which of a view's declarations a proxy fetch
 * is asking for. The wire name is what the renderer sends as {@code _sourceKind}.
 */
public enum RestSourceKind {

  /** A field's select options ({@code @RestOptions} / {@code FormField.optionsSource}). */
  OPTIONS("options"),
  /** A listing's rows ({@code @RestListing} / {@code Crudl.rowsSource}). */
  ROWS("rows"),
  /** A button's call ({@code @RestAction} / {@code Action.restAction}). */
  ACTION("action"),
  /** A screen's initial data ({@code @RestData}). */
  DATA("data");

  private final String wireName;

  RestSourceKind(String wireName) {
    this.wireName = wireName;
  }

  public String wireName() {
    return wireName;
  }

  /** The kind the renderer named, or null when it named none of them. */
  public static RestSourceKind fromWire(String wireName) {
    if (wireName == null) {
      return null;
    }
    for (var kind : values()) {
      if (kind.wireName.equals(wireName)) {
        return kind;
      }
    }
    return null;
  }
}
