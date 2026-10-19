package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
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
 * NM12: a page title that is DATA — a record's own toString(), what a CRUD detail page and a routed
 * domain object are titled with — travels marked {@code titleIsText}, so the web header renders it
 * as text: a record named {@code <img src=//attacker/beacon>} must not plant markup in the header
 * of everyone who opens it. A title the developer declared ({@code @Title}) is not marked.
 */
class DataTitleAsTextSyncTest {

  public static class Customer implements Identifiable {
    String id;
    String name;

    public Customer() {}

    Customer(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Customer> CUSTOMERS = new ArrayList<>();

  @UI("/data-title-customers")
  @Title("Customers")
  public static class Customers extends AutoCrud<Customer> {
    @Override
    public CrudStore<Customer> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Customer> findById(String id) {
          return CUSTOMERS.stream().filter(c -> c.id.equals(id)).findFirst();
        }

        @Override
        public String save(Customer entity) {
          return entity.id;
        }

        @Override
        public List<Customer> findAll() {
          return CUSTOMERS;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  @UI("/data-title-record")
  public static class NamedRecord {
    public String name = "x";

    @Override
    public String toString() {
      return "<img src=\"//attacker.example/beacon\"><a href=\"https://phish.example\">Acme</a>";
    }
  }

  /** A record titled through {@code Named} — the documented way to name one — is data too. */
  @UI("/data-title-named")
  public static class NamedEntity implements io.mateu.uidl.interfaces.Named {
    public String code = "P-005";

    @Override
    public String id() {
      return code;
    }

    @Override
    public String name() {
      return "<b>Bold</b><img src=\"//attacker.example/beacon\">${appState.hotel}";
    }
  }

  @UI("/declared-title")
  @Title("<b>Declared</b>")
  public static class DeclaredTitle {
    public String name = "x";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    CUSTOMERS.add(new Customer("c1", "<img src=\"//attacker.example/beacon\">Mallory"));
    mateu =
        TestMateu.withUis(
            Customers.class, NamedRecord.class, NamedEntity.class, DeclaredTitle.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<PageDto> pages(Object component, List<PageDto> out) {
    if (component instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof PageDto page) {
        out.add(page);
      }
      client.children().forEach(child -> pages(child, out));
    }
    if (component instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> pages(child, out));
    }
    return out;
  }

  private static List<PageDto> pagesOf(UIIncrementDto increment) {
    var out = new ArrayList<PageDto>();
    increment.fragments().forEach(f -> pages(f.component(), out));
    return out;
  }

  @Test
  void aRoutedRecordTitledByItsToStringIsMarkedText() {
    var page = pagesOf(mateu.sync("/data-title-record")).get(0);
    assertThat(page.title()).contains("<img");
    assertThat(page.titleIsText()).isTrue();
  }

  @Test
  void aCrudDetailPageTitledByTheRecordIsMarkedText() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/data-title-customers/c1")
                .consumedRoute("/data-title-customers")
                .serverSideType(Customers.class.getName())
                .actionId("")
                .componentState(Map.of())
                .build());
    var titled =
        pagesOf(increment).stream().filter(p -> p.title() != null && p.title().contains("Mallory"));
    assertThat(titled).isNotEmpty().allMatch(p -> Boolean.TRUE.equals(p.titleIsText()));
  }

  @Test
  void aDeclaredTitleIsNotMarked() {
    var page = pagesOf(mateu.sync("/declared-title")).get(0);
    assertThat(page.title()).isEqualTo("<b>Declared</b>");
    assertThat(page.titleIsText()).isNull();
  }

  @Test
  void aRecordNamedThroughNamedIsMarkedTextAndNotEvaluated() {
    var page = pagesOf(mateu.sync("/data-title-named")).get(0);
    assertThat(page.title()).contains("<img").contains("\\${appState.hotel}");
    assertThat(page.titleIsText()).isTrue();
  }
}
