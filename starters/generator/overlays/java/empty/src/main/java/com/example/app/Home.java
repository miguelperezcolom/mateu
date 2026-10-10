package com.example.app;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

/**
 * The home screen, mounted at the app root. Fields become form fields, {@code @Button} methods
 * become buttons, and the bean-validation annotations are enforced on both sides. Add more screens
 * as {@code @UI("/path")} classes, or bind view models to routes in {@code
 * src/main/resources/specs/ui/routes.yaml}.
 *
 * <p>Created fresh for every request: keep data that must outlive it in a store or a service.
 */
@UI("")
@Title("__APP_TITLE__")
public class Home {

  @NotEmpty String name;

  @Button
  public Message greet() {
    return Message.success("Hello, " + name + "!");
  }
}
