package io.mateu.core.infra.declarative.orchestrators.dashboard;

import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Bridge that renders a plain {@code @AutoPage} class as a {@link Dashboard} without subclassing —
 * the page-level analogue of the {@code AdaptedComponentTree} adapter bridge. It advertises the
 * model's type as {@code serverSideType} so actions keep routing to the model class, and carries
 * {@code @PageTemplate(DASHBOARD)} so the wire {@code pageType} matches the composed template. The
 * model keeps the archetype's defaults (responsive auto-fit columns, no forced style unless the
 * model declares {@code @Style}); extending {@link Dashboard} remains the way to override them.
 */
@PageTemplate(PageType.DASHBOARD)
public class InferredDashboard implements ComponentTreeSupplier {

  private final Object model;

  public InferredDashboard(Object model) {
    this.model = model;
  }

  @Override
  public String id() {
    return model.getClass().getName();
  }

  @Override
  public String serverSideType() {
    return model.getClass().getName();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return DashboardComposer.compose(model, id(), 0);
  }

  @Override
  public String style() {
    var style = model.getClass().getAnnotation(Style.class);
    return style != null ? style.value() : null;
  }
}
