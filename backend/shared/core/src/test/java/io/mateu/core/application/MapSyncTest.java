package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MapDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Map;
import io.mateu.uidl.data.MapMarker;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The street map carries its markers and the action a marker click runs; the click reaches the
 * view's method with the marker id in {@code _markerId}.
 */
class MapSyncTest {

  @UI("/hotels-map")
  @Title("Hotels")
  public static class HotelsMap implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
      return Map.builder()
          .id("hotels")
          .zoom("12")
          .markers(
              List.of(
                  MapMarker.builder()
                      .id("palma")
                      .latitude(39.5696)
                      .longitude(2.6502)
                      .label("Hotel Palma")
                      .description("120 rooms")
                      .color("#c74634")
                      .build(),
                  MapMarker.builder()
                      .id("port")
                      .latitude(39.5546)
                      .longitude(2.6236)
                      .label("Hotel Port")
                      .build()))
          .markerActionId("openHotel")
          .build();
    }

    public Object openHotel(HttpRequest httpRequest) {
      return Message.success("Opened " + httpRequest.runActionRq().parameters().get("_markerId"));
    }
  }

  @UI("/tiles-map")
  public static class TilesMap implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
      return Map.builder()
          .position("39.57, 2.65")
          .zoom("10")
          .tileUrl("https://tiles.example.com/{z}/{x}/{y}.png")
          .attribution("© Example Tiles")
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HotelsMap.class, TilesMap.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theMapTravelsWithItsMarkersAndMarkerAction() {
    var host = (ServerSideComponentDto) mateu.sync("/hotels-map").fragments().get(0).component();
    var map = (ClientSideComponentDto) host.children().get(0);

    assertThat(map.id()).isEqualTo("hotels");
    var dto = (MapDto) map.metadata();
    assertThat(dto.zoom()).isEqualTo("12");
    assertThat(dto.position()).isNull();
    assertThat(dto.markerActionId()).isEqualTo("openHotel");
    assertThat(dto.markers()).hasSize(2);
    // no tile provider declared: the renderers fall back to OpenStreetMap
    assertThat(dto.tileUrl()).isNull();
    assertThat(dto.attribution()).isNull();
    var palma = dto.markers().get(0);
    assertThat(palma.id()).isEqualTo("palma");
    assertThat(palma.latitude()).isEqualTo(39.5696);
    assertThat(palma.longitude()).isEqualTo(2.6502);
    assertThat(palma.label()).isEqualTo("Hotel Palma");
    assertThat(palma.description()).isEqualTo("120 rooms");
    assertThat(palma.color()).isEqualTo("#c74634");
    // the view handles the marker action, so it is advertised and the client sends it
    assertThat(host.actions()).extracting(ActionDto::id).contains("openHotel");
  }

  @Test
  void theTileProviderTravelsWhenDeclared() {
    var host = (ServerSideComponentDto) mateu.sync("/tiles-map").fragments().get(0).component();
    var dto = (MapDto) ((ClientSideComponentDto) host.children().get(0)).metadata();

    assertThat(dto.tileUrl()).isEqualTo("https://tiles.example.com/{z}/{x}/{y}.png");
    assertThat(dto.attribution()).isEqualTo("© Example Tiles");
  }

  @Test
  void aMarkerClickRunsTheActionWithTheMarkerId() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/hotels-map")
                .actionId("openHotel")
                .serverSideType(HotelsMap.class.getName())
                .parameters(java.util.Map.of("_markerId", "port"))
                .build());

    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("Opened port"));
  }

  @Test
  void theOldFourArgumentConstructorStillBuildsAMarkerlessMap() {
    var map = new Map("39.57, 2.65", "10", null, null);

    assertThat(map.markers()).isEmpty();
    assertThat(map.markerActionId()).isNull();
    assertThat(map.tileUrl()).isNull();
  }
}
