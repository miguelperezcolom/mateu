package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Screen data load: a @RestData view advertises a synthetic __restdata__ action carrying the
 * client-side REST descriptor plus an OnLoad trigger that fires it, so the initial data is fetched
 * client-side and merged into the form state — reusing the @RestAction fetch+merge machinery.
 */
class RestDataSyncTest {

  @SuppressWarnings("unused")
  @UI("/restdata")
  @Title("Rest data")
  @RestData(
      url = "https://api.example.com/me?token=${state.token}",
      headers = {"Authorization: Bearer x"},
      resultPath = "profile")
  public static class RestDataForm {
    String name;
    String email;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestDataForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void restDataAdvertisesAnOnLoadActionCarryingTheEndpointDescriptor() {
    var increment = mateu.sync("/restdata");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();

    // the synthetic action carries the client-side REST descriptor
    var action =
        component.actions().stream()
            .filter(a -> "__restdata__".equals(a.id()))
            .findFirst()
            .orElseThrow();
    var rest = action.restAction();
    assertThat(rest).isNotNull();
    assertThat(rest.resultPath()).isEqualTo("profile");
    assertThat(rest.successMessage()).isNull(); // silent load
    assertThat(rest.source().url()).isEqualTo("https://api.example.com/me?token=${state.token}");
    assertThat(rest.source().headers()).containsEntry("Authorization", "Bearer x");

    // an OnLoad trigger fires it on entry
    assertThat(component.triggers())
        .filteredOn(t -> t instanceof OnLoadTriggerDto)
        .extracting(t -> ((OnLoadTriggerDto) t).actionId())
        .contains("__restdata__");
  }
}
