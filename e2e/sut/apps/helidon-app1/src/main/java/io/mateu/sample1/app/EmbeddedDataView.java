package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Routed editable view embedded as a mediator field by {@link InlineHostForm} (with {@code @Inline})
 * and {@link NonInlineHostForm} (without). The single-section, titled model lets the e2e tests
 * assert the {@code @Inline} chrome rules (level=1 heading, no outer card, parent section title
 * hidden) by comparing both shapes.
 */
@UI("/embedded-data")
public class EmbeddedDataView extends AutoEditableView<EmbeddedDataView.Data> {

  private static volatile Data store = new Data("María", "García");

  @Override
  public Data load(HttpRequest httpRequest) {
    return store;
  }

  @Override
  public void persist(Data entity, HttpRequest httpRequest) {
    store = entity;
  }

  @Title("Embedded Data")
  public record Data(@Label("First name") String firstName, @Label("Last name") String lastName) {}
}
