package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.servlet.http.HttpServletRequest;

public class SpringHttpRequest implements HttpRequest {

  private final HttpServletRequest delegate;

  public SpringHttpRequest(HttpServletRequest delegate) {
    this.delegate = delegate;
  }
}
