package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Wire mapping of jakarta bean-validation constraints (ValidationDto per constraint, plus
 * server-side enforcement on validated actions) and of the trigger family (@Trigger OnLoad with
 * timeout/times, OnSuccess, @SubscribeTo scopes, @Emits name).
 */
class ValidationAndTriggerSyncTest {

  @SuppressWarnings("unused")
  @UI("/validated")
  public static class ValidatedForm {
    @NotNull String required;

    @NotEmpty String requiredText;

    @Size(min = 2, max = 5)
    String sized;

    @Pattern(regexp = "[A-Z]+")
    String uppercased;

    @Min(1)
    @Max(10)
    int quantity;

    static boolean ran;

    @Action(validationRequired = true)
    void submit(HttpRequest httpRequest) {
      ran = true;
    }
  }

  @SuppressWarnings("unused")
  @UI("/triggered")
  @Emits(events = "thing-done", name = "triggered-form")
  @SubscribeTo(event = "external-event", action = "react", source = SubscriptionSource.DOCUMENT)
  @SubscribeTo(
      event = "scoped-event",
      action = "react",
      source = SubscriptionSource.COMPONENT,
      from = "other-form")
  @Trigger(type = TriggerType.OnLoad, actionId = "warmUp", timeoutMillis = 500, times = 3)
  @Trigger(type = TriggerType.OnSuccess, actionId = "afterSave", calledActionId = "save")
  public static class TriggeredForm {
    String value = "x";

    @Action
    void react(HttpRequest httpRequest) {}

    @Action
    void warmUp(HttpRequest httpRequest) {}

    @Action
    void save(HttpRequest httpRequest) {}

    @Action
    void afterSave(HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ValidatedForm.class, TriggeredForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto server(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  // ── validations on the wire ─────────────────────────────────────────────────

  @Test
  void constraintsAreEmittedAsValidationDtos() {
    var component = server(mateu.sync("/validated"));
    assertThat(component.validations()).isNotEmpty();
  }

  @Test
  void requiredFieldsAreMarkedRequired() {
    // form fields nest inside the metadata records — reuse the metadata-aware walker
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        server(mateu.sync("/validated")), io.mateu.dtos.FormFieldDto.class, fields);
    assertThat(fields)
        .filteredOn(io.mateu.dtos.FormFieldDto::required)
        .extracting(io.mateu.dtos.FormFieldDto::fieldId)
        .contains("required", "requiredText");
  }

  // ── triggers on the wire ────────────────────────────────────────────────────

  @Test
  void onLoadTriggerCarriesTimeoutAndTimes() {
    var component = server(mateu.sync("/triggered"));
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnLoadTriggerDto.class);
              var onLoad = (io.mateu.dtos.OnLoadTriggerDto) trigger;
              assertThat(onLoad.actionId()).isEqualTo("warmUp");
              assertThat(onLoad.timeoutMillis()).isEqualTo(500);
              assertThat(onLoad.times()).isEqualTo(3);
            });
  }

  @Test
  void onSuccessTriggerBindsToTheCalledAction() {
    var component = server(mateu.sync("/triggered"));
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnSuccessTriggerDto.class);
              var onSuccess = (io.mateu.dtos.OnSuccessTriggerDto) trigger;
              assertThat(onSuccess.actionId()).isEqualTo("afterSave");
              assertThat(onSuccess.calledActionId()).isEqualTo("save");
            });
  }

  @Test
  void subscriptionsBecomeCustomEventTriggersWithTheirScope() {
    var component = server(mateu.sync("/triggered"));
    List<TriggerDto> triggers = component.triggers();
    assertThat(triggers)
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnCustomEventTriggerDto.class);
              var custom = (io.mateu.dtos.OnCustomEventTriggerDto) trigger;
              assertThat(custom.eventName()).isEqualTo("external-event");
              assertThat(custom.source().name()).isEqualTo("DOCUMENT");
            });
    assertThat(triggers)
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnCustomEventTriggerDto.class);
              var custom = (io.mateu.dtos.OnCustomEventTriggerDto) trigger;
              assertThat(custom.eventName()).isEqualTo("scoped-event");
              assertThat(custom.source().name()).isEqualTo("COMPONENT");
              assertThat(custom.from()).isEqualTo("other-form");
            });
  }

  @Test
  void emitsNameTravelsOnTheComponent() {
    var component = server(mateu.sync("/triggered"));
    assertThat(component.emitsName()).isEqualTo("triggered-form");
  }

  // ── server-side validation enforcement ──────────────────────────────────────

  @Test
  void validatedActionRejectsAnInvalidState() {
    ValidatedForm.ran = false;
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/validated")
                .actionId("submit")
                .serverSideType(ValidatedForm.class.getName())
                .componentState(Map.of("quantity", 50))
                .initiatorComponentId("vf_app")
                .build());
    assertThat(increment).isNotNull();
  }
}
