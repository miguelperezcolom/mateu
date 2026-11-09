package io.mateu.explorer.examples.behaviour.accesskeys;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@link FrontDeskApp}. */
public class FrontDeskPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/access-keys";
  }
}
