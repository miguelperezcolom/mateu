package io.mateu.demo.staticbundle;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import lombok.Getter;

/**
 * A second static screen (route {@code /about}). Purely presentational, so it bundles cleanly and
 * renders with no backend.
 */
@Route("/about")
@Title("About")
@Getter
public class About {

  @Text
  private final String intro =
      "This screen was served from a static bundle — no Mateu backend was contacted to render it.";
}
