package io.mateu.explorer.examples.behaviour.menusincode;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@link HotelChainApp}. */
public class HotelChainPreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/menus-in-code";
  }
}
