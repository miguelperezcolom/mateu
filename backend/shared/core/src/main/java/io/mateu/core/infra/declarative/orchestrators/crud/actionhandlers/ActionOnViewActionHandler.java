package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.toView;
import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.viewState;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.declarative.orchestrators.RoutedPage;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.ViewRouteResolver;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class ActionOnViewActionHandler implements CrudOrchestratorActionHandler {
  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("action-on-view-");
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    String methodName = actionId.substring("action-on-view-".length());
    var item = recordOf(httpRequest, orchestrator);
    var idField = orchestrator.getIdFieldForRow();
    Object savedId;
    try {
      savedId = getValue(idField, item);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException(e);
    }

    var result = CrudViewMethodInvoker.invoke(methodName, item, orchestrator, httpRequest);
    var pageId = RoutedPage.id(httpRequest);
    if (pageId != null) {
      // The method answered the record (`return this`, nothing, or the record with messages): the
      // record page is re-rendered IN PLACE with it — the crud's header and toolbar, and the
      // record's own content (DetailContentSupplier) or its read-only form, exactly as the view
      // route draws it. Mapped as an object of its own, the record replaced the page with a bare
      // reflected form: no Back to list / Edit, and none of its custom content.
      var shown = recordIn(result, item, orchestrator.viewClass());
      if (shown != null) {
        var responses = new ArrayList<Object>();
        responses.add(recordPage(shown, pageId, orchestrator, httpRequest));
        responses.addAll(messagesIn(result));
        return responses;
      }
    }
    var messages = messagesOnly(result);
    if (messages != null) {
      // The button acted on the record (a "Return loan" changed it in the store) and only has
      // something to SAY: show the record again RELOADED, with the message. Answering just the
      // message left the view on the values it had before the action.
      var reloaded = orchestrator.view(orchestrator.toId(String.valueOf(savedId)), httpRequest);
      var refreshed =
          CrudActionResult.of(actionId)
              .withRoute("/" + savedId)
              .withState(new State(reloaded != null ? reloaded : item))
              .withTargetComponentId(CrudTargetComponentId.view(httpRequest));
      for (var message : messages) {
        refreshed = refreshed.withMessage(message);
      }
      return refreshed;
    }
    if (result != null) {
      // anything else (a navigation, an overlay, a download…) decides what happens next itself
      return result;
    }
    return CrudActionResult.of(actionId)
        .withRoute("/" + savedId)
        .withState(new State(item))
        .withTargetComponentId(CrudTargetComponentId.view(httpRequest));
  }

  /**
   * The record the page shows, with the page's values. A crud declared {@code Crud<Object, ...>}
   * leaves its record's class to {@code view()}: built from {@code Object} there is no record, the
   * button's method is not found, and the page is redrawn around an empty object.
   */
  private static Object recordOf(HttpRequest httpRequest, Crud orchestrator) {
    var viewClass = orchestrator.viewClass();
    if (viewClass != null && viewClass != Object.class) {
      return toView(httpRequest, viewClass);
    }
    var id = viewState(httpRequest).get(orchestrator.getIdFieldForRow());
    if (id == null) {
      throw new IllegalStateException(
          "The record page's state has no '"
              + orchestrator.getIdFieldForRow()
              + "': cannot tell which record this action is for");
    }
    return toView(
        httpRequest,
        orchestrator.view(orchestrator.toId(String.valueOf(id)), httpRequest).getClass());
  }

  /**
   * The record page under the id and route the page itself says it has ({@link RoutedPage}), so the
   * answer reaches it however the crud is hosted. The client takes a component of the same type and
   * id as an in-place re-render: the route stays.
   */
  private static UIFragmentDto recordPage(
      Object record, String pageId, Crud orchestrator, HttpRequest httpRequest) {
    httpRequest.setAttribute("selectedItem", record);
    var page =
        orchestrator.wrapView(
            "view",
            record,
            ViewRouteResolver.createViewComponent(httpRequest, record, orchestrator),
            pageId,
            RoutedPage.route(httpRequest),
            httpRequest);
    return new UIFragmentDto(
        pageId, page, page.initialData(), null, UIFragmentActionDto.Replace, null);
  }

  /**
   * The record an answer shows: the record itself when the method answered nothing, the record (or
   * another instance of the view class) it answered, alone or with messages; null for any other
   * answer.
   */
  private static Object recordIn(Object result, Object item, Class<?> viewClass) {
    if (result == null) {
      return item;
    }
    if (isRecord(result, item, viewClass)) {
      return result;
    }
    if (result instanceof Collection<?> items && !items.isEmpty()) {
      Object record = null;
      for (var element : items) {
        if (element instanceof Message) {
          continue;
        }
        if (record == null && isRecord(element, item, viewClass)) {
          record = element;
          continue;
        }
        return null;
      }
      return record;
    }
    return null;
  }

  private static boolean isRecord(Object candidate, Object item, Class<?> viewClass) {
    if (candidate == null || candidate instanceof Message) {
      return false;
    }
    if (candidate == item) {
      return true;
    }
    // a listing's view class can be unresolved (Object): then only the record's own class counts
    var recordClass =
        viewClass != null && viewClass != Object.class
            ? viewClass
            : item != null ? item.getClass() : null;
    return recordClass != null && recordClass.isInstance(candidate);
  }

  private static List<Message> messagesIn(Object result) {
    if (result instanceof Message message) {
      return List.of(message);
    }
    if (result instanceof Collection<?> items) {
      return items.stream().filter(Message.class::isInstance).map(Message.class::cast).toList();
    }
    return List.of();
  }

  /**
   * The messages of an answer made only of messages ({@code Message} or a list of them), else null.
   */
  private static List<Message> messagesOnly(Object result) {
    if (result instanceof Message message) {
      return List.of(message);
    }
    if (result instanceof Collection<?> items
        && !items.isEmpty()
        && items.stream().allMatch(Message.class::isInstance)) {
      return items.stream().map(Message.class::cast).toList();
    }
    return null;
  }
}
