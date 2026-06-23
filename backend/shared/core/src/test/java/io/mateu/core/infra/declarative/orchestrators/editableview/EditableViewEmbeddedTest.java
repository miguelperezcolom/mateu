package io.mateu.core.infra.declarative.orchestrators.editableview;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * An embedded {@code EditableView} (a mediator inside a host page) must toggle view↔edit in place:
 * it must NOT push the browser history (which would leak navigation to the host and reload the
 * page). Standalone, it still pushes history for deep-linking.
 */
class EditableViewEmbeddedTest {

  static class TestView extends EditableView<Object, Object> {
    @Override
    protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
      return null;
    }

    @Override
    public Object view(HttpRequest httpRequest) {
      return new Object();
    }

    @Override
    public Object editor(HttpRequest httpRequest) {
      return new Object();
    }

    @Override
    public void save(HttpRequest httpRequest) {}
  }

  @SuppressWarnings("unchecked")
  private static List<Object> handleEdit(RunActionRqDto rq) {
    return (List<Object>) new TestView().handleAction("edit", new FakeHttpRequest(rq));
  }

  private static boolean pushesHistory(List<Object> result) {
    return result.stream()
        .anyMatch(o -> o instanceof UICommand c && c.type() == UICommandType.PushStateToHistory);
  }

  @Test
  void embeddedViaComponentStateMarkerDoesNotPushHistory() {
    var result =
        handleEdit(
            RunActionRqDto.builder().componentState(Map.of("_embeddedMediator", "true")).build());

    assertThat(pushesHistory(result)).isFalse();
  }

  @Test
  void embeddedViaServerSideComponentRouteMarkerDoesNotPushHistory() {
    var result =
        handleEdit(
            RunActionRqDto.builder()
                .componentState(Map.of())
                .serverSideComponentRoute("/pf-personal?_embeddedMediator=1")
                .build());

    assertThat(pushesHistory(result)).isFalse();
  }

  @Test
  void standalonePushesHistory() {
    var result =
        handleEdit(RunActionRqDto.builder().componentState(Map.of()).route("/pf-personal").build());

    assertThat(pushesHistory(result)).isTrue();
  }
}
