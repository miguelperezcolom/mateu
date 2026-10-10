package io.mateu.mdd.demovbpms.infra.in.ui.inventory;

import io.mateu.uidl.annotations.Menu;

/** Section "Inventory" (OPERA Cloud 26.3 user guide, chapter 005). */
public class InventoryMenu {

  @Menu io.mateu.mdd.demovbpms.infra.in.ui.housekeeping.HousekeepingBoard housekeepingBoard;

  @Menu FloorPlan floorPlan;
}
