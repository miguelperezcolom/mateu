package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;

public class QuarkusHttpRequest implements HttpRequest {

  private final java.net.http.HttpRequest delegate;

  public QuarkusHttpRequest(java.net.http.HttpRequest delegate) {
    this.delegate = delegate;
  }
}
