package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A bulk button on a listing toolbar is declared by THREE annotations, each with one job:
 * {@code @ListToolbarButton} says which toolbar it belongs to (a crud has two), {@code @Toolbar}
 * how it looks and {@code @Action} how it behaves — the same composition a detail-view method
 * already uses, so nothing is duplicated into the placement annotation.
 *
 * <p>Bulk actions apply to N rows at once, so they are the ones that most need to LOOK dangerous
 * and to say what the user is confirming.
 */
class ListToolbarButtonAppearanceSyncTest {

  public static class Process implements Identifiable {
    String id;
    String name;
    String status;

    public Process() {}

    public Process(String id, String name, String status) {
      this.id = id;
      this.name = name;
      this.status = status;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Process> PROCESSES = new ArrayList<>();

  @UI("/processes")
  @Title("Processes")
  public static class ProcessesCrud extends AutoCrud<Process> {

    @Override
    public CrudStore<Process> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Process> findById(String id) {
          return PROCESSES.stream().filter(process -> process.id().equals(id)).findFirst();
        }

        @Override
        public String save(Process entity) {
          return entity.id;
        }

        @Override
        public List<Process> findAll() {
          return PROCESSES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }

    /** The button as it could only be written before: a generic dialog and the default look. */
    @ListToolbarButton(confirmationRequired = true)
    @Label("Retry from failure")
    public Message retryFromFailure(List<Process> selection) {
      return new Message(selection.size() + " retried");
    }

    /** The destructive one: red, and saying what is about to happen. */
    @ListToolbarButton(confirmationRequired = true)
    @Toolbar(buttonStyle = ButtonStyle.secondary, buttonColor = ButtonColor.error, order = 10)
    @Action(
        confirmationTitle = "Cancel processes",
        confirmationMessage = "Cancelling stops every selected process. This cannot be undone.",
        confirmationText = "Cancel them",
        confirmationDenialText = "Keep running")
    @Label("Cancel")
    public Message cancel(List<Process> selection) {
      return new Message(selection.size() + " cancelled");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProcessesCrud.class);
    PROCESSES.add(new Process("1", "nightly", "failed"));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static CrudlDto findCrudl(Object component) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof CrudlDto crudl) {
        return crudl;
      }
      for (var child : client.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private static List<ActionDto> findActions(Object component) {
    if (component instanceof ServerSideComponentDto server) {
      if (server.actions() != null
          && server.actions().stream()
              .anyMatch(action -> "action-on-row-cancel".equals(action.id()))) {
        return server.actions();
      }
      for (var child : server.children()) {
        var found = findActions(child);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      for (var child : client.children()) {
        var found = findActions(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private static UIIncrementDto listing() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/processes")
            .consumedRoute("/processes")
            .serverSideType(ProcessesCrud.class.getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .componentState(Map.of())
            .build());
  }

  private static ButtonDto button(String actionId) {
    return findCrudl(listing().fragments().get(0).component()).toolbar().stream()
        .filter(candidate -> actionId.equals(candidate.actionId()))
        .findFirst()
        .orElseThrow();
  }

  private static ActionDto action(String actionId) {
    return findActions(listing().fragments().get(0).component()).stream()
        .filter(candidate -> actionId.equals(candidate.id()))
        .findFirst()
        .orElseThrow();
  }

  // ── appearance ──────────────────────────────────────────────────────────────

  @Test
  void theToolbarAnnotationPaintsTheBulkButton() {
    var cancel = button("action-on-row-cancel");
    assertThat(cancel.label()).isEqualTo("Cancel");
    assertThat(cancel.color()).isEqualTo(ButtonColorDto.error);
    assertThat(cancel.buttonStyle()).isEqualTo(ButtonStyleDto.secondary);
  }

  @Test
  void aBulkButtonWithoutToolbarKeepsTheRenderersDefaultLook() {
    var retry = button("action-on-row-retryFromFailure");
    assertThat(retry.color()).isNull();
    assertThat(retry.buttonStyle()).isNull();
    assertThat(retry.size()).isNull();
  }

  @Test
  void orderFixesTheButtonSequenceReflectionDoesNotGuarantee() {
    var toolbar = findCrudl(listing().fragments().get(0).component()).toolbar();
    var ids = toolbar.stream().map(ButtonDto::actionId).toList();
    // order = 10 puts Cancel after the undeclared (0) Retry, whatever order reflection returns
    assertThat(ids.indexOf("action-on-row-retryFromFailure"))
        .isLessThan(ids.indexOf("action-on-row-cancel"));
  }

  // ── behaviour ───────────────────────────────────────────────────────────────

  @Test
  void theActionAnnotationCarriesTheConfirmationTextsToTheWire() {
    var cancel = action("action-on-row-cancel");
    assertThat(cancel.confirmationRequired()).isTrue();
    assertThat(cancel.confirmationTexts()).isNotNull();
    assertThat(cancel.confirmationTexts().title()).isEqualTo("Cancel processes");
    assertThat(cancel.confirmationTexts().message())
        .isEqualTo("Cancelling stops every selected process. This cannot be undone.");
    assertThat(cancel.confirmationTexts().confirmationText()).isEqualTo("Cancel them");
    assertThat(cancel.confirmationTexts().denialText()).isEqualTo("Keep running");
  }

  /**
   * {@code @Action.rowsSelectedRequired} defaults to FALSE while {@code @ListToolbarButton}
   * defaults it to TRUE — merging them by OR is what keeps adding a confirmation message from
   * silently disarming the selection guard.
   */
  @Test
  void addingAnActionDoesNotDisarmTheSelectionGuard() {
    assertThat(action("action-on-row-cancel").rowsSelectedRequired()).isTrue();
    assertThat(action("action-on-row-cancel").bubble()).isTrue();
  }

  // ── regression: the three buttons already in production ─────────────────────

  @Test
  void aButtonDeclaringOnlyConfirmationRequiredIsUnchanged() {
    var retry = action("action-on-row-retryFromFailure");
    assertThat(retry.confirmationRequired()).isTrue();
    assertThat(retry.rowsSelectedRequired()).isTrue();
    assertThat(retry.bubble()).isTrue();
    // no texts declared → null, so the renderer keeps its own generic wording
    assertThat(retry.confirmationTexts()).isNull();
    assertThat(retry.sse()).isFalse();
    assertThat(retry.background()).isFalse();
    assertThat(retry.timeoutMillis()).isZero();
    assertThat(retry.validationRequired()).isFalse();
  }
}
