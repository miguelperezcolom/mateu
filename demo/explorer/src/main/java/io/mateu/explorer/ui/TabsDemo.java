package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Explorer demo for the Oracle oj-c-tab-bar based tabs (Mateu TabLayout). */
@UI("/tabs")
@Title("Tabs")
public class TabsDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return TabLayout.builder()
        .tabs(
            List.of(
                new Tab("Overview", Text.builder().text("Booking 204 · Deluxe room · 3 nights.").build()),
                new Tab("Guests", Text.builder().text("2 adults · Ms. Vision (lead guest).").build()),
                new Tab("Payment", Text.builder().text("Balance 12.480,50 € · Visa ····4242.").build())))
        .build();
  }
}
