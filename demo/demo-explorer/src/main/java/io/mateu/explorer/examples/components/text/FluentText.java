package io.mateu.explorer.examples.components.text;

import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Text, Markdown, an Anchor and a BulletedList, built fluently. */
public class FluentText implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                new Text("Grand Hotel Mirador", TextContainer.h3),
                Text.builder().text("A small caption, no margins").size(TextSize.xs).noMargins(true).build(),
                Markdown.builder().markdown("Check-in from **14:00**, check-out until **11:00**.").build(),
                Anchor.builder().text("Read the house rules").url("https://mateu.io").target("_blank").build(),
                BulletedList.builder().items(List.of("Free Wi-Fi", "Airport shuttle", "Pets welcome")).build()))
        .build();
  }
}
