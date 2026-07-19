package io.mateu.core.infra.declarative.orchestrators.smartsearch;

import io.mateu.core.domain.out.componentmapper.PageListingBuilder;
import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Smart search page (the Oracle Redwood "Smart Search" template): a standalone, search-first page —
 * an optional intro line under the page title, the smart search bar (typed filter facets and chips)
 * and the results collection below. Extend it and implement {@code search(...)} exactly like a
 * {@link Listing}; override {@link #pageSubtitle()} for an intro line above the search bar.
 *
 * <p>Unlike an entity crud there is no New/Edit chrome and the page starts EMPTY (the user
 * searches) — add {@code @Trigger(type = TriggerType.OnLoad, actionId = "search")} on the class to
 * preload results instead.
 *
 * @param <Filters> the type carrying the filter facet fields (use {@code NoFilters} for none)
 * @param <Row> the type of each result row/card
 */
public abstract class SmartSearchPage<Filters, Row> extends Listing<Filters, Row>
    implements ComponentTreeSupplier {

  /** Optional intro line rendered under the page title, above the smart search bar. */
  protected String pageSubtitle() {
    return null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    List<Component> content = new ArrayList<>();
    if (pageSubtitle() != null) {
      content.add(new Text("page-subtitle", pageSubtitle()));
    }
    content.addAll(
        PageListingBuilder.getCrud(
            this, null, rq.route(), rq.consumedRoute(), rq.initiatorComponentId(), httpRequest));
    return VerticalLayout.builder()
        .id(id())
        .content(content)
        .fullWidth(true)
        .horizontalAlignment(HorizontalAlignment.STRETCH)
        .spacing(true)
        .build();
  }
}
