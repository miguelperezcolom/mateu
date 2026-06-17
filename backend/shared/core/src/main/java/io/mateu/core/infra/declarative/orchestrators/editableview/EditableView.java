package io.mateu.core.infra.declarative.orchestrators.editableview;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.declarative.FormViewModel.createBadges;
import static io.mateu.core.infra.declarative.FormViewModel.createKpis;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public abstract class EditableView<V, E> extends MultiView {

  @Override
  protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
    if (route.endsWith("/edit")) {
      var editor = editor(httpRequest);
      httpRequest.setAttribute("edit", true);
      return new OrchestrationResult("edit", editor, buildEditorComponent(editor, httpRequest));
    }
    var view = view(httpRequest);
    httpRequest.setAttribute("view", true);
    return new OrchestrationResult("view", view, buildViewComponent(view, httpRequest));
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
      case "edit" -> navigate("/edit", httpRequest, null);
      case "save" -> {
        save(httpRequest);
        yield navigate(
            "/view",
            httpRequest,
            Message.builder().variant(NotificationVariant.success).text("Saved successfully").build());
      }
      case "cancel-edit" -> navigate("/view", httpRequest, null);
      default -> throw new UnsupportedOperationException(actionId + " not supported");
    };
  }

  private List<Object> navigate(String route, HttpRequest httpRequest, Message message) {
    setRouteTo(route);
    var result = new ArrayList<>();
    result.add(new State(this));
    if (message != null) result.add(message);
    result.add(UICommand.pushStateToHistory(getComponentRoute() + route));
    return result;
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    return List.of(
        Action.builder().id("edit").build(),
        Action.builder().id("save").validationRequired(true).bubble(true).build(),
        Action.builder().id("cancel-edit").build());
  }

  @Override
  public List<String> supportedActions() {
    return List.of();
  }

  public boolean readOnly() {
    return getClass().isAnnotationPresent(ReadOnly.class);
  }

  public abstract V view(HttpRequest httpRequest);

  public abstract E editor(HttpRequest httpRequest);

  public abstract void save(HttpRequest httpRequest);

  private Component buildViewComponent(V view, HttpRequest httpRequest) {
    List<UserTrigger> toolbar = new ArrayList<>();
    if (!readOnly()) {
      toolbar.add(new Button("Edit", "edit"));
    }
    String title = getTitle(view);
    httpRequest.setAttribute("windowTitle", title);
    return PageView.builder()
        .title(title)
        .badges(createBadges(view))
        .kpis(createKpis(view))
        .content(
            getView(
                    view,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    true,
                    false)
                .stream()
                .toList())
        .toolbar(toolbar)
        .build();
  }

  private Component buildEditorComponent(E editor, HttpRequest httpRequest) {
    String title = getTitle(editor);
    httpRequest.setAttribute("windowTitle", title);
    return PageView.builder()
        .title(title)
        .badges(createBadges(editor))
        .content(
            getView(
                    editor,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    false,
                    false)
                .stream()
                .toList())
        .toolbar(List.of(new Button("Cancel", "cancel-edit"), new Button("Save", "save")))
        .actions(
            List.of(Action.builder().id("save").validationRequired(true).bubble(true).build()))
        .build();
  }
}
