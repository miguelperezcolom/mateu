package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.declarative.orchestrators.RoutedPage;
import io.mateu.uidl.annotations.Internal;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * The state of a crud's create/edit FORM as a request carries it. The form is a component of its
 * own (routed page or drawer) whose save/create bubbles up to the crud component, so the browser
 * sends the crud's state as the component state and the form's as {@code
 * parameters.initiatorState}; a request without it (a direct call, a test) carries the form as the
 * component state.
 */
@Internal
public final class CrudFormState {

  private CrudFormState() {}

  @SuppressWarnings("unchecked")
  public static Map<String, Object> of(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq.parameters() != null && rq.parameters().get("initiatorState") instanceof Map<?, ?> s) {
      // without the page's whereabouts (RoutedPage): internal, not one of the form's values
      return RoutedPage.without((Map<String, Object>) s);
    }
    return rq.componentState() != null
        ? RoutedPage.without((Map<String, Object>) rq.componentState())
        : Map.of();
  }
}
