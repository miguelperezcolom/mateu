package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/** {@code @AutoSave}: typing in {@code draft} runs {@code persist} once the user stops. */
@UI("/autosave-lab")
@Title("Autosave lab")
@AutoSave(debounceMillis = 400, action = "persist")
@Getter
@Setter
public class AutoSaveLab {

  String draft = "";
  String saved = "";
  int saves = 0;

  public AutoSaveLab persist() {
    saves++;
    saved = "saved '" + draft + "' (" + saves + ")";
    return this;
  }
}
