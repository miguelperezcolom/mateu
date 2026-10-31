package io.mateu.demo.microfrontends;

import io.mateu.uidl.annotations.ContentSlot;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;

/**
 * The host. Its micro frontends are resolved by THIS server while it builds the page: the fast one
 * arrives inside the page's own response, the slow and the down ones go out for the browser to ask
 * (as with resolve = CLIENT), and the content slots paint their content or their fallback. Watch
 * the {@code io.mateu.microfrontends} log: one line per fragment.
 */
@UI("")
@Title("Micro frontends resolved in the server")
public class Home {

  @ContentSlot(
      key = "demo.home.news",
      fallback = "No news today",
      description = "The banner at the top of the home page")
  String news;

  @Label("Fast remote — embedded in this page's response")
  MicroFrontend fast =
      MicroFrontend.builder().baseUrl("/remote-fast").route("").consumedRoute("_empty").resolve(Resolve.SERVER).build();

  @Label("Slow remote — answers in 2 s, the budget is 300 ms: the browser asks it")
  MicroFrontend slow =
      MicroFrontend.builder().baseUrl("/remote-slow").route("").consumedRoute("_empty").resolve(Resolve.SERVER).build();

  @Label("A remote that is down — the browser is left to ask it, as with resolve = CLIENT")
  MicroFrontend down =
      MicroFrontend.builder()
          .baseUrl("http://127.0.0.1:9/remote-down")
          .route("").consumedRoute("_empty")
          .resolve(Resolve.SERVER)
          .build();

  @ContentSlot(
      key = "demo.home.tips",
      fallback = "Nothing published here yet",
      description = "A slot the content service answers too late: its fallback is painted")
  String tips;
}
