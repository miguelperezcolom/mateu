package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * One step of a {@link GuidedProcessPage}: its {@code id}, the {@code title} and {@code
 * description} the process's step list shows, and the components the step asks for ({@code
 * content}).
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record GuidedProcessStep(
    String id, String title, String description, @Singular("contentItem") List<Component> content) {

  public GuidedProcessStep {
    content = content != null ? content : Collections.emptyList();
  }
}
