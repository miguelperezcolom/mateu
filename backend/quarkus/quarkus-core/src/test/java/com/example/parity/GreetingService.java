package com.example.parity;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * A service only {@link InjectedServiceForm} injects: when ArC removed that form as an unused bean,
 * this one went with it, and the form Mateu then created with {@code new} found nothing to inject.
 */
@ApplicationScoped
public class GreetingService {

  public String greet() {
    return "Hello from the service";
  }
}
