package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Pins the server-side contract behind the "@ViewToolbarButton on an AutoCrud sees a null id" bug:
 * {@code httpRequest.getComponentState(EntityType.class)} reconstructs the entity from the
 * run-action request's {@code componentState} map ONLY — so the selected/viewed row is resolved
 * exactly when its own fields (notably {@code id}) travel at the top level of {@code
 * componentState}.
 *
 * <p>The regression was on the client: a {@code @ViewToolbarButton}'s action is declared on the
 * crud host, not on the form, so it bubbles up carrying the form (with its id) in {@code
 * parameters.initiatorState}, while the crud host used to POST its OWN state (the list —
 * filters/paging, no id) as {@code componentState}. The fix ({@code resolveComponentState} in the
 * web client) makes a bubbled action POST its originator's state as {@code componentState}. These
 * tests lock the backend half of that contract so it can't silently drift.
 */
class ViewToolbarButtonComponentStateContractTest {

  public static class Form implements Identifiable {
    String id;
    String name;

    public Form() {}

    public Form(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Form> FORMS = new ArrayList<>(List.of(new Form("42", "My form")));

  @UI("/forms")
  @Title("Forms")
  @Action(id = "action-on-view-graphEditor")
  public static class Forms extends AutoCrud<Form> {

    static volatile String seenId = "UNSET";

    @ViewToolbarButton
    public String graphEditor(HttpRequest httpRequest) {
      var f = httpRequest.getComponentState(Form.class);
      seenId = f == null ? "NULL_FORM" : String.valueOf(f.id());
      return "opened " + seenId;
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      if ("action-on-view-graphEditor".equals(actionId)) {
        return graphEditor(httpRequest);
      }
      return super.handleAction(actionId, httpRequest);
    }

    @Override
    public CrudStore<Form> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Form> findById(String id) {
          return FORMS.stream().filter(f -> f.id().equals(id)).findFirst();
        }

        @Override
        public String save(Form entity) {
          return entity.id();
        }

        @Override
        public List<Form> findAll() {
          return FORMS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Forms.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private String runWith(Map<String, Object> componentState, Map<String, Object> parameters) {
    Forms.seenId = "UNSET";
    mateu.run(
        RunActionRqDto.builder()
            .route("/forms/42")
            .consumedRoute("/forms")
            .serverSideType(Forms.class.getName())
            .actionId("action-on-view-graphEditor")
            .initiatorComponentId("c1_app")
            .componentState(componentState)
            .parameters(parameters)
            .build());
    return Forms.seenId;
  }

  @Test
  void componentStateCarryingTheRowResolvesTheEntity() {
    // This is what the fixed client sends for a @ViewToolbarButton: the originating form (with id)
    // as componentState. getComponentState(Form.class).id() must be the selected row's id.
    assertThat(runWith(Map.of("id", "42"), Map.of())).isEqualTo("42");
  }

  @Test
  void aComponentStateWithoutTheEntityFieldsResolvesANullId() {
    // The pre-fix client POSTed the crud host's own (list) state, which has no id — the reported
    // bug: getComponentState builds a Form with a null id ("null"), so the app's findById(null)
    // blows up. Neither an empty componentState nor the id only riding in parameters.initiatorState
    // resolves the entity, because getComponentState reads componentState exclusively.
    assertThat(runWith(Map.of(), Map.of())).isEqualTo("null");
    assertThat(runWith(Map.of(), Map.of("initiatorState", Map.of("id", "42")))).isEqualTo("null");
  }
}
