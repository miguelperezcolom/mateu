package io.mateu.explorer.examples.behaviour.deeplinks;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@code /x/behaviour/deep-links/days/2026-12-20} (a route with a path parameter). */
public class DayPlanPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/deep-links/days/2026-12-20";
  }
}
