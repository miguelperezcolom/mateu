package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getLookupLabelSupplier;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import jakarta.inject.Named;
import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Slf4j
@Named
public class CodeFieldActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith("code-");
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId.startsWith("code-")) {
      var httpRequest = command.httpRequest();
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      LookupLabelSupplier optionsSupplier = null;
      Searchable fkAnnotation = null;
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
        optionsSupplier =
            getLookupLabelSupplier(instance, getFieldByName(rowClass, childFieldName));
      } else {
        optionsSupplier =
            getLookupLabelSupplier(
                instance, getFieldByName(getViewModelClass(instance, httpRequest), fieldName));
      }

      if (optionsSupplier == null) {
        throw new RuntimeException("no lookup options supplier found for field " + fieldName);
      }

      var label = "Not found";
      var code = command.httpRequest().getParameters(Map.class).get("code");
      try {
        label = optionsSupplier.label(fieldName, code, command.httpRequest());
      } catch (Throwable e) {
        log.warn("Lookup label resolution failed for field {} and code {}", fieldName, code, e);
      }
      return Flux.just(
          List.of(
              new State(Map.of(fieldName, code)), new Data(Map.of(fieldName + "-label", label))));
    }
    return null;
  }
}
