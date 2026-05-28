package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.reflect.Field;
import lombok.SneakyThrows;

final class LookupSupplierResolver {

  @SneakyThrows
  static LabelSupplier getLabelSupplier(Object instance, Field field) {
    var lookup = field.getAnnotation(Lookup.class);
    if (LabelSupplier.class.equals(lookup.label())) {
      if (instance instanceof LabelSupplier supplier) {
        return supplier;
      }
      return null;
    }
    var supplier = MateuBeanProvider.getBean(field.getAnnotation(Lookup.class).label());
    if (supplier == null) {
      return field.getAnnotation(Lookup.class).label().getConstructor().newInstance();
    }
    return supplier;
  }

  @SneakyThrows
  static LookupOptionsSupplier getLookupOptionsSupplier(Object instance, Field field) {
    if (field != null) {
      var lookup = field.getAnnotation(Lookup.class);
      if (lookup != null) {
        if (LookupOptionsSupplier.class.equals(lookup.search())) {
          if (instance instanceof LookupOptionsSupplier supplier) {
            return supplier;
          }
          return null;
        }
        var supplier = MateuBeanProvider.getBean(field.getAnnotation(Lookup.class).search());
        if (supplier == null) {
          return field.getAnnotation(Lookup.class).search().getConstructor().newInstance();
        }
        return supplier;
      }
    }
    if (instance instanceof LookupOptionsSupplier supplier) {
      return supplier;
    }
    return null;
  }

  private LookupSupplierResolver() {}
}
