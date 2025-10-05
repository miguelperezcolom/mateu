package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.CustomEventDto;
import io.mateu.dtos.OnCustomEventTriggerDto;
import io.mateu.dtos.OnEnterTriggerDto;
import io.mateu.dtos.OnErrorTriggerDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.OnSuccessTriggerDto;
import io.mateu.dtos.OnValueChangeTriggerDto;
import io.mateu.dtos.RuleActionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.dtos.RuleFieldAttributeDto;
import io.mateu.dtos.RuleResultDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.OnCustomEventTrigger;
import io.mateu.uidl.fluent.OnEnterTrigger;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import io.mateu.uidl.interfaces.ValidationSupplier;
import java.util.List;
import java.util.UUID;

public class ComponentTreeSupplierToDtoMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        componentTreeSupplier.getClass().getName(),
        List.of(
            mapComponentToDto(
                componentTreeSupplier,
                componentTreeSupplier.component(httpRequest),
                baseUrl,
                route,
                httpRequest)),
        componentTreeSupplier,
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        mapActions(componentTreeSupplier),
        mapTriggers(componentTreeSupplier),
        mapRules(componentTreeSupplier),
        mapValidations(componentTreeSupplier),
        null);
  }

  private static List<ValidationDto> mapValidations(ComponentTreeSupplier serverSideObject) {
    if (serverSideObject instanceof ValidationSupplier validationSupplier) {
      return validationSupplier.validations().stream()
          .map(
              validation ->
                  ValidationDto.builder()
                      .condition(validation.condition())
                      .fieldId(validation.fieldId())
                      .message(validation.message())
                      .build())
          .toList();
    }
    return List.of();
  }

  private static List<RuleDto> mapRules(Object serverSideObject) {
    if (serverSideObject instanceof RuleSupplier ruleSupplier) {
      return ruleSupplier.rules().stream()
          .map(
              rule ->
                  RuleDto.builder()
                      .filter(rule.filter())
                      .action(RuleActionDto.valueOf(rule.action().name()))
                      .fieldAttribute(
                          rule.fieldAttribute() != null
                              ? RuleFieldAttributeDto.valueOf(rule.fieldAttribute().name())
                              : null)
                      .fieldName(rule.fieldName())
                      .value(rule.value())
                      .expression(rule.expression())
                      .result(RuleResultDto.valueOf(rule.result().name()))
                      .actionId(rule.actionId())
                      .build())
          .toList();
    }
    return List.of();
  }

  private static List<TriggerDto> mapTriggers(Object serverSideObject) {
    if (serverSideObject instanceof TriggersSupplier hasTriggers) {
      return hasTriggers.triggers().stream()
          .map(
              trigger ->
                  switch (trigger) {
                    case OnLoadTrigger onLoadTrigger ->
                        new OnLoadTriggerDto(
                            onLoadTrigger.actionId(),
                            onLoadTrigger.timeoutMillis(),
                            onLoadTrigger.times(),
                            onLoadTrigger.condition());
                    case OnCustomEventTrigger onCustomEventTrigger ->
                        new OnCustomEventTriggerDto(
                            onCustomEventTrigger.actionId(),
                            onCustomEventTrigger.eventName(),
                            onCustomEventTrigger.condition());
                    case OnSuccessTrigger onSuccessTrigger ->
                        new OnSuccessTriggerDto(
                            onSuccessTrigger.actionId(),
                            onSuccessTrigger.calledActionId(),
                            onSuccessTrigger.condition());
                    case OnErrorTrigger onErrorTrigger ->
                        new OnErrorTriggerDto(
                            onErrorTrigger.actionId(),
                            onErrorTrigger.calledActionId(),
                            onErrorTrigger.condition());
                    case OnValueChangeTrigger onValueChangeTrigger ->
                        new OnValueChangeTriggerDto(
                            onValueChangeTrigger.actionId(),
                            onValueChangeTrigger.propertyName(),
                            onValueChangeTrigger.condition());
                    case OnEnterTrigger onEnterTrigger ->
                        new OnEnterTriggerDto(
                            onEnterTrigger.actionId(), onEnterTrigger.condition());
                    default -> new OnLoadTriggerDto("", 0, 0, null);
                  })
          .map(trigger -> (TriggerDto) trigger)
          .toList();
    }
    return List.of();
  }

  private static List<ActionDto> mapActions(Object serverSideObject) {
    if (serverSideObject instanceof ActionSupplier hasActions) {
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
        .customEvent(
            action.customEvent() != null
                ? new CustomEventDto(action.customEvent().name(), action.customEvent().detail())
                : null)
        .sse(action.sse())
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
