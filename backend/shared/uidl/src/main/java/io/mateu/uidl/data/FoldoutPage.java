package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Foldout layout page template (Spectra {@code oj-sp-foldout-layout}, as a page): an
 * always-visible overview of a business object beside two or more panels of associated information
 * that fold out. Its slot is the template's {@code overview} and its field the layout's {@code
 * orientation}; the {@link io.mateu.uidl.fluent.Form} that carries it gives the rest — its {@code
 * content} is the template's default slot, the {@link FoldoutPanel}s (each its {@code title}, its
 * {@code summary} for the folded strip, {@code open} to start unfolded), and its header (title,
 * toolbar) is the page's.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record FoldoutPage(
    @Singular("overviewItem") List<Component> overview, FoldoutOrientation orientation)
    implements FormTemplate {

  public FoldoutPage {
    overview = overview != null ? overview : Collections.emptyList();
  }
}
