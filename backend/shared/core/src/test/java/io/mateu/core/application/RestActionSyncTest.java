package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Endpoint actions: a @Button method carrying @RestAction advertises its action with a restAction
 * descriptor on the wire, so the frontend calls the endpoint CLIENT-SIDE (fetch + toast + optional
 * state merge) instead of dispatching to the Mateu server.
 */
class RestActionSyncTest {

  @SuppressWarnings("unused")
  @UI("/restaction")
  @Title("Rest action")
  public static class RestActionForm {

    String zip = "28001";
    String street;
    String city;

    @Button
    @RestAction(
        url = "https://api.example.com/zip/${state.zip}",
        method = "GET",
        headers = {"Authorization: Bearer x"},
        resultPath = "address",
        successMessage = "Address found")
    public void lookup() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestActionForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void restActionButtonAdvertisesTheEndpointDescriptorOnItsAction() {
    var increment = mateu.sync("/restaction");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();

    var lookup =
        component.actions().stream().filter(a -> "lookup".equals(a.id())).findFirst().orElseThrow();
    ActionDto.class.cast(lookup); // type sanity
    var rest = lookup.restAction();
    assertThat(rest).isNotNull();
    assertThat(rest.successMessage()).isEqualTo("Address found");
    assertThat(rest.resultPath()).isEqualTo("address");
    assertThat(rest.source()).isNotNull();
    assertThat(rest.source().url()).isEqualTo("https://api.example.com/zip/${state.zip}");
    assertThat(rest.source().method()).isEqualTo("GET");
    assertThat(rest.source().headers()).containsEntry("Authorization", "Bearer x");
  }
}
