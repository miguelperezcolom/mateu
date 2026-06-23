package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;

/**
 * A form field whose type is a routed orchestrator must render as an embedded mediator: a {@link
 * ServerSideComponent} (carrying the orchestrator's own actions and the embedded marker) wrapping a
 * {@link AppShell} with {@link AppVariant#MEDIATOR}.
 */
class EmbeddedOrchestratorFieldBuilderTest {

  @UI("/my-editor")
  static class MyEditor extends AutoEditableView<Object> {
    @Override
    public Object load(HttpRequest httpRequest) {
      return new Object();
    }

    @Override
    public void persist(Object entity, HttpRequest httpRequest) {}
  }

  static class Host {
    MyEditor editor;
    String plain;
  }

  static class InlineHost {
    @Inline MyEditor editor;
  }

  private static FakeHttpRequest httpRequest() {
    return new FakeHttpRequest(RunActionRqDto.builder().build()).withAttribute("baseUrl", "");
  }

  @Test
  void detectsOrchestratorTypedFields() {
    assertThat(EmbeddedOrchestratorFieldBuilder.isOrchestrator(MyEditor.class)).isTrue();
    assertThat(EmbeddedOrchestratorFieldBuilder.isOrchestrator(String.class)).isFalse();
  }

  @Test
  void buildsServerSideComponentWrappingMediatorAppShell() throws Exception {
    var field = Host.class.getDeclaredField("editor");

    var component = EmbeddedOrchestratorFieldBuilder.build("", field, "host", httpRequest(), 2);

    assertThat(component).isInstanceOf(CustomField.class);
    var content = ((CustomField) component).content();
    assertThat(content).isInstanceOf(ServerSideComponent.class);

    var wrapper = (ServerSideComponent) content;
    assertThat(wrapper.serverSideType()).isEqualTo(MyEditor.class.getName());
    assertThat(wrapper.route()).contains("_embeddedMediator");
    assertThat(wrapper.initialData()).isInstanceOf(java.util.Map.class);
    @SuppressWarnings("unchecked")
    var initialData = (java.util.Map<String, Object>) wrapper.initialData();
    assertThat(initialData).containsKey("_embeddedMediator");

    // The orchestrator's own actions travel on the wrapper so it (holding the entity state) claims
    // them instead of the action bubbling out to the host page.
    assertThat(wrapper.actions().stream().map(a -> a.id())).contains("edit", "save", "cancel-edit");

    assertThat(wrapper.children()).hasSize(1);
    assertThat(wrapper.children().get(0)).isInstanceOf(AppShell.class);
    var app = (AppShell) wrapper.children().get(0);
    assertThat(app.variant()).isEqualTo(AppVariant.MEDIATOR);
    assertThat(app.serverSideType()).isEqualTo(MyEditor.class.getName());
    assertThat(app.homeRoute()).contains("/my-editor");
    assertThat(app.homeRoute()).contains("_embeddedMediator");
    // A non-@Inline host must NOT carry the inline marker — that flag is reserved for fields that
    // opt in via @Inline and would otherwise alter the embedded view's chrome.
    assertThat(app.homeRoute()).doesNotContain("_inline");
    @SuppressWarnings("unchecked")
    var nonInlineData = (java.util.Map<String, Object>) wrapper.initialData();
    assertThat(nonInlineData).doesNotContainKey("_inline");
  }

  @Test
  void inlineHostPropagatesInlineMarker() throws Exception {
    var field = InlineHost.class.getDeclaredField("editor");

    var component = EmbeddedOrchestratorFieldBuilder.build("", field, "host", httpRequest(), 2);

    var wrapper = (ServerSideComponent) ((CustomField) component).content();
    assertThat(wrapper.route()).contains("_embeddedMediator");
    assertThat(wrapper.route()).contains("_inline");

    var app = (AppShell) wrapper.children().get(0);
    assertThat(app.homeRoute()).contains("_inline");

    @SuppressWarnings("unchecked")
    var initialData = (java.util.Map<String, Object>) wrapper.initialData();
    assertThat(initialData).containsEntry("_embeddedMediator", true);
    assertThat(initialData).containsEntry("_inline", true);
  }

  @Test
  void isInlineRequestDetectsMarkerInRouteOrComponentState() {
    var routeMatch =
        new FakeHttpRequest(
            RunActionRqDto.builder().route("/my-editor?_embeddedMediator=1&_inline=1").build());
    assertThat(EmbeddedOrchestratorFieldBuilder.isInlineRequest(routeMatch)).isTrue();

    var stateMatch =
        new FakeHttpRequest(
            RunActionRqDto.builder()
                .route("/my-editor")
                .componentState(java.util.Map.of("_inline", "true"))
                .build());
    assertThat(EmbeddedOrchestratorFieldBuilder.isInlineRequest(stateMatch)).isTrue();

    var noMatch =
        new FakeHttpRequest(
            RunActionRqDto.builder().route("/my-editor?_embeddedMediator=1").build());
    assertThat(EmbeddedOrchestratorFieldBuilder.isInlineRequest(noMatch)).isFalse();
  }
}
