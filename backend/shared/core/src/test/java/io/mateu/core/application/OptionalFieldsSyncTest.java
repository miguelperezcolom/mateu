package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An {@code Optional<X>} field is a field of type X: its content is shown (an empty Optional is an
 * empty field) and what comes back is wrapped again. Before, the state serializer had no Jdk8
 * module and the whole page failed.
 */
class OptionalFieldsSyncTest {

  @SuppressWarnings("unused")
  @UI("/optional-fields")
  public static class OptionalForm {
    Optional<String> nickname = Optional.of("Ace");
    Optional<Integer> age = Optional.empty();
    String name = "Ada";

    public String echo() {
      return nickname.orElse("-") + "|" + age.map(String::valueOf).orElse("-");
    }
  }

  @UI("/optional-record")
  public record OptionalRecord(Optional<String> nickname, String name) {
    public String echo() {
      return nickname.orElse("-") + "|" + name;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(OptionalForm.class, OptionalRecord.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anOptionalFieldRendersItsValueAndHydratesBack() {
    var load = mateu.sync("/optional-fields");
    var fields = MoreFieldTypesSyncTest.fields(load);
    assertThat(fields.get("nickname").dataType()).isEqualTo("string");
    assertThat(fields.get("age").dataType()).isEqualTo("integer");
    @SuppressWarnings("unchecked")
    var state = new LinkedHashMap<>((Map<String, Object>) load.fragments().get(0).state());
    assertThat(state.get("nickname")).isEqualTo("Ace");
    assertThat(state.get("age")).isNull();
    state.put("nickname", "Bee");
    state.put("age", 42);
    var response =
        mateu.run(
            RunActionRqDto.builder()
                .route("/optional-fields")
                .consumedRoute("_empty")
                .actionId("echo")
                .serverSideType(OptionalForm.class.getName())
                .componentState(state)
                .build());
    assertThat(response.toString()).contains("Bee|42");
  }

  @Test
  void anOptionalRecordComponentIsBuiltWrapped() {
    var state = new LinkedHashMap<String, Object>();
    state.put("nickname", "Cee");
    state.put("name", "Ada");
    var response =
        mateu.run(
            RunActionRqDto.builder()
                .route("/optional-record")
                .consumedRoute("_empty")
                .actionId("echo")
                .serverSideType(OptionalRecord.class.getName())
                .componentState(state)
                .build());
    assertThat(response.toString()).contains("Cee|Ada");
    state.remove("nickname");
    var empty =
        mateu.run(
            RunActionRqDto.builder()
                .route("/optional-record")
                .consumedRoute("_empty")
                .actionId("echo")
                .serverSideType(OptionalRecord.class.getName())
                .componentState(state)
                .build());
    assertThat(empty.toString()).contains("-|Ada");
  }
}
