package io.mateu.explorer.examples.behaviour.peernav;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@code /x/behaviour/peer-nav/guests/1} (a route with a path parameter). */
public class GuestRecordPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/peer-nav/guests/1";
  }
}
