package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An action can be a FIELD as well as a method: a {@code Runnable} runs and the screen re-renders
 * with its effect, a {@code Callable} answers with whatever it returns (a message here). A nested
 * form's button runs on the nested object — created on demand when the field is still null — and a
 * field that is not a nested form cannot be used to reach methods of arbitrary objects.
 */
class FieldActionsSyncTest {

  public static class Address {
    public String street;
    public boolean verified;

    @Button
    public void verify() {
      verified = street != null && !street.isBlank();
    }
  }

  @UI("/field-actions")
  @Title("Field actions")
  public static class Profile {
    public String name = "Ada";
    public Address address;
    public Supplier<String> greeter = () -> "hi";

    public Runnable clear = () -> name = "";

    public Callable<Message> hello = () -> new Message("Hello " + name);
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Profile.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/field-actions")
            .consumedRoute("/field-actions")
            .serverSideType(Profile.class.getName())
            .actionId(actionId)
            .componentState(state)
            .initiatorComponentId("profile")
            .build());
  }

  @Test
  void aRunnableFieldRunsAndTheScreenShowsItsEffect() {
    var increment = run("clear", Map.of("name", "Grace"));
    assertThat(increment.toString()).contains("name=").doesNotContain("Grace");
  }

  @Test
  void aCallableFieldAnswersWithWhatItReturns() {
    var increment = run("hello", Map.of("name", "Grace"));
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("Hello Grace"));
  }

  @Test
  void aNestedFormButtonRunsOnTheNestedObjectCreatedOnDemand() {
    var increment = run("nested-form-action-address-verify", Map.of("name", "Ada"));
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void aFieldThatIsNotANestedFormCannotReachMethods() {
    assertThatThrownBy(() -> run("nested-form-action-greeter-get", Map.of()))
        .hasMessageContaining("not allowed");
  }
}
