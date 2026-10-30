package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Collection detail page template (Spectra {@code oj-sp-collection-detail-page}): a
 * collection beside the detail of the item selected in it. Its slots are the template's: {@code
 * list} — the collection, typically a listing whose rows open the item ({@code rowRoute}) — and
 * {@code noSelection}, shown when nothing is selected. The {@link io.mateu.uidl.fluent.Form} that
 * carries it gives the page header, and its {@code content} is the selected item's detail
 * (Spectra's {@code detailTemplate}): a page with content HAS a selection, one without shows {@code
 * noSelection} — so the collection's page and its item's page share one list (a partial) and differ
 * in their content.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record CollectionDetailPage(
    @Singular("listItem") List<Component> list,
    @Singular("noSelectionItem") List<Component> noSelection)
    implements FormTemplate {

  public CollectionDetailPage {
    list = list != null ? list : Collections.emptyList();
    noSelection = noSelection != null ? noSelection : Collections.emptyList();
  }
}
