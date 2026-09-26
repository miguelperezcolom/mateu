package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@code @Hidden} on any {@code @Menu} field, not only a remote one. Real case: a "New booking"
 * wizard reached from the New button of the bookings listing, so an entry for it on the bar only
 * repeated that button — but its route must keep resolving, for that button and for a reload.
 */
class MenuHiddenLocalEntrySyncTest {

  @Title("Bookings")
  public static class BookingsPage {
    public String name = "bookings";
  }

  @Title("New booking")
  public static class NewBookingPage {
    public String name = "new booking";
  }

  public static class CallCenterMenu {
    @Menu BookingsPage bookings;

    // reached from the listing's New button: resolves, draws no entry
    @Menu @Hidden NewBookingPage newBooking;
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Booking")
  public static class Root {
    @Menu CallCenterMenu callCenter;

    @Menu @Hidden BookingsPage archived;
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUis(Root.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  private UIIncrementDto viaUrl(String route) {
    return mateu.run(
        RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  private static AppDto app(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) return found;
    }
    return null;
  }

  private static AppDto findApp(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) return app;
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static MenuOptionDto find(List<MenuOptionDto> menu, String label) {
    for (var option : menu) {
      if (label.equals(option.label())) return option;
      if (option.submenus() != null) {
        var found = find(option.submenus(), label);
        if (found != null) return found;
      }
    }
    return null;
  }

  @Test
  void aHiddenEntryTravelsInvisibleAtAnyDepthAndItsSiblingsStayVisible() {
    var app = app(viaUrl(""));
    assertThat(app).isNotNull();
    assertThat(find(app.menu(), "New booking").visible()).isFalse();
    assertThat(find(app.menu(), "Bookings").visible()).isTrue();
    assertThat(find(app.menu(), "Call center").visible()).isTrue();
    assertThat(find(app.menu(), "Archived").visible()).isFalse();
  }

  @Test
  void aHiddenEntrysRouteResolvesLikeAVisibleOnes() {
    var visible = find(app(viaUrl("")).menu(), "Bookings");
    var hidden = find(app(viaUrl("")).menu(), "New booking");
    var viaVisible = app(viaUrl(visible.path()));
    var viaHidden = app(viaUrl(hidden.path()));
    assertThat(viaVisible.homeRoute()).isEqualTo(visible.path());
    assertThat(viaHidden.homeRoute()).isEqualTo(hidden.path());
    assertThat(viaHidden.homeServerSideType()).isEqualTo(viaVisible.homeServerSideType());
  }
}
