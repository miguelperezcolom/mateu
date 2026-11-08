package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
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
 * A CRUD EMBEDDED in another page (an {@link EmbeddedView} of an {@code AutoCrud}) is an island
 * routed relative to ITSELF: its inner views load the CRUD's listing, never the host page. On
 * 3.0-beta.51 the island was bound to the HOST's route, so its first load rendered the host inside
 * itself, which rendered the island again — "request loop detected" / "Not found".
 */
class EmbeddedCrudSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class Planet implements Identifiable {
    public String id;
    public String name;

    public Planet() {}

    Planet(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static CrudStore<Planet> planets() {
    return new CrudStore<>() {
      @Override
      public Optional<Planet> findById(String id) {
        return findAll().stream().filter(p -> p.id.equals(id)).findFirst();
      }

      @Override
      public String save(Planet entity) {
        return entity.id;
      }

      @Override
      public List<Planet> findAll() {
        return List.of(new Planet("p1", "Jupiter"), new Planet("p2", "Saturn"));
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }

  /** A crud with no route of its own — what the explorer's `java:` examples embed. */
  @Title("Planets")
  public static class PlanetsCrud extends AutoCrud<Planet> {
    @Override
    public CrudStore<Planet> store() {
      return planets();
    }
  }

  /** A crud that also has a route of its own. */
  @UI("/routed-planets")
  @Title("Routed planets")
  public static class RoutedPlanetsCrud extends AutoCrud<Planet> {
    @Override
    public CrudStore<Planet> store() {
      return planets();
    }
  }

  @UI("/planets-host")
  public static class Host implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("The host page"),
          new EmbeddedView(new PlanetsCrud()),
          new EmbeddedView(new RoutedPlanetsCrud()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class, RoutedPlanetsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static void islands(Object node, List<ServerSideComponentDto> out) {
    if (node instanceof ServerSideComponentDto server) {
      out.add(server);
      server.children().forEach(c -> islands(c, out));
    } else if (node instanceof ClientSideComponentDto client) {
      client.children().forEach(c -> islands(c, out));
    }
  }

  private static AppDto mediatorOf(ServerSideComponentDto island) {
    for (var child : island.children()) {
      if (child instanceof ClientSideComponentDto client
          && client.metadata() instanceof AppDto app) {
        return app;
      }
    }
    return null;
  }

  private void assertTheIslandLoadsTheCrudNotTheHost(Class<?> crudType) {
    var host = mateu.sync("/planets-host");
    var all = new ArrayList<ServerSideComponentDto>();
    host.fragments().forEach(f -> islands(f.component(), all));
    var island =
        all.stream()
            .filter(s -> crudType.getName().equals(s.serverSideType()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no island of " + crudType.getSimpleName()));
    var app = mediatorOf(island);
    assertThat(app).as("the island is a mediator of the crud").isNotNull();
    // the mediator's home is the CRUD's route, never the host's
    assertThat(app.homeRoute()).doesNotStartWith("/planets-host").contains("_embeddedMediator");

    // what the client does next: the mediator loads its home
    var inner =
        mateu.run(
            RunActionRqDto.builder()
                .route(app.homeRoute())
                .consumedRoute(app.homeConsumedRoute())
                .serverSideType(app.homeServerSideType())
                .serverSideComponentRoute(island.route())
                .actionId("")
                .initiatorComponentId(island.id() + "_app")
                .componentState(island.initialData() instanceof Map<?, ?> m ? castMap(m) : Map.of())
                .build());
    var wire = JSON.valueToTree(inner).toString();
    assertThat(wire).doesNotContain("The host page");
    assertThat(wire).contains("\"Crud\"");
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> castMap(Map<?, ?> m) {
    return (Map<String, Object>) m;
  }

  @Test
  void anEmbeddedCrudWithoutARouteOfItsOwnLoadsItsListingNotTheHost() {
    assertTheIslandLoadsTheCrudNotTheHost(PlanetsCrud.class);
  }

  @Test
  void anEmbeddedRoutedCrudLoadsItsListingNotTheHost() {
    assertTheIslandLoadsTheCrudNotTheHost(RoutedPlanetsCrud.class);
  }
}
