package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.Selector;
import java.lang.reflect.Field;
import java.util.HashMap;

public class DataLayer {

  public static HttpRequest addData(Object item, HttpRequest httpRequest) {
    if (item == null) {
      return httpRequest;
    }
    if (item instanceof AutoNamedView<?> autoNamedView) {
      item = autoNamedView.entity();
    }
    var data = createData(item, httpRequest);
    httpRequest.setAttribute("data", data);
    return httpRequest;
  }

  public static HashMap<String, Object> createData(Object item, HttpRequest httpRequest) {
    var data = new HashMap<String, Object>();
    if (item instanceof LookupLabelSupplier labelSupplier) {
      getAllFields(item.getClass())
          .forEach(
              field ->
                  LookupFieldDataWriter.writeField(field, item, labelSupplier, data, httpRequest));
    }
    getAllFields(item.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Lookup.class))
        .forEach(
            field ->
                LookupFieldDataWriter.writeField(
                    field, item, getLookupLabelSupplier(item, field), data, httpRequest));
    return data;
  }

  public static LookupLabelSupplier getLookupLabelSupplier(Object instance, Field field) {
    return LookupSupplierResolver.getLookupLabelSupplier(instance, field);
  }

  public static Selector getSelector(Object instance, Field field) {
    return LookupSupplierResolver.getSelector(instance, field).withFieldId(field.getName());
  }

  public static LookupOptionsSupplier getLookupOptionsSupplier(Object instance, Field field) {
    return LookupSupplierResolver.getLookupOptionsSupplier(instance, field);
  }
}
