package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

/**
 * The ItemOverview archetype, now composed as a Screen = Template + slots on the one responsive grid
 * (coherence-plan #7/#9): a "keyinfo tabs" template whose key-info column is a pinned (sticky) slot
 * beside the tabbed column. Backs the layout e2e (layout-sizing.spec.ts).
 */
@UI("/item-overview")
@Title("Chair")
public class ItemOverviewDemo extends ItemOverview {

  @Override
  protected String panelWidth() {
    return "26rem";
  }

  // The first component field without @Panel is the key-info panel (the sticky slot).
  public Component keyInfo =
      Card.builder()
          .id("summary")
          .content(Text.builder().text("Aeron chair — key info summary").build())
          .build();

  @Panel(title = "Specifications")
  public Component specs = Text.builder().text("Height 1.05m · Weight 20kg").build();

  @Panel(title = "Sales")
  public Component sales = Text.builder().text("340 sold this quarter").build();
}
