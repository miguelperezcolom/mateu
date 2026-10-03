package io.mateu.core.domain.act;

import static io.mateu.core.application.runaction.ComponentStateHelper.getState;
import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ActionMapper.createActions;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.createComponent;
import static io.mateu.core.domain.out.fragmentmapper.mappers.RuleMapper.createRules;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TriggerMapper.createTriggers;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.createValidations;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getSelector;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.declarative.orchestrators.crud.SearchableValues;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.ServerSideComponent;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.SearchableSelection;
import io.mateu.uidl.interfaces.Selector;
import jakarta.inject.Named;
import java.lang.reflect.ParameterizedType;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import reactor.core.publisher.Flux;

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

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId.startsWith("codesearch-")) {
      var httpRequest = command.httpRequest();
      // search-field-childfield
      String fieldName = actionId.substring(actionId.indexOf('-') + 1);
      Selector optionsSupplier = null;
      Searchable fkAnnotation = null;
      java.lang.reflect.Field field = null;
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
        field = getFieldByName(rowClass, childFieldName);
        optionsSupplier = getSelector(instance, field);
      } else {
        field = getFieldByName(getViewModelClass(instance, httpRequest), fieldName);
        optionsSupplier = getSelector(instance, field);
      }

      if (optionsSupplier == null) {
        throw new RuntimeException("no lookup options supplier found for field " + fieldName);
      }

      // a multi-valued field (List / Set / array of ids): the selector opens with row selection
      // and «Add selected», and carries the ids the field holds, so a pick ADDS to them
      var multi = SearchableValues.isMultiValued(field);
      Map<String, Object> multiState = Map.of();
      if (multi) {
        httpRequest.setAttribute(SearchableSelection.MULTI, true);
        var owner = fieldName.contains("-") ? null : instance;
        var ids = owner != null ? SearchableValues.idsOf(field, owner) : List.<Object>of();
        multiState =
            Map.of(
                SearchableSelection.MULTI,
                true,
                SearchableSelection.VALUES,
                ids,
                SearchableSelection.LABELS,
                SearchableValues.labelsOf(field, owner, ids, httpRequest));
      }
      return Flux.just(
          Dialog.builder()
              .content(
                  wrapWithServerSideComponent(
                      createComponent(
                          optionsSupplier,
                          command.baseUrl(),
                          command.route(),
                          command.consumedRoute(),
                          command.initiatorComponentId(),
                          command.httpRequest()),
                      optionsSupplier,
                      multiState,
                      command.baseUrl(),
                      command.route(),
                      command.consumedRoute(),
                      command.initiatorComponentId(),
                      command.httpRequest()))
              .build());
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private static Object withExtraState(Object state, Map<String, Object> extraState) {
    if (extraState.isEmpty()) {
      return state;
    }
    var merged = new LinkedHashMap<String, Object>();
    if (state instanceof Map<?, ?> map) {
      merged.putAll((Map<String, Object>) map);
    }
    merged.putAll(extraState);
    return merged;
  }

  private Component wrapWithServerSideComponent(
      Component clientSideComponent,
      Object serverSideComponent,
      Map<String, Object> extraState,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ServerSideComponent.builder()
        .id(
            httpRequest.getAttribute("upstreamComponentId") != null
                ? httpRequest.getAttribute("upstreamComponentId").toString()
                : UUID.randomUUID().toString())
        .serverSideType(serverSideComponent.getClass().getName())
        .route(consumedRoute)
        .initialData(withExtraState(getState(serverSideComponent, httpRequest), extraState))
        .style("width: 100%;")
        .cssClasses("")
        .actions(createActions(serverSideComponent, httpRequest))
        .triggers(createTriggers(serverSideComponent, httpRequest))
        .rules(createRules(serverSideComponent, httpRequest))
        .validations(createValidations(serverSideComponent, route, httpRequest))
        .children(List.of(clientSideComponent))
        .build();
  }
}
