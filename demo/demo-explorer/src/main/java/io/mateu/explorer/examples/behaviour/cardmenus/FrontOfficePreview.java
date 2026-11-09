package io.mateu.explorer.examples.behaviour.cardmenus;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/** Explorer plumbing: frames {@link FrontOfficeApp}. */
public class FrontOfficePreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/card-menus";
  }
}
