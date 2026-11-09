package io.mateu.explorer.remote.inventory;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The Java remote's app shell, mounted at {@code /inventory}. A shell that federates it with a
 * {@code RemoteMenu} gets these menu entries — several top-level entries, so a shell that labels
 * the RemoteMenu shows them inside one group named like it. Its routes are relative to the mount
 * ({@code stock}, {@code element}, {@code whoami}, {@code about}).
 */
@UI("/inventory")
@Title("Inventory")
public class InventoryApp {

  @Menu @Label("Stock") StockPage stock;

  @Menu @Label("Custom element") CustomElementPage element;

  @Menu @Label("Who am I?") WhoAmIPage whoami;

  /** Also a route of the YAML remote's app ({@code about}): the shell warns about the collision. */
  @Menu @Label("About inventory") AboutInventory about;
}
