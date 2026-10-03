package io.mateu.mdd.demoadminpanel.infra.in.ui.tabs;

import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Demo of nested tabs: the «Details» tab holds a form with its own tab strip. The inner strip
 * repeats the «General» label on purpose — each strip keeps its own selection.
 */
@UI("/tabs-nested")
@Title("Nested tabs")
public class NestedTabsDemo {

  @Tab("General")
  String name = "Miguel";

  @Tab("General")
  String email = "miguel@example.com";

  @Tab("Details")
  Details details = new Details();

  public static class Details {

    @Tab("General")
    String phone = "600 000 000";

    @Tab("Notes")
    String notes = "VIP customer";
  }
}
