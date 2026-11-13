package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FileDownload;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @EyesOnly} on a row field hides the COLUMN and the VALUE, on every listing path: a plain
 * {@link Listing}, an AutoCrud, nested objects in a row, the CSV export, and the sort and filter
 * keys (the order or the matches of a hidden column tell its values as well as the column would).
 * Before (GA review S2) the column was drawn and the value sent in every search answer.
 */
class ListingFieldAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class Badge {
    public String label;

    @EyesOnly(roles = "hr")
    public String code;

    public Badge() {}

    Badge(String label, String code) {
      this.label = label;
      this.code = code;
    }
  }

  public static class Emp implements Identifiable {
    public String id;
    public String name;

    @EyesOnly(roles = "hr")
    public String salary;

    public Badge badge;

    public Emp() {}

    Emp(String id, String name, String salary) {
      this.id = id;
      this.name = name;
      this.salary = salary;
      this.badge = new Badge("B-" + id, "BADGE-SECRET-" + id);
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Emp> EMPS =
      new ArrayList<>(
          List.of(
              new Emp("e1", "Ana", "SALARY-SECRET-2"),
              new Emp("e2", "Bea", "SALARY-SECRET-3"),
              new Emp("e3", "Carla", "SALARY-SECRET-1")));

  @UI("/acl-emps")
  @Title("Emps")
  public static class Emps implements Listing<Emp> {
    @Override
    public ListingData<Emp> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(EMPS);
    }
  }

  @UI("/acl-emps-crud")
  @Title("Emps")
  public static class EmpsCrud extends AutoCrud<Emp> {
    @Override
    public CrudStore<Emp> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Emp> findById(String id) {
          return EMPS.stream().filter(e -> e.id.equals(id)).findFirst();
        }

        @Override
        public String save(Emp entity) {
          return entity.id;
        }

        @Override
        public List<Emp> findAll() {
          return EMPS;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Emps.class, EmpsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(
      Class<?> type, String route, String action, Map<String, Object> state, String... roles) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(type.getName())
            .actionId(action)
            .initiatorComponentId("x")
            .componentState(state)
            .parameters(Map.of())
            .build(),
        roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles));
  }

  private static String json(Object o) {
    return JSON.valueToTree(o).toString();
  }

  @Test
  void aPlainListingNeitherDrawsNorSendsTheHiddenColumn() {
    var load = json(run(Emps.class, "/acl-emps", "", Map.of()));
    assertThat(load).doesNotContain("\"id\":\"salary\"");
    var rows = json(run(Emps.class, "/acl-emps", "search", Map.of()));
    assertThat(rows).contains("Ana").doesNotContain("SALARY-SECRET").doesNotContain("BADGE-SECRET");
    // the caller it is for sees both
    assertThat(json(run(Emps.class, "/acl-emps", "", Map.of(), "hr")))
        .contains("\"id\":\"salary\"");
    assertThat(json(run(Emps.class, "/acl-emps", "search", Map.of(), "hr")))
        .contains("SALARY-SECRET-1", "BADGE-SECRET-e1");
  }

  @Test
  void anAutoCrudNeitherDrawsNorSendsTheHiddenColumn() {
    assertThat(json(run(EmpsCrud.class, "/acl-emps-crud", "", Map.of())))
        .doesNotContain("SALARY-SECRET");
    var rows = json(run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of()));
    assertThat(rows).contains("Ana").doesNotContain("SALARY-SECRET").doesNotContain("BADGE-SECRET");
    assertThat(json(run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of(), "hr")))
        .contains("SALARY-SECRET-1");
  }

  @Test
  void noSortingNorFilteringByAHiddenColumn() {
    var sorted =
        json(
            run(
                EmpsCrud.class,
                "/acl-emps-crud",
                "search",
                Map.of("sort", List.of(Map.of("fieldId", "salary", "direction", "ascending")))));
    // not sorted by salary (Carla first): the declared order stays
    assertThat(sorted.indexOf("Ana")).isLessThan(sorted.indexOf("Carla"));
    var hrSorted =
        json(
            run(
                EmpsCrud.class,
                "/acl-emps-crud",
                "search",
                Map.of("sort", List.of(Map.of("fieldId", "salary", "direction", "ascending"))),
                "hr"));
    assertThat(hrSorted.indexOf("Carla")).isLessThan(hrSorted.indexOf("Ana"));
    // a filter on the hidden field is ignored: every row comes back
    var filtered =
        json(run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of("salary", "SECRET-1")));
    assertThat(filtered).contains("Ana", "Bea", "Carla");
    var hrFiltered =
        json(run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of("salary", "SECRET-1"), "hr"));
    assertThat(hrFiltered).contains("Carla").doesNotContain("Bea");
  }

  @Test
  void theExportLeavesTheHiddenColumnOut() {
    var exported = run(EmpsCrud.class, "/acl-emps-crud", "export-csv", Map.of());
    var file =
        exported.commands().stream()
            .filter(c -> "DownloadFile".equals(String.valueOf(c.type())))
            .map(c -> (FileDownload) c.data())
            .findFirst()
            .orElseThrow();
    var csv = new String(Base64.getDecoder().decode(file.base64Content()), StandardCharsets.UTF_8);
    assertThat(csv).contains("Ana").doesNotContainIgnoringCase("salary");
  }

  @Test
  void aPageIsBounded() {
    var huge =
        run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of("size", 10_000_000, "page", -3));
    var page = json(huge);
    assertThat(page).contains("\"pageSize\":500").contains("\"pageNumber\":0").contains("Ana");
    // 0 or less is no "every row": the maximum too (the ports' rule)
    for (var size : List.of(0, -1)) {
      assertThat(json(run(EmpsCrud.class, "/acl-emps-crud", "search", Map.of("size", size))))
          .as("size " + size)
          .contains("\"pageSize\":500");
    }
  }
}
