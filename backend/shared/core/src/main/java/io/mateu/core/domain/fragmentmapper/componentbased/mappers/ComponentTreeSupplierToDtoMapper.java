package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.RuleActionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.dtos.RuleResultDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.List;

public class ComponentTreeSupplierToDtoMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        componentTreeSupplier.id(),
        componentTreeSupplier.getClass().getName(),
        List.of(
            mapComponentToDto(
                componentTreeSupplier,
                componentTreeSupplier.getComponent(httpRequest),
                baseUrl,
                route,
                httpRequest)),
        componentTreeSupplier,
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        mapActions(componentTreeSupplier),
        mapTriggers(componentTreeSupplier),
        mapRules(componentTreeSupplier),
        null);
  }

  private static List<RuleDto> mapRules(Object serverSideObject) {
    if (serverSideObject instanceof RuleSupplier ruleSupplier) {
      return ruleSupplier.rules().stream()
          .map(
              rule ->
                  RuleDto.builder()
                      .filter(rule.filter())
                      .action(RuleActionDto.valueOf(rule.action().name()))
                      .data(rule.data())
                      .result(RuleResultDto.valueOf(rule.result().name()))
                      .build())
          .toList();
    }
    return List.of();
  }

  private static List<TriggerDto> mapTriggers(Object serverSideObject) {
    if (serverSideObject instanceof HasTriggers hasTriggers) {
      return hasTriggers.triggers().stream()
          .map(
              trigger ->
                  switch (trigger) {
                    case OnLoadTrigger onLoadTrigger ->
                        new OnLoadTriggerDto(
                            onLoadTrigger.actionId(),
                            onLoadTrigger.timeoutMillis(),
                            onLoadTrigger.times());
                    default -> new OnLoadTriggerDto("", 0, 0);
                  })
          .map(trigger -> (TriggerDto) trigger)
          .toList();
    }
    return List.of();
  }

  private static List<ActionDto> mapActions(Object serverSideObject) {
    if (serverSideObject instanceof HasActions hasActions) {
      return hasActions.actions().stream().map(action -> mapAction(action)).toList();
    }
    return List.of();
  }

  public static ActionDto mapAction(Action action) {
    return ActionDto.builder()
        .id(action.id())
        .confirmationRequired(action.confirmationRequired())
        .validationRequired(action.validationRequired())
        .background(action.background())
        .confirmationTexts(mapConfirmationTexts(action.confirmationTexts()))
        .rowsSelectedRequired(action.rowsSelectedRequired())
        .href(action.href())
        .js(action.js())
        .build();
  }

  private static ConfirmationTextsDto mapConfirmationTexts(ConfirmationTexts confirmationTexts) {
    if (confirmationTexts == null) {
      return null;
    }
    return new ConfirmationTextsDto(
        confirmationTexts.title(),
        confirmationTexts.message(),
        confirmationTexts.confirmationText(),
        confirmationTexts.denialText());
  }
}
