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
 * External REST options: a @RestOptions field renders as a select whose options the renderer
 * fetches CLIENT-SIDE — the descriptor (url/method/headers/paths) travels on FormFieldDto.
 * optionsSource so the frontend can call the endpoint directly (the first surface of consuming
 * non-Mateu endpoints).
 */
class RestOptionsSyncTest {

  @SuppressWarnings("unused")
  @UI("/restopts")
  @Title("Rest options")
  public static class RestOptsForm {

    @RestOptions(
        url = "https://api.example.com/countries?token=${state.token}",
        method = "GET",
        headers = {"Authorization: Bearer ${state.token}"},
        itemsPath = "data.countries",
        valuePath = "code",
        labelPath = "name.common")
    String country;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestOptsForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void restOptionsFieldIsASelectCarryingTheEndpointDescriptor() {
    var increment = mateu.sync("/restopts");
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.FormFieldDto.class, fields);

    var country =
        fields.stream().filter(f -> "country".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(country.stereotype()).isEqualTo("select");
    var source = country.optionsSource();
    assertThat(source).isNotNull();
    assertThat(source.url()).isEqualTo("https://api.example.com/countries?token=${state.token}");
    assertThat(source.method()).isEqualTo("GET");
    assertThat(source.headers()).containsEntry("Authorization", "Bearer ${state.token}");
    assertThat(source.itemsPath()).isEqualTo("data.countries");
    assertThat(source.valuePath()).isEqualTo("code");
    assertThat(source.labelPath()).isEqualTo("name.common");
  }
}
