package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RecordSwitcher;
import io.mateu.uidl.data.SwitcherType;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RecordSwitcherSupplier;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Header and section affordances: the generic record/context switcher ({@link
 * RecordSwitcherSupplier}, the Redwood selectObject/selectContext), the section's edit / add /
 * view-more actions ({@code @Section(editAction, addAction, viewMoreAction)}) and the {@code
 * Announce} command (the Redwood announcement slot).
 */
class PageAffordancesSyncTest {

  @UI("/switcher-page")
  @Title("Customer")
  public static class CustomerPage implements RecordSwitcherSupplier {
    public String customer = "c1";
    public String name = "Ada";

    @Override
    public RecordSwitcher switcher(HttpRequest httpRequest) {
      return RecordSwitcher.builder()
          .options(List.of(new Option("c1", "Ada"), new Option("c2", "Grace")))
          .value(customer)
          .type(SwitcherType.object)
          .label("Customer")
          .searchable(true)
          .build();
    }

    @Override
    public Object switchTo(String value, HttpRequest httpRequest) {
      customer = value;
      name = "c2".equals(value) ? "Grace" : "Ada";
      return this;
    }
  }

  @UI("/section-affordances")
  @Title("Booking")
  public static class BookingPage {
    @Section(value = "Guests", addAction = "addGuest", editAction = "editGuests")
    public String leadGuest = "Ada";

    @Section(value = "Payments", viewMoreAction = "allPayments")
    public String lastPayment = "€120";

    public Object addGuest() {
      return UICommand.announce("Guest added");
    }

    public void editGuests() {}

    public void allPayments() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CustomerPage.class, BookingPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theSwitcherTravelsInThePageHeader() {
    var page = WireWalk.first(mateu.sync("/switcher-page"), PageDto.class);
    var switcher = page.switcher();
    assertThat(switcher).isNotNull();
    assertThat(switcher.options()).extracting(o -> o.label()).containsExactly("Ada", "Grace");
    assertThat(switcher.value()).isEqualTo("c1");
    assertThat(switcher.type()).isEqualTo("object");
    assertThat(switcher.label()).isEqualTo("Customer");
    assertThat(switcher.searchable()).isTrue();
    assertThat(switcher.actionId()).isEqualTo(RecordSwitcherSupplier.ACTION_ID);
  }

  @Test
  void thePageAdvertisesTheSwitchAction() {
    var component =
        (ServerSideComponentDto) mateu.sync("/switcher-page").fragments().get(0).component();
    assertThat(component.actions()).anyMatch(a -> RecordSwitcherSupplier.ACTION_ID.equals(a.id()));
  }

  @Test
  void pickingAnEntryRunsSwitchToAndReRendersInPlace() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/switcher-page")
                .consumedRoute("/switcher-page")
                .serverSideType(CustomerPage.class.getName())
                .actionId(RecordSwitcherSupplier.ACTION_ID)
                .initiatorComponentId("c1_app")
                .componentState(Map.of("customer", "c1", "name", "Ada"))
                .parameters(Map.of(RecordSwitcherSupplier.VALUE_PARAMETER, "c2"))
                .build());
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("customer", "c2").containsEntry("name", "Grace");
    assertThat(WireWalk.first(increment, PageDto.class).switcher().value()).isEqualTo("c2");
  }

  @Test
  void sectionAffordancesBecomeButtonsDispatchingTheNamedActions() {
    var buttons = WireWalk.all(mateu.sync("/section-affordances"), ButtonDto.class);
    assertThat(buttons)
        .extracting(ButtonDto::actionId)
        .contains("addGuest", "editGuests", "allPayments");
    assertThat(buttons)
        .filteredOn(b -> "allPayments".equals(b.actionId()))
        .extracting(ButtonDto::label)
        .containsExactly("View more");
  }

  @Test
  void anAnnounceCommandTravelsWithItsTextAndPoliteness() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/section-affordances")
                .consumedRoute("/section-affordances")
                .serverSideType(BookingPage.class.getName())
                .actionId("addGuest")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .build());
    var announce =
        increment.commands().stream()
            .filter(c -> c.type() == UICommandTypeDto.Announce)
            .findFirst()
            .orElseThrow();
    assertThat(announce.data()).isInstanceOf(io.mateu.uidl.data.Announcement.class);
    var announcement = (io.mateu.uidl.data.Announcement) announce.data();
    assertThat(announcement.text()).isEqualTo("Guest added");
    assertThat(announcement.assertive()).isFalse();
  }
}
