package io.mateu.core.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class FieldExtractor {

  public List<FieldInterfaced> getFields(Object uiInstance, SlotName slot) {
    return ReflectionHelper.getAllFields(uiInstance.getClass()).stream()
        .filter(f -> !f.isAnnotationPresent(Ignored.class))
        .filter(f -> !f.isAnnotationPresent(MenuOption.class))
        .filter(f -> !f.isAnnotationPresent(Submenu.class))
        .filter(f -> checkField(f, slot))
        .collect(Collectors.toList());
  }

  private boolean checkField(FieldInterfaced field, SlotName slot) {
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
