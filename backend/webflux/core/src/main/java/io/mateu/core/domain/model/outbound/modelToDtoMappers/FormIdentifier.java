package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.core.annotations.HorizontalLayout;
import io.mateu.uidl.core.annotations.SplitLayout;
import io.mateu.uidl.core.annotations.TabLayout;
import io.mateu.uidl.core.annotations.VerticalLayout;
import io.mateu.uidl.core.data.Result;
import io.mateu.uidl.core.data.Stepper;
import io.mateu.uidl.core.interfaces.Card;
import io.mateu.uidl.core.interfaces.Container;
import io.mateu.uidl.core.interfaces.Crud;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FormIdentifier {

  private final ReflectionService reflectionService;

  public FormIdentifier(ReflectionService reflectionService) {
    this.reflectionService = reflectionService;
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
        || reflectionService.isBasic(f.getType()));
  }
}
