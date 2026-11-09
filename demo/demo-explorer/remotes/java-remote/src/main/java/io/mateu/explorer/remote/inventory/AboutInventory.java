package io.mateu.explorer.remote.inventory;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** {@code about}: a route the YAML remote ALSO has — see "Route collisions". */
@Title("About inventory")
public class AboutInventory {

  @ReadOnly
  String text = "Inventory is owned by another team and served by its own Spring Boot app.";
}
