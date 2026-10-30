package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Guided process page template (Spectra {@code oj-sp-guided-process}): a process broken
 * into {@link GuidedProcessStep}s the user goes through one at a time. Its field is the template's
 * {@code steps}; the {@link io.mateu.uidl.fluent.Form} that carries it gives the rest — its title
 * and subtitle are the process's, its toolbar's primary button the process's primary action
 * (submit, create), its cancel button the way out. Every step belongs to the one form, so moving
 * between steps keeps what was typed — no server round trip, the template moves on its own.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record GuidedProcessPage(@Singular("step") List<GuidedProcessStep> steps)
    implements FormTemplate {

  public GuidedProcessPage {
    steps = steps != null ? steps : Collections.emptyList();
  }
}
