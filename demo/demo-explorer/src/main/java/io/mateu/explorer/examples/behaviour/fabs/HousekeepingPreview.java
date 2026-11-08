package io.mateu.explorer.examples.behaviour.fabs;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@link HousekeepingApp}. */
public class HousekeepingPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/fabs";
  }

  @Override
  protected String height() {
    return "30rem";
  }
}
