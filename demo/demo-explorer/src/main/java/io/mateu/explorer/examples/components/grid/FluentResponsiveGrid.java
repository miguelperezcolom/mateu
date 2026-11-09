package io.mateu.explorer.examples.components.grid;

import io.mateu.uidl.annotations.SizeMode;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Slotted;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A ResponsiveGrid with named areas filled by Slotted children: main + aside, then a footer. */
public class FluentResponsiveGrid implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                ResponsiveGrid.builder()
                    .gap("1rem")
                    .stackBelow("40rem")
                    .columns(List.of(new GridTrack(SizeMode.fill, null), new GridTrack(SizeMode.fixed, "16rem")))
                    .gridTemplateAreas("\"main aside\" \"footer footer\"")
                    .content(
                        List.of(
                            new Slotted("aside", Notice.builder().theme("info").text("Balance € 0.00").build()),
                            new Slotted("main", new Text("The stay: 14 to 17 Nov 2026, room 102.")),
                            new Slotted("footer", new Text("Footer: totals and legal text."))))
                    .build()))
        .build();
  }
}
