package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * An {@code editInDrawer()} crud reached as a {@code @Menu} entry of an app shell saves the record
 * the drawer edits. The drawer's save is sent with the app's route ({@code /rates}) and consumed
 * route ({@code ""}): read as a record route, the crud's own segment was taken for the record id
 * and every save was refused as "This record no longer exists".
 */
class DrawerCrudInAppMenuSyncTest {

  public static class Rate implements Identifiable {
    String id;
    String name;
    int amount;

    public Rate() {}

    public Rate(String id, String name, int amount) {
      this.id = id;
      this.name = name;
      this.amount = amount;
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

  static final List<Rate> RATES = new ArrayList<>();

  public static class RatesCrud extends AutoCrud<Rate> {
    @Override
    public boolean editInDrawer() {
      return true;
    }

    @Override
    public CrudStore<Rate> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Rate> findById(String id) {
          return RATES.stream().filter(rate -> rate.id().equals(id)).findFirst();
        }

        @Override
        public String save(Rate entity) {
          RATES.removeIf(rate -> rate.id().equals(entity.id()));
          RATES.add(entity);
          return entity.id;
        }

        @Override
        public List<Rate> findAll() {
          return RATES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          RATES.removeIf(rate -> selectedIds.contains(rate.id()));
        }
      };
    }
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Back office")
  public static class BackOfficeApp {
    @Menu RatesCrud rates;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // own instance: a root app changes route resolution for every other fixture
    mateu = TestMateu.withUis(BackOfficeApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    RATES.clear();
    RATES.add(new Rate("r1", "Standard", 100));
  }

  private static UIIncrementDto saveFromTheDrawer(String route, String consumedRoute) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(RatesCrud.class.getName())
            .actionId("save")
            .initiatorComponentId("ux_root_app")
            .componentState(Map.of())
            .parameters(
                Map.of(
                    "initiatorState", Map.of("id", "r1", "name", "Standard (new)", "amount", 120)))
            .build());
  }

  private static void assertSaved(UIIncrementDto increment) {
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .doesNotContain(
            "This record no longer exists. Reload the list to see the current records.");
    assertThat(increment.commands()).anyMatch(c -> c.type() == UICommandTypeDto.CloseModal);
    assertThat(RATES).hasSize(1);
    assertThat(RATES.get(0).name).isEqualTo("Standard (new)");
    assertThat(RATES.get(0).amount).isEqualTo(120);
  }

  @Test
  void aDrawerSaveSentWithTheAppsRouteUpdatesTheRecord() {
    assertSaved(saveFromTheDrawer("/rates", ""));
  }

  @Test
  void aDrawerSaveSentWithTheCrudsOwnRouteUpdatesTheRecord() {
    assertSaved(saveFromTheDrawer("/rates", "/rates"));
  }
}
