package io.mateu.explorer.remote.content;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.remote.FragmentCachePolicySupplier;

/**
 * A stand-in for a content service: the host asks it {@code /content-slots/{key}} for each
 * {@code @ContentSlot} on screen. It answers the news slot at once, and the tips slot too late (2 s,
 * past the slot's 500 ms) — so the host paints the tips' fallback. Stop this app and BOTH slots
 * paint their fallbacks: a content slot never blocks, nor breaks, the screen.
 */
@UI("/content-hub")
public class ContentHub implements RouteHandler, FragmentCachePolicySupplier {

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    if (route != null && route.endsWith("/explorer.distributed.news")) {
      return Notice.builder()
          .theme("success")
          .text("📰 Fresh from the content service: the Explorer now has a Distributed UIs area")
          .build();
    }
    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    return Notice.builder().text("This answer arrives too late to be painted").build();
  }

  /** Content is the same for everybody here; a real one would key it by audience (byKey). */
  @Override
  public FragmentCachePolicy fragmentCachePolicy(HttpRequest httpRequest) {
    return FragmentCachePolicy.none();
  }
}
