package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's General overview page template (Spectra {@code oj-sp-general-overview-page}): one
 * business object's information in the main area with a complementary panel beside it. Its slot is
 * the template's {@code info} — the side panel —, and the {@link io.mateu.uidl.fluent.Form} that
 * carries it gives the rest: its title, subtitle, record switcher, header facts ({@code kpis}),
 * timestamp and toolbar are the page header's, and its {@code content} is the template's {@code
 * main} slot, typically sections of label/value fields.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record GeneralOverviewPage(@Singular("infoItem") List<Component> info)
    implements FormTemplate {

  public GeneralOverviewPage {
    info = info != null ? info : Collections.emptyList();
  }
}
