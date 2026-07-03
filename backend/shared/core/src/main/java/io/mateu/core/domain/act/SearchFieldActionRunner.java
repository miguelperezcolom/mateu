package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getLookupOptionsSupplier;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.inject.Named;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class SearchFieldActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith("search-");
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId.startsWith("search-")) {
      var httpRequest = command.httpRequest();
      // search-field-childfield (nested/inline grid) or search-field (plain @Lookup field).
      String fieldName = actionId.substring("search-".length());
      LookupOptionsSupplier optionsSupplier = null;
      Lookup fkAnnotation = null;
      if (fieldName.contains("-")) {
        // The child (column) is always a bare Java identifier with no dash, so split on the LAST
        // dash: this keeps the parse correct even when the parent grid field id carries a prefix
        // that itself contains dashes.
        var parentFieldName = fieldName.substring(0, fieldName.lastIndexOf('-'));
        var childFieldName = fieldName.substring(fieldName.lastIndexOf('-') + 1);
        var rowClass =
            getGenericClass(
                (ParameterizedType)
                    getFieldByName(getViewModelClass(instance, httpRequest), parentFieldName)
                        .getGenericType(),
                List.class,
                "E");
        optionsSupplier =
            getLookupOptionsSupplier(instance, getFieldByName(rowClass, childFieldName));
      } else {
        optionsSupplier =
            getLookupOptionsSupplier(
                instance, getFieldByName(getViewModelClass(instance, httpRequest), fieldName));
      }

      if (optionsSupplier == null) {
        throw new RuntimeException("no lookup options supplier found for field " + fieldName);
      }

      Pageable pageable = httpRequest.getParameters(Pageable.class);
      String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
      if (searchText == null) {
        searchText = "";
      }
      var cleanSearchText = searchText.toLowerCase();

      var listingData = optionsSupplier.search(fieldName, cleanSearchText, pageable, httpRequest);
      if (listingData == null || listingData.page() == null) {
        throw new RuntimeException(
            "no data returned when searching for " + fieldName + " with " + cleanSearchText + "");
      }

      return Flux.just(new Data(Map.of(fieldName, listingData.page())));
    }
    return null;
  }
}
