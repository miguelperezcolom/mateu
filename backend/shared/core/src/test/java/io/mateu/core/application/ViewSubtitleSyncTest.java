package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The detail view of a crud record carries the record's own subtitle ({@link SubtitleSupplier}): a
 * booking shows its amounts under its title. The view page used to be built with a title and no
 * subtitle at all, so a record could not say anything there.
 */
class ViewSubtitleSyncTest {

  public static class Booking implements Identifiable, SubtitleSupplier {
    String id;
    String holder;

    public Booking() {}

    public Booking(String id, String holder) {
      this.id = id;
      this.holder = holder;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String subtitle() {
      return "Total 1.431,12 EUR (5 noches) · Pagado 0,00 EUR";
    }
  }

  static final List<Booking> BOOKINGS = List.of(new Booking("1", "Florian Pichler"));

  @UI("/bookings")
  @Title("Bookings")
  public static class BookingsCrud extends AutoCrud<Booking> {
    @Override
    public CrudStore<Booking> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Booking> findById(String id) {
          return BOOKINGS.stream().filter(b -> b.id().equals(id)).findFirst();
        }

        @Override
        public String save(Booking entity) {
          return entity.id();
        }

        @Override
        public List<Booking> findAll() {
          return BOOKINGS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BookingsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theViewPageCarriesTheRecordsSubtitle() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/bookings/1")
                .consumedRoute("/bookings")
                .serverSideType(BookingsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .build());
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    var page = findPage(component);
    assertThat(page).isNotNull();
    assertThat(page.subtitle()).isEqualTo("Total 1.431,12 EUR (5 noches) · Pagado 0,00 EUR");
  }

  private static PageDto findPage(Object node) {
    if (node instanceof ClientSideComponentDto clientSide) {
      if (clientSide.metadata() instanceof PageDto page) {
        return page;
      }
      for (var child : clientSide.children()) {
        var found = findPage(child);
        if (found != null) return found;
      }
    }
    if (node instanceof ServerSideComponentDto serverSide) {
      for (var child : serverSide.children()) {
        var found = findPage(child);
        if (found != null) return found;
      }
    }
    return null;
  }
}
