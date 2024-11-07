package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.uidl.core.annotations.Caption;
import java.net.URL;

@Caption("")
public class URLWrapper {

  @Caption("")
  URL url;

  public URL getUrl() {
    return url;
  }

  public void setUrl(URL url) {
    this.url = url;
  }

  public URLWrapper(URL url) {
    this.url = url;
  }

  public URLWrapper() {}
}
