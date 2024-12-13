package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.*;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldExtractor {

  final ReflectionService reflectionService;

  public List<Field> getFields(Object uiInstance, SlotName slot) {
    return reflectionService.getAllFields(uiInstance.getClass()).stream()
        .filter(f -> !f.isAnnotationPresent(Ignored.class))
        .filter(f -> !f.isAnnotationPresent(DataOnly.class))
        .filter(f -> !f.isAnnotationPresent(MenuOption.class))
        .filter(f -> !f.isAnnotationPresent(Submenu.class))
        .filter(f -> checkField(f, slot))
        .collect(Collectors.toList());
  }

  private boolean checkField(Field field, SlotName slot) {
    if (SlotName.left.equals(slot)
        || SlotName.right.equals(slot)
        || SlotName.header.equals(slot)
        || SlotName.footer.equals(slot)) {
      return field.isAnnotationPresent(Slot.class)
          && slot.equals(field.getAnnotation(Slot.class).value());
    }
    return !field.isAnnotationPresent(Slot.class)
        || slot.equals(field.getAnnotation(Slot.class).value());
  }
}
