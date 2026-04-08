package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
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
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      LookupOptionsSupplier optionsSupplier = null;
      if (fieldName.contains("-")) {
        var parentFieldName = fieldName.substring(0, fieldName.indexOf('-'));
        var childFieldName = fieldName.substring(fieldName.indexOf('-') + 1);
        var rowClass =
            getGenericClass(
                (ParameterizedType)
                    getFieldByName(getViewModelClass(instance, httpRequest), parentFieldName)
                        .getGenericType(),
                List.class,
                "E");
        var fkAnnotation = getFieldByName(rowClass, childFieldName).getAnnotation(Lookup.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      } else {
        var fkAnnotation =
            getFieldByName(getViewModelClass(instance, httpRequest), fieldName)
                .getAnnotation(Lookup.class);
        optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());
      }

      Pageable pageable = httpRequest.getParameters(Pageable.class);
      String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
      if (searchText == null) {
        searchText = "";
      }
      var cleanSearchText = searchText.toLowerCase();

      var listingData = optionsSupplier.search(cleanSearchText, pageable, httpRequest);

      return Flux.just(new Data(Map.of(fieldName, listingData.page())));
    }
    return null;
  }
}
