package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A constraint on a field the form does not render must not travel to the client.
 *
 * <p>The two halves are decided separately — {@code FormFieldFilter} says what is rendered, {@code
 * ValidationMapper} says what is validated — and when they disagree the form becomes unsubmittable:
 * the client refuses to save over a field that has no input to type into, and the message names a
 * field the user cannot see. The natural way to write an id that is assigned at creation and
 * immutable afterwards ({@code @NotEmpty} + {@code @HiddenInCreate}) walks straight into it.
 */
class HiddenFieldValidationSyncTest {

  public static class Model implements Identifiable {

    /** Assigned on creation, shown and immutable afterwards — so hidden in the creation form. */
    @jakarta.validation.constraints.NotEmpty @ReadOnly @HiddenInCreate String id;

    /** The mirror case: only meaningful while creating, so hidden in the edit form. */
    @jakarta.validation.constraints.NotEmpty @HiddenInEditor String newId;

    @jakarta.validation.constraints.NotEmpty String name;

    public Model() {}

    public Model(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Model> MODELS = new ArrayList<>(List.of(new Model("m1", "First")));

  @UI("/models")
  @Title("Models")
  public static class ModelsCrud extends AutoCrud<Model> {
    @Override
    public CrudStore<Model> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Model> findById(String id) {
          return MODELS.stream().filter(m -> id.equals(m.id())).findFirst();
        }

        @Override
        public String save(Model entity) {
          return entity.id();
        }

        @Override
        public List<Model> findAll() {
          return MODELS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ModelsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private List<String> validatedFieldsAt(String route) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("/models")
                .serverSideType(ModelsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .build());
    var fields = new ArrayList<String>();
    collectValidations(increment.fragments().get(0).component(), fields);
    return fields;
  }

  private static void collectValidations(Object component, List<String> into) {
    if (component instanceof ServerSideComponentDto serverSide) {
      for (ValidationDto validation : nullToEmpty(serverSide.validations())) {
        into.add(validation.fieldId());
      }
      for (var child : nullToEmptyComponents(serverSide.children())) {
        collectValidations(child, into);
      }
    }
  }

  private static List<ValidationDto> nullToEmpty(List<ValidationDto> validations) {
    return validations == null ? List.of() : validations;
  }

  private static List<?> nullToEmptyComponents(List<?> children) {
    return children == null ? List.of() : children;
  }

  @Test
  void theCreationFormDoesNotValidateAFieldItHidesFromCreation() {
    assertThat(validatedFieldsAt("/models/new")).contains("newId", "name").doesNotContain("id");
  }

  @Test
  void theEditFormDoesNotValidateAFieldItHidesFromEditing() {
    assertThat(validatedFieldsAt("/models/m1/edit")).contains("id", "name").doesNotContain("newId");
  }
}
