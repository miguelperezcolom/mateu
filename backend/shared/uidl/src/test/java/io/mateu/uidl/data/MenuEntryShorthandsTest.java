package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

/** The short constructors a menu is written with, and what each one leaves implied. */
class MenuEntryShorthandsTest {

  @Test
  void aRouteLinkFromALabelRoutesToItsCamelCase() {
    var link = new RouteLink("Sales Report");

    assertThat(link.route()).isEqualTo("salesReport");
    assertThat(link.path()).isEqualTo("salesReport");
    assertThat(link.label()).isEqualTo("Sales Report");
    assertThat(link.selected()).isFalse();
    assertThat(link.hidden()).isFalse();
    assertThat(link.presentation()).isNull();
    assertThat(new RouteLink("Sales Report", true).selected()).isTrue();
  }

  @Test
  void aRouteLinkWithAPathRoutesToIt() {
    var link = new RouteLink("/orders", "Orders");

    assertThat(link.route()).isEqualTo("/orders");
    assertThat(link.path()).isEqualTo("/orders");
    assertThat(new RouteLink("/orders", "Orders", true).selected()).isTrue();
  }

  @Test
  void aRemoteMenuMountsTheRemoteAppFromItsRoot() {
    var remote = new RemoteMenu("https://billing.example.com");

    assertThat(remote.route()).isEmpty();
    assertThat(remote.consumedRoute()).isEqualTo("_empty");
    assertThat(remote.params()).isEqualTo(Map.of());
    assertThat(remote.explode()).isFalse();
    assertThat(remote.hidden()).isFalse();
    assertThat(new RemoteMenu("https://b", true).explode()).isTrue();
    assertThat(new RemoteMenu("https://b", "/invoices").route()).isEqualTo("/invoices");
    var exploded = new RemoteMenu("https://b", "/invoices", true);
    assertThat(exploded.route()).isEqualTo("/invoices");
    assertThat(exploded.explode()).isTrue();
  }

  /** A remote section is never selected, disabled or a component of this app. */
  @Test
  void aRemoteMenuIsAPlainNavigationEntry() {
    var remote = new RemoteMenu("https://b").withHidden(true);

    assertThat(remote.hidden()).isTrue();
    assertThat(remote.selected()).isFalse();
    assertThat(remote.disabled()).isFalse();
    assertThat(remote.disabledOnClick()).isFalse();
    assertThat(remote.component()).isNull();
    assertThat(remote.itemData()).isNull();
    assertThat(remote.className()).isEmpty();
  }
}
