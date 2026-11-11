package io.mateu.test.fixtures;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.net.URI;

/** A plain form: fields, a validated action, access rules and a navigation. */
@Title("Greeting")
public class Greeting {

  @NotEmpty String name;

  int times = 1;

  @Label("Internal note")
  @EyesOnly(roles = "admin")
  String note = "only admins see this";

  @ReadOnlyUnless(roles = "admin")
  String code = "G-1";

  String greeting;

  @Button
  Message greet() {
    greeting = ("Hello " + name + "! ").repeat(times).trim();
    return Message.success(greeting);
  }

  @Button
  @DisabledUnless(roles = "admin")
  void reset() {
    times = 1;
  }

  @Toolbar
  URI goHome() {
    return URI.create("/home");
  }
}
