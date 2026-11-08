package io.mateu.explorer.examples.behaviour.chromeless;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@link KioskApp}. */
public class KioskPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/chromeless";
  }

  @Override
  protected String height() {
    return "32rem";
  }
}
