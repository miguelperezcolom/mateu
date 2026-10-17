package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * What an orchestrator's inner route answers when it cannot render a view: a {@link
 * UserFacingException} is shown as written; a route it does not know is the generic error, never
 * the raw exception; a refusal is a refusal, not a toast; and an inner route may answer with any
 * object, not only a component.
 */
class MultiViewInnerRoutesSyncTest {

  @UI("/mv-inner")
  public static class InnerRoutes extends MultiView {
    @Override
    protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
      if (route.endsWith("/locked")) {
        throw new UserFacingException("Record locked", "Someone else is editing it.");
      }
      if (route.endsWith("/secret")) {
        throw new MateuForbiddenException("not yours");
      }
      if (route.endsWith("/note")) {
        return new OrchestrationResult("note", this, Message.success("just a note"));
      }
      return null;
    }

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
      return List.of();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InnerRoutes.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto inner(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/mv-inner")
            .serverSideType(InnerRoutes.class.getName())
            .actionId("")
            .initiatorComponentId("mv")
            .componentState(Map.of("_componentRoute", "/mv-inner"))
            .parameters(Map.of())
            .build());
  }

  private static Object outcome(Supplier<UIIncrementDto> call) {
    try {
      return call.get();
    } catch (RuntimeException e) {
      return e;
    }
  }

  @Test
  void aUserFacingFailureIsShownAsWritten() {
    var increment = inner("/mv-inner/locked");
    assertThat(increment.messages())
        .anySatisfy(
            m -> {
              assertThat(m.title()).isEqualTo("Record locked");
              assertThat(m.text()).isEqualTo("Someone else is editing it.");
            });
  }

  @Test
  void anUnknownInnerRouteIsTheGenericErrorNotTheRawException() {
    var increment = inner("/mv-inner/nowhere");
    assertThat(increment.messages())
        .anySatisfy(
            m -> {
              assertThat(m.title()).isEqualTo("Something went wrong");
              assertThat(m.text()).startsWith("An unexpected error occurred. Reference: ");
            });
    assertThat(String.valueOf(increment)).doesNotContain("not supported by");
  }

  @Test
  void aRefusalPropagatesAsTheForbiddenAnswerNotAToast() {
    var outcome = outcome(() -> inner("/mv-inner/secret"));
    assertThat(outcome).isInstanceOf(MateuForbiddenException.class);
    assertThat(((MateuForbiddenException) outcome).status()).isEqualTo(403);
  }

  @Test
  void anInnerRouteMayAnswerWithAnyObject() {
    var increment = inner("/mv-inner/note");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("just a note"));
  }
}
