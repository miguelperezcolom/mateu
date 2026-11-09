package io.mateu.explorer.examples.behaviour.autosave;

import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * {@code @AutoSave}: no Save button. Every change schedules the named action ({@code save} by
 * default); it runs once the user has been idle for {@code debounceMillis}, so a burst of typing
 * is ONE save.
 */
@Title("Notes")
@AutoSave(debounceMillis = 800)
public class NotesDraft {

  @Stereotype(FieldStereotype.textarea)
  String notes = "";

  @ReadOnly String lastSaved = "never";

  @ReadOnly int saves;

  public NotesDraft save() {
    saves++;
    lastSaved = LocalTime.now().truncatedTo(ChronoUnit.SECONDS) + " (" + notes.length() + " chars)";
    return this;
  }
}
