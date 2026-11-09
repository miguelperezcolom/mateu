package io.mateu.explorer.examples.behaviour.homeroutes;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Explorer plumbing: frames an app with no home declared next to {@link ConciergeApp}. */
public class HomePreviews implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .fullWidth(true)
        .content(
            List.of(
                new Text("No home declared — opens on the first menu leaf (Rooms):"),
                AppPreview.frame("/x/behaviour/shell-variants/top", "16rem"),
                new Text("HomeRouteSupplier returning \"guests\" — opens on Guests:"),
                AppPreview.frame("/x/behaviour/home-routes", "16rem")))
        .build();
  }
}
