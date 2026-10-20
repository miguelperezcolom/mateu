package com.example.parity;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

/**
 * A view that is a CDI bean nobody injects — Mateu reaches it by reflection only — and that injects
 * a service nobody else does.
 */
@UI("/injected")
@Title("Injected form")
@Dependent
public class InjectedServiceForm {

  @Inject GreetingService greetingService;

  public String name = "x";

  @Button
  public Message greet() {
    return new Message(greetingService.greet());
  }
}
