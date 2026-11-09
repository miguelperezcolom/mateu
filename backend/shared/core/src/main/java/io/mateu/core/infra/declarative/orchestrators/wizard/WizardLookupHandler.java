package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.core.application.security.ActionMethods;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.Map;

final class WizardLookupHandler {

  static Data handleSearch(String actionId, Wizard orchestrator, HttpRequest httpRequest) {
    String fieldName = actionId.substring(actionId.indexOf('-') + 1);
    LookupOptionsSupplier optionsSupplier;
    var stepClass = orchestrator.currentStepField().getType();
    if (fieldName.contains("-")) {
      var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
      var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
      var parentField = getFieldByName(stepClass, parentFieldName);
      ActionMethods.checkFieldVisible(parentField, stepClass, httpRequest);
      var rowClass =
          io.mateu.uidl.reflection.GenericClassProvider.getGenericClass(
              (java.lang.reflect.ParameterizedType) parentField.getGenericType(),
              java.util.List.class,
              "E");
      var childField = getFieldByName(rowClass, childFieldName);
      ActionMethods.checkFieldVisible(childField, rowClass, httpRequest);
      var fkAnnotation = MetaAnnotations.find(childField, Lookup.class);
      optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
    } else {
      var field = getFieldByName(stepClass, fieldName);
      ActionMethods.checkFieldVisible(field, stepClass, httpRequest);
      var fkAnnotation = MetaAnnotations.find(field, Lookup.class);
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
