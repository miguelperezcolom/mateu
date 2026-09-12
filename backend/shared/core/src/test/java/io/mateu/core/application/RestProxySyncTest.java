package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Proxy mode: a @RestOptions(proxy=true) field carries proxy=true on its optionsSource so the
 * renderer routes the fetch through the Mateu server (the __restfetch__ action) instead of fetching
 * the endpoint directly — the CORS/auth-hardening flag. A plain @RestOptions stays proxy=false.
 */
class RestProxySyncTest {

  @SuppressWarnings("unused")
  @UI("/restproxy")
  @Title("Rest proxy")
  public static class ProxyForm {
    @RestOptions(url = "https://api.example.com/x?t=${secret.TOKEN}", proxy = true)
    String viaServer;

    @RestOptions(url = "https://public.example.com/x")
    String direct;
  }

  @SuppressWarnings("unused")
  @UI("/restdirect")
  @Title("Rest direct")
  public static class DirectForm {
    @RestOptions(url = "https://public.example.com/x")
    String direct;
  }

  @SuppressWarnings("unused")
  @UI("/restref")
  @Title("Rest ref")
  public static class RefForm {
    // By ref, no explicit mapping paths: the catalogue must supply them, so the wire must leave
    // valuePath/labelPath BLANK rather than baking in the annotation defaults ("value"/"label"),
    // which would win over the catalogue in resolveRestSource.
    @RestOptions(source = "cities")
    String byRef;

    // Explicit mapping paths on a by-ref source still travel — the surface overrides the catalogue.
    @RestOptions(source = "cities", valuePath = "code", labelPath = "town")
    String byRefExplicit;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProxyForm.class, DirectForm.class, RefForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void proxyFlagTravelsOnTheOptionsSource() {
    var increment = mateu.sync("/restproxy");
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.FormFieldDto.class, fields);

    var viaServer =
        fields.stream().filter(f -> "viaServer".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(viaServer.optionsSource()).isNotNull();
    assertThat(viaServer.optionsSource().proxy()).isTrue();
    // the raw ${secret.X} template rides on the wire, but never its resolved value
    assertThat(viaServer.optionsSource().url()).contains("${secret.TOKEN}");

    var direct =
        fields.stream().filter(f -> "direct".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(direct.optionsSource().proxy()).isFalse();
  }

  @Test
  void byRefOptionsSourceLeavesMappingPathsBlankSoTheCatalogueWins() {
    var increment = mateu.sync("/restref");
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.FormFieldDto.class, fields);

    var byRef = fields.stream().filter(f -> "byRef".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(byRef.optionsSource().ref()).isEqualTo("cities");
    // the annotation defaults ("value"/"label") must NOT leak — blank lets the catalogue supply
    // them
    assertThat(byRef.optionsSource().valuePath()).isBlank();
    assertThat(byRef.optionsSource().labelPath()).isBlank();

    var explicit =
        fields.stream().filter(f -> "byRefExplicit".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(explicit.optionsSource().valuePath()).isEqualTo("code");
    assertThat(explicit.optionsSource().labelPath()).isEqualTo("town");
  }

  @Test
  void proxyViewAdvertisesTheRestfetchAction() {
    var component =
        (io.mateu.dtos.ServerSideComponentDto)
            mateu.sync("/restproxy").fragments().get(0).component();
    assertThat(component.actions().stream().anyMatch(a -> "__restfetch__".equals(a.id()))).isTrue();
  }

  @Test
  void directOnlyViewDoesNotAdvertiseTheRestfetchAction() {
    var component =
        (io.mateu.dtos.ServerSideComponentDto)
            mateu.sync("/restdirect").fragments().get(0).component();
    assertThat(component.actions().stream().anyMatch(a -> "__restfetch__".equals(a.id())))
        .isFalse();
  }
}
