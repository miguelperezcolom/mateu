package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.HorizontallyArranged;
import io.mateu.uidl.annotations.InTabsArranged;
import io.mateu.uidl.annotations.SplitArranged;
import io.mateu.uidl.annotations.VerticallyArranged;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.Stepper;
import io.mateu.uidl.interfaces.Card;
import io.mateu.uidl.interfaces.Container;
import io.mateu.uidl.interfaces.Crud;
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
        || f.isAnnotationPresent(HorizontallyArranged.class)
        || f.isAnnotationPresent(VerticallyArranged.class)
        || f.isAnnotationPresent(SplitArranged.class)
        || f.isAnnotationPresent(InTabsArranged.class)
        || f.getType().isAnnotationPresent(HorizontallyArranged.class)
        || f.getType().isAnnotationPresent(VerticallyArranged.class)
        || f.getType().isAnnotationPresent(SplitArranged.class)
        || f.getType().isAnnotationPresent(InTabsArranged.class)
        || reflectionService.isBasic(f.getType()));
  }
}
