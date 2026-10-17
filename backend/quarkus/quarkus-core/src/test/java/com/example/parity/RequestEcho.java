package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Echoes what its action reads off the {@link HttpRequest}: the adapter must hand the UI the query
 * parameters and headers of the HTTP request it received.
 */
@UI("/echo")
@Title("Request echo")
public class RequestEcho {

  @Button
  public Message echo(HttpRequest httpRequest) {
    return new Message(AdapterParityITFoundation.echo(httpRequest));
  }
}
