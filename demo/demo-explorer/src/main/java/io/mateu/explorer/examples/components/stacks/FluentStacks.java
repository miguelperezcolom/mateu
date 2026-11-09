package io.mateu.explorer.examples.components.stacks;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.Separator;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** The same boxes in Java: rows, columns, a styled Container, a Div, a Separator, a Scroller. */
public class FluentStacks implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                HorizontalLayout.builder()
                    .spacing(true)
                    .fullWidth(true)
                    .flexGrows(List.of(2, 1))
                    .content(
                        List.of(
                            Container.builder().content(new Text("Main column (2/3)")).style("padding: 1rem; background: var(--lumo-contrast-5pct, #f3f3f3);").build(),
                            Container.builder().content(new Text("Side column (1/3)")).style("padding: 1rem; background: var(--lumo-primary-color-10pct, #e8f0fe);").build()))
                    .build(),
                new Separator(),
                VerticalLayout.builder()
                    .fullWidth(true)
                    .horizontalAlignment(HorizontalAlignment.END)
                    .content(List.of(new Text("Subtotal € 1,180.00"), new Text("Total € 1,204.00")))
                    .build(),
                new Div(List.of(new Text("A Div with children:"), new Badge("Late check-out"))),
                Scroller.builder()
                    .style("height: 6rem; border: 1px solid var(--lumo-contrast-10pct, #ddd);")
                    .content(
                        BulletedList.builder()
                            .items(List.of("101 — clean", "102 — occupied", "103 — dirty", "104 — inspected", "105 — out of order", "106 — clean"))
                            .build())
                    .build()))
        .build();
  }
}
