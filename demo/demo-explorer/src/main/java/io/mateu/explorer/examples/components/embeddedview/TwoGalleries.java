package io.mateu.explorer.examples.components.embeddedview;

import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.FutureComponent;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A component tree that embeds VIEWS as independent islands. Each island keeps its own state and
 * runs its own actions: press the buttons of one and the others do not change.
 *
 * <ul>
 *   <li>{@link EmbeddedView} — any view object (a reflected form, a component tree, an archetype),
 *       rendered as an island inside this tree;
 *   <li>{@link FutureComponent} — the same, as a placeholder for a component the server resolves
 *       when it renders the tree.
 * </ul>
 */
public class TwoGalleries implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                new Text("EmbeddedView of a reflected form", TextContainer.h5),
                new EmbeddedView(new Visitors()),
                new Text("EmbeddedView of a component tree", TextContainer.h5),
                new EmbeddedView(new GiftShop()),
                new Text("FutureComponent of a component tree", TextContainer.h5),
                new FutureComponent(new GiftShop())))
        .build();
  }
}
