package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Fase 3 (formulario básico editable): campos two-way + acción save. Mismos fieldIds que el
 * fixture sintético {@code load-form.json} del POC, para que la captura real lo sustituya 1:1.
 */
@UI("/person")
@Title("Person")
public class PersonForm {

  @NotEmpty String name = "Ada";

  @Min(0)
  int age = 36;

  @Button
  public Object save(io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var hotel = httpRequest.appContext("hotel");
    return List.of(
        new Message("Saved " + name + (hotel != null ? " @ " + hotel : "")), new State(this));
  }

  @Button
  public Object goToProducts() {
    return java.net.URI.create("/products");
  }
}
