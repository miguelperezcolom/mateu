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

  /** A confirmed delete by catalogue reference — the static VCN slice's detail page. */
  @SuppressWarnings("unused")
  @UI("/restaction-confirmed")
  @Title("Confirmed rest action")
  public static class ConfirmedDelete {

    String id = "7";

    @io.mateu.uidl.annotations.Toolbar
    @io.mateu.uidl.annotations.Action(
        confirmationRequired = true,
        confirmationTitle = "Delete VCN",
        confirmationText = "Delete")
    @RestAction(source = "vcn-delete", successMessage = "Deleted", successRoute = "vcns")
    public void delete() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestActionForm.class, ConfirmedDelete.class);
  }

  @Test
  void anActionMethodKeepsBothItsBehaviourAndItsRestCall() {
    // @Action (how it behaves: confirmation) + @RestAction (what it calls) on one method: the
    // descriptor must survive, or the confirmed call is dispatched to a server instead
    var component =
        (ServerSideComponentDto) mateu.sync("/restaction-confirmed").fragments().get(0).component();
    var delete =
        component.actions().stream().filter(a -> "delete".equals(a.id())).findFirst().orElseThrow();
    assertThat(delete.confirmationRequired()).isTrue();
    assertThat(delete.restAction()).isNotNull();
    assertThat(delete.restAction().successRoute()).isEqualTo("vcns");
    assertThat(delete.restAction().source().ref()).isEqualTo("vcn-delete");
    // by reference, the annotation's default POST must not override the entry's DELETE
    assertThat(delete.restAction().source().method()).isBlank();
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
