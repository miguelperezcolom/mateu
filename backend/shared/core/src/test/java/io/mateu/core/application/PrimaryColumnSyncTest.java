package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.uidl.annotations.PrimaryColumn;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The rich "primary" column (coherence-plan #6): a {@code @PrimaryColumn(caption, leading)} row
 * field becomes a column with stereotype {@code primary} carrying {@code captionPath}/{@code
 * leadingPath} — the title + secondary caption line + leading avatar composed into one cell by the
 * renderer. This pins the wire the client-side expander and every renderer read.
 */
class PrimaryColumnSyncTest {

  public static class Person implements Identifiable {
    String id;

    @PrimaryColumn(caption = "email", leading = "avatar")
    String name;

    String email;
    String avatar;

    public Person() {}

    @Override
    public String id() {
      return id;
    }
  }

  @UI("/people-primary")
  @Title("People")
  public static class PeopleCrud extends AutoCrud<Person> {
    @Override
    public CrudStore<Person> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Person> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Person entity) {
          return entity.id;
        }

        @Override
        public List<Person> findAll() {
          return List.of();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PeopleCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static CrudlDto findCrudl(ComponentDto component) {
    if (component instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof CrudlDto crudl) return crudl;
      for (var child : client.children()) {
        var found = findCrudl(child);
        if (found != null) return found;
      }
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findCrudl(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static GridColumnDto column(CrudlDto crudl, String id) {
    for (var col : crudl.columns()) {
      if (col instanceof ClientSideComponentDto c
          && c.metadata() instanceof GridColumnDto gc
          && id.equals(gc.id())) {
        return gc;
      }
    }
    throw new AssertionError("column " + id + " not found");
  }

  @Test
  void aPrimaryColumnCarriesTheStereotypeAndTheCaptionAndLeadingPaths() {
    var increment =
        mateu.run(
            io.mateu.dtos.RunActionRqDto.builder()
                .route("/people-primary")
                .consumedRoute("/people-primary")
                .serverSideType(PeopleCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .componentState(java.util.Map.of())
                .build());
    var crudl = findCrudl(increment.fragments().get(0).component());
    assertThat(crudl).as("the crud should render a listing").isNotNull();

    var name = column(crudl, "name");
    assertThat(name.stereotype()).isEqualTo("primary");
    assertThat(name.captionPath()).isEqualTo("email");
    assertThat(name.leadingPath()).isEqualTo("avatar");

    // A plain column keeps the defaults — no caption/leading leaks onto it.
    var email = column(crudl, "email");
    assertThat(email.stereotype()).isEqualTo("regular");
    assertThat(email.captionPath()).isNull();
    assertThat(email.leadingPath()).isNull();
  }
}
