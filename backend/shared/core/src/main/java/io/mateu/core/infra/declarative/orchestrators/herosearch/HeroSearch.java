package io.mateu.core.infra.declarative.orchestrators.herosearch;

import io.mateu.core.domain.out.componentmapper.PageListingBuilder;
import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Hero search landing page: a prominent, distraction-free hero header with a large title and
 * subtitle, followed by a searchable listing (search box + filter facets + results). Extend it and
 * implement {@code search(...)} exactly like a {@link Listing}; override {@link #heroTitle()},
 * {@link #heroSubtitle()} and {@link #heroImage()} for the hero chrome, and {@link #gridLayout()}
 * (default {@code cards}) for how results render.
 *
 * <p>The listing starts empty and searches on enter — add {@code @Trigger(type =
 * TriggerType.OnLoad, actionId = "search")} on the class to preload results instead.
 *
 * @param <Filters> the type carrying the filter facet fields (use {@code NoFilters} for none)
 * @param <Row> the type of each result row/card
 */
public abstract class HeroSearch<Filters, Row> extends Listing<Filters, Row>
    implements ComponentTreeSupplier {

  /** Big hero title; defaults to no title (the page {@code @Title} still applies). */
  protected String heroTitle() {
    return null;
  }

  protected String heroSubtitle() {
    return null;
  }

  /** Optional background image URL for the hero. */
  protected String heroImage() {
    return null;
  }

  /** How results render; hero search defaults to card tiles. */
  @Override
  public GridLayout gridLayout() {
    return GridLayout.cards;
  }

  @Override
  public String style() {
    return null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    List<Component> content = new ArrayList<>();
    content.add(
        HeroSection.builder()
            .id("hero")
            .title(heroTitle())
            .subtitle(heroSubtitle())
            .image(heroImage())
            .centered(true)
            .build());
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
