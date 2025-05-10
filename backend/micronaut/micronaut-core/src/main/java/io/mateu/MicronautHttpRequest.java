package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;

public class MicronautHttpRequest implements HttpRequest {

  private final io.micronaut.http.HttpRequest delegate;

  public MicronautHttpRequest(io.micronaut.http.HttpRequest delegate) {
    this.delegate = delegate;
  }
}
