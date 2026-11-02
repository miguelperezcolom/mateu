package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.List;
import org.reactivestreams.Publisher;

/**
 * The record's own {@code @Toolbar} methods on a crud's record page (its view route).
 *
 * <p>Their buttons BUBBLE to the crud as {@code action-on-view-<method>}, like a
 * {@code @ViewToolbarButton}: the crud rebuilds the record from the page's values, runs the method
 * on it and, when the method answers the record ({@code return this}, or a list of it and messages)
 * re-renders the record page in place — the crud's header and toolbar and the record's {@code
 * DetailContentSupplier} content (see {@code ActionOnViewActionHandler}). Run against the record on
 * its own, its answer replaced the page with a bare reflected form of the record: no Back to list
 * or Edit, and none of its custom content.
 *
 * <p>A method the browser calls itself ({@code @RestAction}) or that streams its answer ({@code
 * Flux}) keeps its plain id: it is not answered with the page.
 */
@io.mateu.uidl.annotations.Internal
public final class RecordToolbarActions {

  /** The id prefix the crud dispatches a record page's button by. */
  public static final String PREFIX = "action-on-view-";

  /** Request attribute: the record a crud's record page is being drawn for. */
  public static final String RECORD_PAGE = "_mateuCrudRecordPage";

  private RecordToolbarActions() {}

  /** The action id of the button for a record's {@code @Toolbar} method. */
  static String actionId(Method method) {
    return bubbles(method) ? PREFIX + method.getName() : method.getName();
  }

  static boolean bubbles(Method method) {
    return !MetaAnnotations.isPresent(method, RestAction.class)
        && !Publisher.class.isAssignableFrom(method.getReturnType());
  }

  /**
   * The actions behind those buttons, advertised by the record page: the record's own actions for
   * them (an {@code @Action}'s confirmation, validation…) under the bubbling id.
   *
   * @param record the object the page is being mapped from
   * @param recordActions the actions already collected for it
   */
  public static List<Action> bubbling(
      Object record, List<Action> recordActions, HttpRequest httpRequest) {
    if (record == null || httpRequest.getAttribute(RECORD_PAGE) != record) {
      return List.of();
    }
    var names = new HashSet<String>();
    for (var method : getAllMethods(record.getClass())) {
      if (MetaAnnotations.isPresent(method, Toolbar.class) && bubbles(method)) {
        names.add(method.getName());
      }
    }
    return recordActions.stream()
        .filter(action -> names.contains(action.id()))
        .map(action -> action.withId(PREFIX + action.id()).withBubble(true))
        .toList();
  }
}
