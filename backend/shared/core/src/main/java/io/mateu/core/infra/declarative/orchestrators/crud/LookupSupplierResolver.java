package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.Selector;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;

final class LookupSupplierResolver {

  /** Instantiate a supplier via its no-arg constructor, surfacing the constructor's REAL cause. */
  private static <S> S instantiate(Class<S> type) {
    try {
      return type.getConstructor().newInstance();
    } catch (InvocationTargetException e) {
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException("Cannot instantiate " + type.getName(), e);
    }
  }

  static Selector getSelector(Object instance, Field field) {
    Class<? extends Selector> supplierType = null;
    if (MetaAnnotations.isPresent(field, Searchable.class)) {
      var lookup = MetaAnnotations.find(field, Searchable.class);
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
      return instantiate(supplierType);
    }
    return supplier;
  }

  static LookupLabelSupplier getLookupLabelSupplier(Object instance, Field field) {
    Class<? extends LookupLabelSupplier> supplierType = null;
    if (MetaAnnotations.isPresent(field, Lookup.class)) {
      var lookup = MetaAnnotations.find(field, Lookup.class);
      supplierType = lookup.label();
    }
    if (MetaAnnotations.isPresent(field, Searchable.class)) {
      var lookup = MetaAnnotations.find(field, Searchable.class);
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
      return instantiate(supplierType);
    }
    return supplier;
  }

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
          return instantiate(MetaAnnotations.find(field, Lookup.class).search());
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
