package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.fluent.Component;

/**
 * Implemented by a class that builds its own UI as a fluent {@link Component} tree instead of being
 * reflected from annotated fields. {@link #component(HttpRequest)} returns the root component;
 * {@link #id()}, {@link #serverSideType()}, {@link #style()} and {@link #cssClasses()} provide the
 * component identity and container styling (the {@code serverSideType} is what routes state back on
 * actions).
 */
public interface ComponentTreeSupplier extends Component {

  default String id() {
    return this.getClass().getName();
  }

  /**
   * The server-side type advertised to the frontend (used to route the state back on actions).
   * Defaults to this class; a bridge can override it to the type it stands in for.
   */
  default String serverSideType() {
    return this.getClass().getName();
  }

  Component component(HttpRequest httpRequest);

  default String style() {
    if (getClass().isAnnotationPresent(Style.class)) {
      return getClass().getAnnotation(Style.class).value();
    }
    return "max-width:900px;margin: auto;";
  }

  default String cssClasses() {
    return null;
  }
}
