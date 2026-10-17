package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.NoticeDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReadOnlySupplier;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A field whose type a {@link ComponentAdapter} renders is an independent island inside the host
 * form — its own server-side component, carrying the ADAPTED model's type, state and actions, so
 * its buttons round-trip through the adapter, not the host. Also: read-only by
 * {@code @GeneratedValue} or a {@link ReadOnlySupplier}, and a wide {@code @Notice} spanning its
 * columns.
 */
class AdaptedFieldIslandSyncTest {

  public static class Weather {
    String city = "Palma";
    int degrees = 31;
  }

  public static class WeatherAdapter implements ComponentAdapter<Weather> {
    @Override
    public Class<Weather> type() {
      return Weather.class;
    }

    @Override
    public AdaptedView adapt(Weather model, HttpRequest httpRequest) {
      return new AdaptedView(
          List.of(new Text(model.city + " " + model.degrees + "º")),
          Map.of("city", model.city, "degrees", model.degrees),
          Map.of(),
          List.of("refresh"));
    }

    @Override
    public Weather deserialize(Map<String, Object> state, HttpRequest httpRequest) {
      var weather = new Weather();
      if (state.containsKey("city")) weather.city = String.valueOf(state.get("city"));
      return weather;
    }
  }

  @UI("/adapted-field-island")
  public static class Dashboard implements ReadOnlySupplier {
    public String title = "Today";

    @GeneratedValue(io.mateu.core.infra.valuegenerators.UUIDValueGenerator.class)
    public String reference = "R-1";

    public String locked = "x";

    @Notice(theme = "warning", icon = "!", actionLabel = "Fix", actionId = "fix")
    @Colspan(2)
    public String warning = "2 complaints pending";

    public Weather weather = new Weather();

    public void fix() {}

    @Override
    public boolean isReadOnly(String memberName, HttpRequest httpRequest) {
      return "locked".equals(memberName);
    }
  }

  static TestMateu mateu;
  static ServerSideComponentDto root;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new WeatherAdapter()), Dashboard.class);
    root =
        (ServerSideComponentDto) mateu.sync("/adapted-field-island").fragments().get(0).component();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<ServerSideComponentDto> islands(
      Object node, List<ServerSideComponentDto> out) {
    if (node instanceof ServerSideComponentDto server) {
      if (server != root) out.add(server);
      server.children().forEach(c -> islands(c, out));
    } else if (node instanceof io.mateu.dtos.ClientSideComponentDto client) {
      client.children().forEach(c -> islands(c, out));
      if (client.metadata() != null && client.metadata().getClass().isRecord()) {
        for (var rc : client.metadata().getClass().getRecordComponents()) {
          try {
            var value = rc.getAccessor().invoke(client.metadata());
            if (value instanceof io.mateu.dtos.ComponentDto dto) islands(dto, out);
            if (value instanceof List<?> list) list.forEach(item -> islands(item, out));
          } catch (ReflectiveOperationException e) {
            throw new AssertionError(e);
          }
        }
      }
    }
    return out;
  }

  @Test
  void anAdaptedFieldIsAnIslandOfTheAdaptedModel() {
    var island =
        islands(root, new ArrayList<>()).stream()
            .filter(s -> Weather.class.getName().equals(s.serverSideType()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no Weather island"));
    assertThat(island.actions()).extracting(ActionDto::id).contains("refresh");
    assertThat(String.valueOf(island.initialData())).contains("Palma");
  }

  @Test
  void generatedValuesAndSupplierLockedFieldsAreReadOnly() {
    var fields = new LinkedHashMap<String, FormFieldDto>();
    FieldKindsSyncTest.collect(root, FormFieldDto.class).forEach(f -> fields.put(f.fieldId(), f));
    assertThat(fields.get("reference").readOnly()).isTrue();
    assertThat(fields.get("locked").readOnly()).isTrue();
    assertThat(fields.get("title").readOnly()).isFalse();
  }

  @Test
  void aNoticeCarriesItsThemeIconAndAction() {
    var notice = FieldKindsSyncTest.collect(root, NoticeDto.class).get(0);
    assertThat(notice.theme()).isEqualTo("warning");
    assertThat(notice.icon()).isEqualTo("!");
    assertThat(notice.actionLabel()).isEqualTo("Fix");
    assertThat(notice.actionId()).isEqualTo("fix");
  }
}
