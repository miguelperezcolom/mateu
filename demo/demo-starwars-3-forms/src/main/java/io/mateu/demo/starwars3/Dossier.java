package io.mateu.demo.starwars3;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

enum Allegiance {
  Jedi,
  Sith,
  Bounty
}

/**
 * A rich single form: a name field on top, then two TABS grouping the rest. Consecutive fields
 * sharing a {@code @Tab} name form one tab. Field widgets come from the types + stereotypes:
 * textarea, star rating, toggle, date picker, money and a radio group.
 */
@UI("dossier")
@Title("Character dossier")
public class Dossier {

  @NotEmpty String name;

  @Tab("Bio")
  @Stereotype(FieldStereotype.textarea)
  @Multiline
  String biography;

  @Tab("Bio")
  @Stereotype(FieldStereotype.stars)
  int rating;

  @Tab("Bio")
  @Stereotype(FieldStereotype.toggle)
  boolean fanFavorite;

  @Tab("Service")
  LocalDate firstAppearance;

  @Tab("Service")
  @Stereotype(FieldStereotype.money)
  double bounty;

  @Tab("Service")
  @UseRadioButtons
  Allegiance allegiance;

  @Button
  @Label("Save")
  public Message save() {
    return new Message("Saved dossier for " + (name == null || name.isBlank() ? "?" : name));
  }
}
