package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;

public class SpringHttpRequest implements HttpRequest {

  private final org.springframework.http.HttpRequest delegate;

  public SpringHttpRequest(org.springframework.http.HttpRequest delegate) {
    this.delegate = delegate;
  }
}
