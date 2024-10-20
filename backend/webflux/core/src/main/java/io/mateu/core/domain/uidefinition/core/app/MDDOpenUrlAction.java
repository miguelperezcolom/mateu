package io.mateu.core.domain.uidefinition.core.app;

import java.net.URL;

public class MDDOpenUrlAction extends AbstractAction {

  public final URL url;

  public MDDOpenUrlAction(String name, URL url) {
    super(name);
    this.url = url;
  }

  @Override
  public String toString() {
    return url != null ? url.toString() : "Empty url";
  }

  public URL getUrl() {
    return url;
  }
}
