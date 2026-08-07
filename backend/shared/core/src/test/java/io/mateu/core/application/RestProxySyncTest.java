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

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProxyForm.class);
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
}
