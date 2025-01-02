package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.HorizontalLayouted;
import io.mateu.uidl.annotations.SplitLayouted;
import io.mateu.uidl.annotations.TabLayouted;
import io.mateu.uidl.annotations.VerticalLayouted;
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
        || f.isAnnotationPresent(HorizontalLayouted.class)
        || f.isAnnotationPresent(VerticalLayouted.class)
        || f.isAnnotationPresent(SplitLayouted.class)
        || f.isAnnotationPresent(TabLayouted.class)
        || f.getType().isAnnotationPresent(HorizontalLayouted.class)
        || f.getType().isAnnotationPresent(VerticalLayouted.class)
        || f.getType().isAnnotationPresent(SplitLayouted.class)
        || f.getType().isAnnotationPresent(TabLayouted.class)
        || reflectionService.isBasic(f.getType()));
  }
}
