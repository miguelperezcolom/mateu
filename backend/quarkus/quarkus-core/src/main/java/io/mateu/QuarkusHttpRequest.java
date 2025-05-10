package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import io.vertx.core.http.HttpServerRequest;

public class QuarkusHttpRequest implements HttpRequest {

  private final HttpServerRequest delegate;

  public QuarkusHttpRequest(HttpServerRequest delegate) {
    this.delegate = delegate;
  }
}
