package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import java.net.URL;

@Title("")
public class URLWrapper {

  @Label("")
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
