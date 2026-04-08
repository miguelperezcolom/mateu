package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

public class SearchActionHandler {

  @SneakyThrows
  public static Object handleSearchOnField(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest) {
    // search-field-childfield
    String fieldName = actionId.substring(actionId.indexOf('-') + 1);
    LookupOptionsSupplier optionsSupplier = null;
    if (fieldName.contains("-")) {
      var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
      var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
      var rowClass =
          getGenericClass(
              (ParameterizedType)
                  getFieldByName(crudOrchestrator.viewClass(), parentFieldName).getGenericType(),
              List.class,
              "E");
      var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(Lookup.class);
      optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
    } else {
      var fkAnnotation =
          getFieldByName(crudOrchestrator.entityClass(), fieldName).getAnnotation(Lookup.class);
      optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
    }

    Pageable pageable = httpRequest.getParameters(Pageable.class);
    String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
    if (searchText == null) {
      searchText = "";
    }
    var cleanSearchText = searchText.toLowerCase();

    var listingData = optionsSupplier.search(cleanSearchText, pageable, httpRequest);

    return new Data(Map.of(fieldName, listingData.page()));
  }
}
