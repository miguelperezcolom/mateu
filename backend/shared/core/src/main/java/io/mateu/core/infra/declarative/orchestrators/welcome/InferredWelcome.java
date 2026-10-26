package io.mateu.core.infra.declarative.orchestrators.welcome;

import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Bridge that renders a plain {@code @AutoPage} class as a {@link Welcome} landing without
 * subclassing — same pattern as {@code InferredDashboard}. The hero title and subtitle come from
 * the class's {@code @Title} and {@code @Subtitle} (declared information); the background image has
 * no declarative source on a plain class, so extending {@link Welcome} remains the way to set it.
 * Advertises the model as {@code serverSideType} so CTA actions keep routing to the model class,
 * and carries {@code @PageTemplate(LANDING)} for the wire {@code pageType}.
 */
@PageTemplate(PageType.LANDING)
public class InferredWelcome implements ComponentTreeSupplier, io.mateu.core.infra.ModelBridge {

  private final Object model;

  /** The plain class this bridge renders. */
  public Object model() {
    return model;
  }

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
    return WelcomeComposer.compose(
        model,
        id(),
        ReflectionPageMapper.getDeclaredTitle(model),
        ReflectionPageMapper.getPageSubtitle(model),
        null);
  }

  @Override
  public String style() {
    var style = model.getClass().getAnnotation(Style.class);
    return style != null ? style.value() : null;
  }
}
