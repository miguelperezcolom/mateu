package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.Selector;
import jakarta.inject.Named;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.mateu.core.application.runaction.ComponentStateHelper.getState;
import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.createActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.mapActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.createComponent;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.createRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.mapRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.createTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.mapTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.createValidations;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.mapValidations;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getLabelSupplier;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getSelector;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

@Named
public class CodeSearchFieldActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId != null && actionId.startsWith("codesearch-");
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId.startsWith("codesearch-")) {
      var httpRequest = command.httpRequest();
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      Selector optionsSupplier = null;
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
            getSelector(instance, getFieldByName(rowClass, childFieldName));
      } else {
        optionsSupplier =
            getSelector(
                instance, getFieldByName(getViewModelClass(instance, httpRequest), fieldName));
      }

      if (optionsSupplier == null) {
        throw new RuntimeException("no lookup options supplier found for field " + fieldName);
      }

      return Flux.just(Dialog.builder()
                      .content(wrapSSC(createComponent(optionsSupplier, command.baseUrl(), command.route(), command.consumedRoute(), command.initiatorComponentId(), command.httpRequest()),
                              optionsSupplier,
                              command.baseUrl(),
                              command.route(),
                              command.consumedRoute(),
                              command.initiatorComponentId(),
                              command.httpRequest()
                      ))
              .build());
    }
    return null;
  }

    private Component wrapSSC(Component clientSideComponent,
                              Object serverSideComponent,
                              String baseUrl,
                              String route,
                              String consumedRoute,
                              String initiatorComponentId,
                              HttpRequest httpRequest
    ) {
      return ServerSideComponent.builder()
              .id(httpRequest.getAttribute("upstreamComponentId") != null
                      ? httpRequest.getAttribute("upstreamComponentId").toString()
                      : UUID.randomUUID().toString())
              .serverSideType(serverSideComponent.getClass().getName())
              .route(consumedRoute)
              .initialData(getState(serverSideComponent, httpRequest))
              .style("width: 100%;")
              .cssClasses("")
              .actions(createActions(serverSideComponent, httpRequest))
              .triggers(createTriggers(serverSideComponent, httpRequest))
              .rules(createRules(serverSideComponent))
              .validations(createValidations(serverSideComponent, route))
              .children(List.of(clientSideComponent))
              .build();
    }
}
