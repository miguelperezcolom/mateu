package io.mateu.core.infra.declarative.orchestrators.welcome;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Bridge that renders a plain {@code @AutoPage} class as a {@link Welcome} landing without
 * subclassing — same pattern as {@code InferredDashboard}. The hero title comes from the class's
 * {@code @Title} (declared information); subtitle and background image have no declarative source
 * on a plain class, so extending {@link Welcome} remains the way to set them. Advertises the model
 * as {@code serverSideType} so CTA actions keep routing to the model class, and carries
 * {@code @PageTemplate(LANDING)} for the wire {@code pageType}.
 */
@PageTemplate(PageType.LANDING)
public class InferredWelcome implements ComponentTreeSupplier {

  private final Object model;

  public InferredWelcome(Object model) {
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
    var title = MetaAnnotations.find(model.getClass(), Title.class);
    return WelcomeComposer.compose(model, id(), title != null ? title.value() : null, null, null);
  }

  @Override
  public String style() {
    var style = model.getClass().getAnnotation(Style.class);
    return style != null ? style.value() : null;
  }
}
