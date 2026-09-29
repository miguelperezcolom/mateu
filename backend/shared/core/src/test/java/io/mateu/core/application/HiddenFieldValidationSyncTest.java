package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
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
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
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

  /**
   * The same shape on a hand-written {@link Crud} whose one form class serves view, edit AND
   * creation — the catalogue idiom (ec-demo1's {@code CatalogueCrud}). The creation form is built
   * from {@code creationForm()}, not from an entity, so it is a different road to the same wire.
   */
  public static class Form implements Identifiable {
    @jakarta.validation.constraints.NotEmpty @ReadOnly @HiddenInCreate String id;

    @jakarta.validation.constraints.NotEmpty String name;

    public Form() {}

    Form(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  public record FormRow(String id, String name) {}

  @UI("/forms")
  @Title("Forms")
  public static class FormsCrud extends Crud<Form, Form, Form, Object, FormRow, String> {

    @Override
    public ListingData<FormRow> search(SearchRequest request, HttpRequest httpRequest) {
      var rows = List.of(new FormRow("f1", "First"));
      return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
    }

    @Override
    public Form view(String id, HttpRequest httpRequest) {
      return new Form(id, "First");
    }

    @Override
    public Form edit(String id, HttpRequest httpRequest) {
      return new Form(id, "First");
    }

    @Override
    public Form creationForm(HttpRequest httpRequest) {
      return new Form();
    }

    @Override
    public String create(HttpRequest httpRequest) {
      return "f1";
    }

    @Override
    public String save(HttpRequest httpRequest) {
      return "f1";
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ModelsCrud.class, FormsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private List<String> validatedFieldsAt(String route) {
    return validatedFieldsAt(route, "/models", ModelsCrud.class);
  }

  private List<String> validatedFieldsAt(String route, String consumedRoute, Class<?> crud) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute(consumedRoute)
                .serverSideType(crud.getName())
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

  @Test
  void aHandWrittenCrudsCreationFormDoesNotValidateAFieldItHidesFromCreation() {
    assertThat(validatedFieldsAt("/forms/new", "/forms", FormsCrud.class))
        .contains("name")
        .doesNotContain("id");
  }

  @Test
  void aHandWrittenCrudsEditFormStillValidatesThatField() {
    assertThat(validatedFieldsAt("/forms/f1/edit", "/forms", FormsCrud.class))
        .contains("id", "name");
  }
}
