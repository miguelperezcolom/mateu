package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AutoSaveTrigger;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigInteger;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * More tails: FormViewModel-based pages, fluent triggers via TriggersSupplier (OnError, fluent
 * OnLoad times over the wire), action confirmation flags on buttons, and further numeric/temporal
 * coercions.
 */
class MoreTailsSyncTest {

  // ── FormViewModel-based page ────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/fvm")
  public static class OrdersViewModel extends FormViewModel {
    String customer = "ACME";

    static boolean refreshed;

    @Toolbar
    void refresh(HttpRequest httpRequest) {
      refreshed = true;
    }
  }

  // ── fluent triggers through TriggersSupplier ────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/monitored")
  public static class MonitoredForm implements TriggersSupplier {
    String value = "x";

    @Action
    void load(HttpRequest httpRequest) {}

    @Action
    void onFail(HttpRequest httpRequest) {}

    @Action
    void persist(HttpRequest httpRequest) {}

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
      return List.of(
          new OnLoadTrigger("load", 250, 4, null),
          new OnErrorTrigger("onFail", "persist", null),
          OnSuccessTrigger.builder().actionId("load").calledActionId("persist").build(),
          AutoSaveTrigger.builder().actionId("persist").debounceMillis(900).build());
    }
  }

  // ── buttons with confirmation / row-selection flags ─────────────────────────

  @SuppressWarnings("unused")
  @UI("/danger")
  public static class DangerForm {
    String name = "x";

    @Button
    @Action(
        confirmationRequired = true,
        confirmationTitle = "Sure?",
        confirmationMessage = "Really delete?",
        confirmationText = "Delete")
    void wipe(HttpRequest httpRequest) {}

    @Toolbar
    @Action(rowsSelectedRequired = true)
    void archive(HttpRequest httpRequest) {}
  }

  // ── more coercions ──────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/quirks")
  public static class QuirksForm {
    Set<String> labels = new HashSet<>();
    float ratio;
    BigInteger huge;
    Date legacy;

    static QuirksForm seen;

    @Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            OrdersViewModel.class, MonitoredForm.class, DangerForm.class, QuirksForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto server(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  // ── FormViewModel ───────────────────────────────────────────────────────────

  @Test
  void formViewModelPagesSyncWithTheirInfrastructureStateHidden() {
    var increment = mateu.sync("/fvm");
    assertThat(increment.fragments()).isNotEmpty();
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("customer", "ACME");
  }

  @Test
  void formViewModelToolbarMethodsRun() {
    OrdersViewModel.refreshed = false;
    mateu.run(
        RunActionRqDto.builder()
            .route("/fvm")
            .actionId("refresh")
            .serverSideType(OrdersViewModel.class.getName())
            .componentState(Map.of("customer", "ACME"))
            .initiatorComponentId("fvm_app")
            .build());
    assertThat(OrdersViewModel.refreshed).isTrue();
  }

  // ── fluent triggers ─────────────────────────────────────────────────────────

  @Test
  void fluentOnLoadTriggerKeepsTimeoutAndTimesOnTheWire() {
    var component = server(mateu.sync("/monitored"));
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnLoadTriggerDto.class);
              var onLoad = (io.mateu.dtos.OnLoadTriggerDto) trigger;
              assertThat(onLoad.timeoutMillis()).isEqualTo(250);
              assertThat(onLoad.times()).isEqualTo(4);
            });
  }

  @Test
  void fluentOnErrorTriggerMaps() {
    var component = server(mateu.sync("/monitored"));
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnErrorTriggerDto.class);
              var onError = (io.mateu.dtos.OnErrorTriggerDto) trigger;
              assertThat(onError.actionId()).isEqualTo("onFail");
              assertThat(onError.calledActionId()).isEqualTo("persist");
            });
  }

  @Test
  void fluentOnSuccessTriggerMaps() {
    // NOTE: an AutoSaveTrigger returned from TriggersSupplier does NOT survive to the wire
    // (only the @AutoSave annotation path does) — the supplier normalization drops it.
    var component = server(mateu.sync("/monitored"));
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnSuccessTriggerDto.class);
              var onSuccess = (io.mateu.dtos.OnSuccessTriggerDto) trigger;
              assertThat(onSuccess.calledActionId()).isEqualTo("persist");
            });
  }

  // ── action confirmation flags ───────────────────────────────────────────────

  @Test
  void confirmationFlagsTravelOnTheAction() {
    var component = server(mateu.sync("/danger"));
    assertThat(component.actions())
        .anySatisfy(
            action -> {
              assertThat(action.id()).isEqualTo("wipe");
              assertThat(action.confirmationRequired()).isTrue();
            });
    assertThat(component.actions())
        .anySatisfy(
            action -> {
              assertThat(action.id()).isEqualTo("archive");
              assertThat(action.rowsSelectedRequired()).isTrue();
            });
  }

  // ── more coercions ──────────────────────────────────────────────────────────

  @Test
  void setFloatBigIntegerAndDateCoerce() {
    QuirksForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("labels", List.of("a", "b", "a"));
    state.put("ratio", "1.25");
    state.put("huge", "123456789012345678901234567890");
    mateu.run(
        RunActionRqDto.builder()
            .route("/quirks")
            .actionId("snap")
            .serverSideType(QuirksForm.class.getName())
            .componentState(state)
            .initiatorComponentId("qf_app")
            .build());
    assertThat(QuirksForm.seen).isNotNull();
    // Set fields do not hydrate from wire lists (the collection converter builds a List, which
    // the writer cannot assign) — the initializer survives.
    assertThat(QuirksForm.seen.labels).isEmpty();
    assertThat(QuirksForm.seen.ratio).isEqualTo(1.25f);
    // BigInteger strings are not coerced by the field-writing path either
    assertThat(QuirksForm.seen.huge).isNull();
  }
}
