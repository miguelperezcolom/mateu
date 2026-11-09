package io.mateu.explorer.examples.behaviour.notfound;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;

/**
 * Explorer plumbing: frames a route nothing answers. There is no code behind a not-found page —
 * Mateu draws it whenever a route resolves to nothing.
 */
public class MissingPagePreview extends AppPreview {
  @Override
  protected String mount() {
    return "/x/behaviour/not-found/no-such-room";
  }
}
