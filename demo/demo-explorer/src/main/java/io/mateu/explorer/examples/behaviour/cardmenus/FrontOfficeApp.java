package io.mateu.explorer.examples.behaviour.cardmenus;

import io.mateu.explorer.examples.behaviour.shellvariants.GuestsPage;
import io.mateu.explorer.examples.behaviour.shellvariants.RoomsPage;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MenuDisplay;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.fluent.AppVariant;

/**
 * Two kinds of menu entry beyond "a page":
 *
 * <ul>
 *   <li>{@code @Menu(display = MenuDisplay.cards)} on a group — it opens as a panel of CARDS (an
 *       entry's {@code description} is the card's text, an entry holding entries is a card whose
 *       entries are its actions);
 *   <li>a {@code @Menu} field typed {@link Rule} — a leaf that RUNS a rule (here: an action of the
 *       app) instead of navigating.
 * </ul>
 */
@UI("/x/behaviour/card-menus")
@Title("Front office")
@App(AppVariant.MENU_ON_TOP)
public class FrontOfficeApp {

  @Menu RoomsPage rooms;

  @Menu(display = MenuDisplay.cards)
  QuickAccess quickAccess;

  @Menu Rule ping = Rule.builder().action(RuleAction.RunAction).actionId("ping").build();

  public Message ping() {
    return Message.success("Pong — a menu leaf ran an action, and you did not leave the page");
  }

  public static class QuickAccess {

    @Menu(description = "Who is in which room")
    RoomsPage roomPlan;

    @Menu(description = "Today's arrivals and departures")
    GuestsPage guestList;

    @Menu(description = "Two destinations, shown as the card's actions")
    Billing billing;
  }

  public static class Billing {

    @Menu RoomsPage folios;

    @Menu GuestsPage invoices;
  }
}
