package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldExtractor {

  final ReflectionHelper reflectionHelper;

  public List<Field> getFields(Object uiInstance, SlotName slot) {
    return reflectionHelper.getAllFields(uiInstance.getClass()).stream()
        .filter(f -> !f.isAnnotationPresent(Ignored.class))
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