package io.mateu.mdd.redwoodshowcase.ui.createedit;

import io.mateu.uidl.annotations.Aside;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.net.URI;

/**
 * Redwood «Advanced create and edit», variant B: a form with a contextual detail slot (@Aside).
 * The example of doc/…/ux-patterns/advanced-create-and-edit.md, served with the Redwood renderer.
 */
@UI("/advanced-create-edit-aside-demo")
@Title("Edit order")
public class OrderEdit {

  @Timestamp("Last updated")
  String updatedAt = "2026-07-26 09:12";

  @Section("Order") @NotEmpty String reference = "SO-1024";

  @Section("Order") String customer = "Acme";

  @Section("Shipping") String address = "Gran Via 1, Madrid";

  @Section("Shipping") String carrier = "DHL";

  @Aside(width = "22rem")
  Markdown context =
      new Markdown("**SLA** 48h · **Priority** High\n\nLast contact 2 days ago.", null, null);

  @Toolbar
  public URI cancel() {
    return URI.create("/");
  }

  @Toolbar
  public Message save() {
    return new Message("Saved");
  }
}
