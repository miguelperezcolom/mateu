package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An enum whose {@code toString()} is its display text: its options carry the CONSTANT NAME as the
 * value — what the state holds and what the server parses back — and the {@code toString()} only as
 * the label. The value used to be the {@code toString()}, so picking "Second year" in a filter sent
 * a value the server could not read and the filter was silently ignored.
 */
class EnumWithToStringSyncTest {

  public enum Year {
    FIRST("First year"),
    SECOND("Second year");

    private final String text;

    Year(String text) {
      this.text = text;
    }

    @Override
    public String toString() {
      return text;
    }
  }

  @SuppressWarnings("unused")
  public static class Student implements Identifiable {
    String id;
    String name;
    Year year;

    public Student() {}

    Student(String id, String name, Year year) {
      this.id = id;
      this.name = name;
      this.year = year;
    }

    @Override
    public String id() {
      return id;
    }
  }

  @UI("/students-by-year")
  @Title("Students")
  public static class Students extends AutoCrud<Student> {
    @Override
    public CrudStore<Student> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Student> findById(String id) {
          return findAll().stream().filter(s -> s.id.equals(id)).findFirst();
        }

        @Override
        public String save(Student entity) {
          return entity.id;
        }

        @Override
        public List<Student> findAll() {
          return List.of(
              new Student("s1", "Ana", Year.FIRST), new Student("s2", "Bea", Year.SECOND));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Students.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto.RunActionRqDtoBuilder request(String actionId) {
    return RunActionRqDto.builder()
        .route("/students-by-year")
        .consumedRoute("/students-by-year")
        .serverSideType(Students.class.getName())
        .actionId(actionId)
        .initiatorComponentId("st_app");
  }

  @Test
  void theOptionValueIsTheConstantNameAndTheLabelItsToString() {
    var crudl = new ArrayList<CrudlDto>();
    FieldKindsSyncTest.walk(
        mateu.run(request("").build()).fragments().get(0).component(), CrudlDto.class, crudl);
    FormFieldDto year =
        crudl.get(0).filters().stream()
            .filter(field -> "year".equals(field.fieldId()))
            .findFirst()
            .orElseThrow();
    assertThat(year.options())
        .extracting(OptionDto::value, OptionDto::label)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("FIRST", "First year"),
            org.assertj.core.groups.Tuple.tuple("SECOND", "Second year"));
  }

  @Test
  void filteringByTheOptionValueRestrictsTheRows() {
    var state = new HashMap<String, Object>(Map.of("page", 0, "size", 10, "searchText", ""));
    state.put("year", "SECOND");
    var increment = mateu.run(request("search").componentState(state).build());
    List<?> rows = null;
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof ListingData<?> listing) {
        rows = listing.page().content();
      }
    }
    assertThat(rows).hasSize(1);
  }
}
