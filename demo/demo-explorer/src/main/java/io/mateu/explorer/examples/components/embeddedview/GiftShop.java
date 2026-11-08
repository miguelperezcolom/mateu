package io.mateu.explorer.examples.components.embeddedview;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A component-tree view with state (its field) and an action — the other kind of embedded view. */
public class GiftShop implements ComponentTreeSupplier {

  int postcardsSold = 40;

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                new Text("Gift shop — postcards sold: " + postcardsSold),
                Button.builder().label("Sell one").actionId("sell").build()))
        .build();
  }

  public GiftShop sell() {
    postcardsSold++;
    return this;
  }
}
