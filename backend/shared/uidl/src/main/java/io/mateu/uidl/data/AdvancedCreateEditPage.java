package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Advanced create and edit page template (Spectra {@code oj-sp-advanced-create-edit}): a
 * transactional page that creates or edits an object with many attributes, grouped in sections. Its
 * slot is the template's {@code detail} — contextual data for the task, beside the form —, and the
 * {@link io.mateu.uidl.fluent.Form} that carries it gives the rest: its title and subtitle, and a
 * toolbar with a cancel button and the primary action (create, submit, save) are the page header's,
 * and its {@code content} is the template's {@code main} slot, the sections. Without a detail the
 * main slot has the vertical anchor navigator (the two exclude each other).
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record AdvancedCreateEditPage(@Singular("detailItem") List<Component> detail)
    implements FormTemplate {

  public AdvancedCreateEditPage {
    detail = detail != null ? detail : Collections.emptyList();
  }
}
