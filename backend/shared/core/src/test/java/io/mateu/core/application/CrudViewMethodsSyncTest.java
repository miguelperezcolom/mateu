package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Message;
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
 * A button on a CRUD record's view runs a method of the RECORD or of the CRUD, injecting what it
 * asks for — the record, the crud, the request — and answers with what it returns; a method the
 * request may not call is refused, never run.
 */
class CrudViewMethodsSyncTest {

  static final List<String> CALLS = new ArrayList<>();

  public static class Asset implements Identifiable {
    public String id = "a1";
    public String name = "Laptop";

    public Asset() {}

    @Override
    public String id() {
      return id;
    }

    @Toolbar
    public Message tag(AssetsCrud crud, HttpRequest httpRequest) {
      CALLS.add("tag:" + name + ":" + (crud != null));
      return Message.success("tagged " + name);
    }

    @Toolbar
    private void wipe() {
      CALLS.add("wipe");
    }
  }

  @UI("/assets")
  @Title("Assets")
  public static class AssetsCrud extends AutoCrud<Asset> {
    @ViewToolbarButton
    public Message audit(Asset asset) {
      CALLS.add("audit:" + asset.name);
      return Message.success("audited " + asset.name);
    }

    @Override
    public CrudStore<Asset> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Asset> findById(String id) {
          return Optional.of(new Asset());
        }

        @Override
        public String save(Asset entity) {
          return entity.id;
        }

        @Override
        public List<Asset> findAll() {
          return List.of(new Asset());
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AssetsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto onView(String method) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/assets/a1")
            .consumedRoute("/assets")
            .serverSideType(AssetsCrud.class.getName())
            .actionId("action-on-view-" + method)
            .componentState(Map.of("id", "a1", "name", "Desk"))
            .initiatorComponentId("as_app")
            .build());
  }

  @Test
  void aRecordMethodGetsTheCrudInjectedAndAnswersWithItsMessage() {
    CALLS.clear();
    var increment = onView("tag");
    assertThat(CALLS).containsExactly("tag:Desk:true");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("tagged Desk"));
  }

  @Test
  void aCrudMethodGetsTheRecordShownInTheView() {
    CALLS.clear();
    var increment = onView("audit");
    assertThat(CALLS).containsExactly("audit:Desk");
    assertThat(increment.messages())
        .anySatisfy(m -> assertThat(m.text()).isEqualTo("audited Desk"));
  }

  @Test
  void aMethodTheRequestMayNotCallIsRefused() {
    CALLS.clear();
    RuntimeException refused = null;
    try {
      onView("wipe");
    } catch (RuntimeException e) {
      refused = e;
    }
    assertThat(CALLS).isEmpty();
    assertThat(refused).isNotNull();
    assertThat(MateuForbiddenException.find(refused)).isNotNull();
  }
}
