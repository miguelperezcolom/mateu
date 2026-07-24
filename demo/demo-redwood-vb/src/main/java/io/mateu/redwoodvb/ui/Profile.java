package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/**
 * Fase 3 — a basic editable form. Reflected fields become a FormLayout of FormFields (rendered by
 * the VB dispatcher as authentic oj-c-* inputs, two-way bound); {@code @Button save()} becomes the
 * Save action that receives the edited state back.
 */
@UI("/profile")
@Title("Perfil")
@Getter
@Setter
public class Profile {

  String name = "Ada Lovelace";
  String email = "ada@example.com";
  Integer age = 36;

  @Button
  public Message save() {
    return new Message("Guardado: " + name + " (" + email + ", " + age + ")");
  }
}
