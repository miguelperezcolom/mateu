package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view model Mateu instantiates itself (not a container bean) still gets its injection points
 * filled — the documented default (execution-model.md, "Spring beans and services"): a field marked
 * {@code @Inject} / {@code @Autowired} / {@code @Resource} receives the bean of its type, on the
 * first load and on every action, so an action can use the service it declared.
 */
class ViewModelFieldInjectionSyncTest {

  /** A service the container holds. */
  public static class Greeter {
    public String greet(String name) {
      return "Hello " + name;
    }
  }

  @UI("/field-injection")
  public static class GreetingForm {

    @jakarta.inject.Inject Greeter greeter;

    public String name = "Ana";

    @Button
    public Message greet() {
      return new Message(greeter.greet(name));
    }
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Greeter()), GreetingForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anActionUsesTheServiceItsViewModelDeclared() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/field-injection")
                .consumedRoute("/field-injection")
                .serverSideType(GreetingForm.class.getName())
                .actionId("greet")
                .componentState(Map.of("name", "Joan"))
                .initiatorComponentId("c1")
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Hello Joan");
  }

  @Test
  void theInjectedServiceIsNotViewState() {
    var increment = mateu.sync("/field-injection");
    assertThat(increment.toString()).doesNotContain("greeter=");
  }
}
