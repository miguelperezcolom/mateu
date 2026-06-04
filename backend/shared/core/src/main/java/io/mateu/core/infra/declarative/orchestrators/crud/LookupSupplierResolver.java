package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.reflect.Field;

import io.mateu.uidl.interfaces.Selector;
import lombok.SneakyThrows;

final class LookupSupplierResolver {

    @SneakyThrows
    static Selector getSelector(Object instance, Field field) {
        Class<? extends Selector> supplierType = null;
        if (field.isAnnotationPresent(Searchable.class)) {
            var lookup = field.getAnnotation(Searchable.class);
            supplierType = lookup.selector();
        }
        if (LabelSupplier.class.equals(supplierType)) {
            if (instance instanceof Selector supplier) {
                return supplier;
            }
            return null;
        }
        var supplier = MateuBeanProvider.getBean(supplierType);
        if (supplier == null) {
            return supplierType.getConstructor().newInstance();
        }
        return supplier;
    }

  @SneakyThrows
  static LabelSupplier getLabelSupplier(Object instance, Field field) {
      Class<? extends LabelSupplier> supplierType = null;
      if (field.isAnnotationPresent(Lookup.class)) {
          var lookup = field.getAnnotation(Lookup.class);
          supplierType = lookup.label();
      }
      if (field.isAnnotationPresent(Searchable.class)) {
          var lookup = field.getAnnotation(Searchable.class);
          supplierType = lookup.label();
      }
      if (LabelSupplier.class.equals(supplierType)) {
          if (instance instanceof LabelSupplier supplier) {
              return supplier;
          }
          return null;
      }
      var supplier = MateuBeanProvider.getBean(supplierType);
    if (supplier == null) {
      return supplierType.getConstructor().newInstance();
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
