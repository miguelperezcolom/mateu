package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.Map;
import lombok.SneakyThrows;

final class WizardLookupHandler {

  @SneakyThrows
  static Data handleSearch(
      String actionId, WizardOrchestrator orchestrator, HttpRequest httpRequest) {
    String fieldName = actionId.substring(actionId.indexOf('-') + 1);
    LookupOptionsSupplier optionsSupplier;
    if (fieldName.contains("-")) {
      var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
      var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
      var rowClass =
          io.mateu.uidl.reflection.GenericClassProvider.getGenericClass(
              (java.lang.reflect.ParameterizedType)
                  getFieldByName(orchestrator.currentStepField().getType(), parentFieldName)
                      .getGenericType(),
              java.util.List.class,
              "E");
      var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(Lookup.class);
      optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
    } else {
      var fkAnnotation =
          getFieldByName(orchestrator.currentStepField().getType(), fieldName)
              .getAnnotation(Lookup.class);
      optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
    }
    Pageable pageable = httpRequest.getParameters(Pageable.class);
    String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
    if (searchText == null) {
      searchText = "";
    }
    var listingData = optionsSupplier.search(fieldName, searchText, pageable, httpRequest);
    return new Data(Map.of(fieldName, listingData.page()));
  }
}
