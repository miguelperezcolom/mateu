package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.Selector;
import java.lang.reflect.Field;
import lombok.SneakyThrows;

final class LookupSupplierResolver {

  @SneakyThrows
  static Selector getSelector(Object instance, Field field) {
    Class<? extends Selector> supplierType = null;
    if (field.isAnnotationPresent(Searchable.class)) {
      var lookup = field.getAnnotation(Searchable.class);
      supplierType = lookup.selector();
    }
    if (LookupLabelSupplier.class.equals(supplierType)) {
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
  static LookupLabelSupplier getLookupLabelSupplier(Object instance, Field field) {
    Class<? extends LookupLabelSupplier> supplierType = null;
    if (MetaAnnotations.isPresent(field, Lookup.class)) {
      var lookup = MetaAnnotations.find(field, Lookup.class);
      supplierType = lookup.label();
    }
    if (field.isAnnotationPresent(Searchable.class)) {
      var lookup = field.getAnnotation(Searchable.class);
      supplierType = lookup.label();
    }
    if (LookupLabelSupplier.class.equals(supplierType)) {
      if (instance instanceof LookupLabelSupplier supplier) {
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
      var lookup = MetaAnnotations.find(field, Lookup.class);
      if (lookup != null) {
        if (LookupOptionsSupplier.class.equals(lookup.search())) {
          if (instance instanceof LookupOptionsSupplier supplier) {
            return supplier;
          }
          return null;
        }
        var supplier =
            MateuBeanProvider.getBean(MetaAnnotations.find(field, Lookup.class).search());
        if (supplier == null) {
          return MetaAnnotations.find(field, Lookup.class).search().getConstructor().newInstance();
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
