package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.SplitLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.TabLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FormIdentifier {

  private final ReflectionHelper reflectionHelper;

  public FormIdentifier(ReflectionHelper reflectionHelper) {
    this.reflectionHelper = reflectionHelper;
  }

  public boolean isForm(Field f, Object value) {
    return !(Container.class.isAssignableFrom(f.getType())
        || Crud.class.isAssignableFrom(f.getType())
        || Card.class.equals(f.getType())
        || Stepper.class.equals(f.getType())
        || (value instanceof Container
            || value instanceof Crud
            || value instanceof Card
            || value instanceof Stepper
            || value instanceof Result)
        || f.isAnnotationPresent(HorizontalLayout.class)
        || f.isAnnotationPresent(VerticalLayout.class)
        || f.isAnnotationPresent(SplitLayout.class)
        || f.isAnnotationPresent(TabLayout.class)
        || f.getType().isAnnotationPresent(HorizontalLayout.class)
        || f.getType().isAnnotationPresent(VerticalLayout.class)
        || f.getType().isAnnotationPresent(SplitLayout.class)
        || f.getType().isAnnotationPresent(TabLayout.class)
        || reflectionHelper.isBasic(f.getType()));
  }
}
