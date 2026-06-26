package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.util.Collection;

final class FormFieldFilter {

  static boolean filterField(
      Field field,
      boolean forCreationForm,
      boolean readOnly,
      Object instance,
      HttpRequest httpRequest) {
    if (instance instanceof VisibilitySupplier visibilitySupplier
        && visibilitySupplier.isHidden(field.getName(), httpRequest)) {
      return false;
    }
    if (ComponentDto.class.isAssignableFrom(field.getType())) {
      return false;
    }
    if (Status.class.equals(field.getType())) {
      return false;
    }
    if (MetaAnnotations.isPresent(field, Hidden.class)
        && MetaAnnotations.find(field, Hidden.class).value().isEmpty()) {
      return false;
    }
    if (MetaAnnotations.isPresent(field, KPI.class)) {
      return false;
    }
    if (MetaAnnotations.isPresent(field, BadgeInHeader.class)) {
      return false;
    }
    if (MetaAnnotations.isPresent(field, Menu.class)) {
      return false;
    }
    if (MetaAnnotations.isPresent(field, Lookup.class)) {
      return true;
    }
    if (MetaAnnotations.isPresent(field, Searchable.class)) {
      return true;
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && MetaAnnotations.isPresent(field, Composition.class)) {
      return readOnly;
    }
    return true;
  }

  static boolean hiddenInView(Field field) {
    return MetaAnnotations.isPresent(field, HiddenInView.class);
  }

  static boolean hiddenInEditor(Field field, boolean forCreationForm) {
    if (forCreationForm) {
      return MetaAnnotations.isPresent(field, HiddenInCreate.class);
    }
    return MetaAnnotations.isPresent(field, HiddenInEditor.class);
  }
}
