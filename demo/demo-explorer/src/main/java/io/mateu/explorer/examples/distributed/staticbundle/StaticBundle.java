package io.mateu.explorer.examples.distributed.staticbundle;

import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;
import static io.mateu.explorer.examples.distributed.Links.text;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;

/**
 * The Help Center ({@code remotes/static-remote}) is a static bundle: {@code mvn package} writes
 * {@code target/mateu-bundle} — index.html, manifest.json (the raw definitions, {@code specsOnly})
 * and the renderer's assets — and any file server serves it. Nothing answers at run time.
 */
public class StaticBundle implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    var base = Remotes.staticBundle();
    return column(
        text("Served by a 40-line Node file server standing in for a CDN — no Mateu, no Java behind it."),
        row(
            open("Open the bundle", base + "/"),
            open("Deep link: /contact", base + "/contact"),
            open("Its manifest.json", base + "/manifest.json")));
  }
}
