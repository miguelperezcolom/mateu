package io.mateu.mdd.demovbpms.infra.in.ui;

import io.mateu.mdd.demovbpms.infra.in.ui.financials.FinancialsMenu;
import io.mateu.mdd.demovbpms.infra.in.ui.frontdesk.FrontDeskMenu;
import io.mateu.mdd.demovbpms.infra.in.ui.inventory.InventoryMenu;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * The PMS shell, laid out like OPERA Cloud: the hamburger holds the sections (Bookings, Front
 * Desk, Inventory, Financials…) and the band under the header the screens of the section on
 * screen (OPERA Cloud 26.3 user guide, 001 "Application Navigation").
 */
@UI("")
@Title("OPERA PMS · demo")
@App(AppVariant.HAMBURGER_SECTIONS)
public class PmsHome {

  @Menu FrontDeskMenu frontDesk;

  @Menu InventoryMenu inventory;

  @Menu FinancialsMenu financials;
}
