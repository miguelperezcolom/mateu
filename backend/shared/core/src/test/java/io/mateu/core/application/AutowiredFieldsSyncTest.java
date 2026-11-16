package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.InjectionAnnotations;
import io.mateu.core.infra.reflection.read.AllEditableFieldsProvider;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

/**
 * A Spring view model's {@code @Autowired} / {@code @Value} fields are dependencies, not UI state:
 * never a form field, never in the component state, never written from the client — and the service
 * is still injected and usable in an action. Before the fix only {@code jakarta.inject.Inject} was
 * recognised, so an {@code @Autowired} service rendered as a form field.
 */
class AutowiredFieldsSyncTest {

  /** A service the container holds. */
  public static class Greeter {
    public String greet(String name) {
      return "Hello " + name;
    }
  }

  /** A composed annotation carrying {@code @Autowired}. */
  @Retention(RetentionPolicy.RUNTIME)
  @Autowired
  public @interface Wired {}

  @UI("/autowired-fields")
  public static class SpringForm {

    @Autowired Greeter greeter;

    @Value("${greeting.suffix:!}")
    String suffix;

    @Wired Greeter composed;

    public String name = "Ana";

    static SpringForm seen;

    @Button
    public Message greet() {
      seen = this;
      return new Message(greeter.greet(name));
    }
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Greeter()), SpringForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void injectionAnnotationsAreRecognisedByName() throws Exception {
    assertThat(InjectionAnnotations.isInjected(SpringForm.class.getDeclaredField("greeter")))
        .isTrue();
    assertThat(InjectionAnnotations.isInjected(SpringForm.class.getDeclaredField("suffix")))
        .isTrue();
    assertThat(InjectionAnnotations.isInjected(SpringForm.class.getDeclaredField("composed")))
        .isTrue();
    assertThat(InjectionAnnotations.isInjected(SpringForm.class.getDeclaredField("name")))
        .isFalse();
  }

  @Test
  void injectedFieldsAreNotFormFields() {
    var editable =
        AllEditableFieldsProvider.getAllEditableFields(SpringForm.class).stream()
            .map(Field::getName)
            .toList();
    assertThat(editable).contains("name").doesNotContain("greeter", "suffix", "composed");

    var wire = SpecsFixture.JSON.valueToTree(mateu.sync("/autowired-fields"));
    var fieldIds = new ArrayList<String>();
    collectFieldIds(wire, fieldIds);
    assertThat(fieldIds).contains("name").doesNotContain("greeter", "suffix", "composed");
  }

  @Test
  void injectedFieldsAreNotInTheState() {
    var increment = mateu.sync("/autowired-fields");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("name", "Ana");
    assertThat(state).doesNotContainKeys("greeter", "suffix", "composed");
  }

  @Test
  void aPostedValueIsIgnoredAndTheServiceStillWorks() {
    SpringForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("name", "Joan");
    state.put("greeter", new HashMap<String, Object>());
    state.put("suffix", "forged");
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/autowired-fields")
                .consumedRoute("/autowired-fields")
                .serverSideType(SpringForm.class.getName())
                .actionId("greet")
                .componentState(state)
                .initiatorComponentId("c1")
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Hello Joan");
    assertThat(SpringForm.seen).isNotNull();
    assertThat(SpringForm.seen.greeter).isNotNull();
    assertThat(SpringForm.seen.suffix).isNotEqualTo("forged");
  }

  private static void collectFieldIds(
      com.fasterxml.jackson.databind.JsonNode node, List<String> fieldIds) {
    if (node.isObject() && "FormField".equals(node.path("type").asText())) {
      fieldIds.add(node.path("fieldId").asText());
    }
    node.forEach(child -> collectFieldIds(child, fieldIds));
  }
}
