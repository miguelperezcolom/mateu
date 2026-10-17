package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@link Hydratable} is a post-construction hook: Mateu populates the view's fields from the
 * request state FIRST, then calls {@code hydrate} so the view can derive or load more from them
 * (its javadoc). The state used to be skipped altogether for a Hydratable view — every value the
 * user had typed was lost on each action, and the hook saw only the field initializers.
 */
class HydratableSyncTest {

  @UI("/hydratable")
  public static class GreetingView implements Hydratable {
    public String name = "Ada";
    public String greeting;
    public String typed;

    @Override
    public void hydrate(HttpRequest httpRequest) {
      greeting = "Hello " + name;
    }

    @Toolbar
    public Object refresh() {
      return this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GreetingView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String run(Map<String, Object> state) {
    return JsonSerializer.toJson(
        mateu.run(
            RunActionRqDto.builder()
                .route("/hydratable")
                .consumedRoute("")
                .serverSideType(GreetingView.class.getName())
                .actionId("refresh")
                .componentState(state)
                .build()));
  }

  @Test
  void theHookSeesTheStateTheRequestCarried() {
    assertThat(run(Map.of("name", "Grace"))).contains("Hello Grace");
  }

  @Test
  void whatTheUserTypedSurvivesTheAction() {
    assertThat(run(Map.of("name", "Grace", "typed", "half-typed"))).contains("half-typed");
  }
}
