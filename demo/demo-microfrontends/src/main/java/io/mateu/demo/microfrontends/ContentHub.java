package io.mateu.demo.microfrontends;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.remote.FragmentCachePolicySupplier;

/**
 * A stand-in for the content service: answers {@code /content-slots/{key}} with the slot's content;
 * the tips slot it answers too late (2 s, past the slot's 500 ms), so the host paints its fallback. It lets the hosts cache what it answers — the same for everybody here; a real one
 * would key it by the audience the user belongs to ({@code FragmentCachePolicy.byKey}).
 */
@UI("/content-hub")
public class ContentHub implements RouteHandler, FragmentCachePolicySupplier {

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    if (route != null && route.endsWith("/demo.home.news")) {
      return Text.builder()
          .container(TextContainer.p)
          .text("📰 Summer offers are live — served by the content hub, resolved by the host")
          .build();
    }
    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    return Text.builder().container(TextContainer.p).text("Tips arrive too late").build();
  }

  @Override
  public FragmentCachePolicy fragmentCachePolicy(HttpRequest httpRequest) {
    return FragmentCachePolicy.shared(60);
  }
}
