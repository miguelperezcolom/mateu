package io.mateu.explorer.examples.components.tabs;

import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Tabs and an accordion built fluently; the second tab starts selected and has a badge. */
public class FluentTabs implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                TabLayout.builder()
                    .tabs(
                        List.of(
                            new Tab("Overview", new Text("Deluxe sea view, 32 m², king bed.")),
                            Tab.builder()
                                .label("Amenities")
                                .badge("3")
                                .active(true)
                                .content(BulletedList.builder().items(List.of("Free Wi-Fi", "Minibar", "Bathrobes")).build())
                                .build()))
                    .build(),
                AccordionLayout.builder()
                    .panels(
                        List.of(
                            AccordionPanel.builder().label("Breakfast").active(true).content(new Text("7:00 to 10:30 on the terrace.")).build(),
                            new AccordionPanel("Parking", new Text("€ 18 per night."))))
                    .build()))
        .build();
  }
}
