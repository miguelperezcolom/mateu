package com.example.demo.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Markdown;

/** Pilot of the ContentLayout slot grammar: the ItemOverview archetype now composes a ContentLayout. */
@UI("/product-overview")
@Title("Ergonomic chair EC-200")
public class ProductOverviewDemo extends ItemOverview {

  Markdown keyInfo =
      new Markdown(
          "**SKU** EC-200-BLK  \n**In stock** 143 units  \n**Price** 249 €  \n**Warranty** 5 years",
          null,
          null);

  @Panel(title = "Sales")
  Markdown sales =
      new Markdown("Sales per month: 32, 41, 38, 52, 60. Trending up 18% QoQ.", null, null);

  @Panel(title = "Specifications")
  Markdown specs =
      new Markdown("Max load 130 kg. Adjustable lumbar. Aluminium base. Weight 14 kg.", null, null);

  @Override
  protected String panelWidth() {
    return "24rem";
  }
}
