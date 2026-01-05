package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

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
import io.mateu.uidl.annotations.Rule;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.OnCustomEventTrigger;
import io.mateu.uidl.fluent.OnEnterTrigger;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import io.mateu.uidl.interfaces.StateSupplier;
import io.mateu.uidl.interfaces.ValidationSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

public class ComponentTreeSupplierToDtoMapper {

  public static ComponentDto mapComponentTreeSupplierToDto(
      ComponentTreeSupplier componentTreeSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
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
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        getState(componentTreeSupplier, httpRequest),
        componentTreeSupplier.style(),
        componentTreeSupplier.cssClasses(),
        mapActions(componentTreeSupplier),
        mapTriggers(componentTreeSupplier),
        mapRules(componentTreeSupplier),
        mapValidations(componentTreeSupplier),
        null);
  }

  public static List<ValidationDto> mapValidations(Object serverSideObject) {
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
    List<ValidationDto> fieldLevelValidations = new ArrayList<>();
    if (serverSideObject instanceof Page page) {
      getAllFields(page.getClass()).stream()
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
    }
    return Stream.concat(
            fieldLevelValidations.stream(),
            Arrays.stream(serverSideObject.getClass().getAnnotationsByType(Validation.class))
                .map(ComponentTreeSupplierToDtoMapper::mapToValidation))
        .toList();
  }

  private static List<ValidationDto> getValidations(Field field) {
    List<ValidationDto> validations = new ArrayList<>();
    if (field.isAnnotationPresent(Size.class)) {
      Arrays.stream(field.getAnnotationsByType(Size.class))
          .forEach(
              annotation -> {
                if (annotation.min() > 0) {
                  validations.add(
                      ValidationDto.builder()
                          .fieldId(field.getName())
                          .condition(
                              "state."
                                  + field.getName()
                                  + " && state."
                                  + field.getName()
                                  + ".length < "
                                  + annotation.min())
                          .message(annotation.message())
                          .build());
                }
                if (annotation.max() < Integer.MAX_VALUE) {
                  validations.add(
                      ValidationDto.builder()
                          .fieldId(field.getName())
                          .condition(
                              "state."
                                  + field.getName()
                                  + " && state."
                                  + field.getName()
                                  + ".length > "
                                  + annotation.max())
                          .message(annotation.message())
                          .build());
                }
              });
    }
    if (field.isAnnotationPresent(Min.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(field.getName())
              .condition(
                  "state." + field.getName() + " < " + field.getAnnotation(Min.class).value())
              .message(field.getAnnotation(Min.class).message())
              .build());
    }
    if (field.isAnnotationPresent(Max.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(field.getName())
              .condition(
                  "state." + field.getName() + " > " + field.getAnnotation(Max.class).value())
              .message(field.getAnnotation(Max.class).message())
              .build());
    }
    if (field.isAnnotationPresent(Pattern.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(field.getName())
              .condition(
                  "/"
                      + field.getAnnotation(Pattern.class).regexp()
                      + "/.test(state."
                      + field.getName()
                      + ")")
              .message(field.getAnnotation(Pattern.class).message())
              .build());
    }
    return validations;
  }

  private static ValidationDto mapToValidation(Validation annotation) {
    return ValidationDto.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }

  public static List<RuleDto> mapRules(Object serverSideObject) {
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
    return Arrays.stream(serverSideObject.getClass().getAnnotationsByType(Rule.class))
        .map(annotation -> mapToRule(annotation))
        .toList();
  }

  private static RuleDto mapToRule(Rule annotation) {
    return RuleDto.builder()
        .filter(annotation.filter())
        .action(
            annotation.action() != null
                ? RuleActionDto.valueOf(annotation.action().name())
                : RuleActionDto.RunAction)
        .fieldName(annotation.fieldName())
        .fieldAttribute(
            annotation.fieldAttribute() != null
                ? RuleFieldAttributeDto.valueOf(annotation.fieldAttribute().name())
                : null)
        .value(annotation.value())
        .expression(annotation.expression())
        .result(
            annotation.result() != null ? RuleResultDto.valueOf(annotation.result().name()) : null)
        .actionId(annotation.actionId())
        .build();
  }

  public static List<TriggerDto> mapTriggers(Object serverSideObject) {
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
    return Arrays.stream(
            serverSideObject
                .getClass()
                .getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class))
        .map(ComponentTreeSupplierToDtoMapper::mapToTrigger)
        .toList();
  }

  private static TriggerDto mapToTrigger(io.mateu.uidl.annotations.Trigger annotation) {
    return switch (annotation.type()) {
      case OnCustomEvent ->
          OnCustomEventTriggerDto.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .eventName(annotation.eventName())
              .actionId(annotation.actionId())
              .build();
      case OnSuccess ->
          OnSuccessTriggerDto.builder()
              .actionId(annotation.actionId())
              .calledActionId(annotation.calledActionId())
              .condition(annotation.condition())
              .build();
      case OnError ->
          OnErrorTriggerDto.builder()
              .actionId(annotation.actionId())
              .calledActionId(annotation.calledActionId())
              .condition(annotation.condition())
              .build();
      case OnValueChange ->
          OnValueChangeTriggerDto.builder()
              .actionId(annotation.actionId())
              .propertyName(annotation.propertyName())
              .condition(annotation.condition())
              .build();
      case OnEnter ->
          OnEnterTriggerDto.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .build();
      case OnLoad ->
          OnLoadTriggerDto.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .timeoutMillis(annotation.timeoutMillis())
              .times(annotation.times())
              .build();
    };
  }

  public static List<ActionDto> mapActions(Object serverSideObject) {
    if (serverSideObject instanceof ActionSupplier hasActions) {
      return hasActions.actions().stream()
          .map(ComponentTreeSupplierToDtoMapper::mapAction)
          .toList();
    }
    List<ActionDto> fieldActions = new ArrayList<>();
    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            field ->
                mapToAction(field.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(field.getName()))
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            method ->
                mapToAction(method.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(method.getName()))
        .forEach(fieldActions::add);

    return Stream.concat(
            fieldActions.stream(),
            Arrays.stream(
                    serverSideObject
                        .getClass()
                        .getAnnotationsByType(io.mateu.uidl.annotations.Action.class))
                .map(ComponentTreeSupplierToDtoMapper::mapToAction))
        .toList();
  }

  private static ActionDto mapToAction(io.mateu.uidl.annotations.Action annotation) {
    return ActionDto.builder()
        .id(annotation.id())
        .validationRequired(annotation.validationRequired())
        .confirmationRequired(annotation.confirmationRequired())
        .rowsSelectedRequired(annotation.rowsSelectedRequired())
        .confirmationTexts(
            isConfirmationTextNeeded(annotation)
                ? ConfirmationTextsDto.builder()
                    .title(annotation.confirmationTitle())
                    .message(annotation.confirmationMessage())
                    .confirmationText(annotation.confirmationText())
                    .denialText(annotation.confirmationDenialText())
                    .build()
                : null)
        .modalStyle(annotation.modalStyle())
        .modalTitle(annotation.modalTitle())
        .customEvent(
            isCustomEventNeeded(annotation)
                ? CustomEventDto.builder()
                    .name(annotation.customEventName())
                    .detail(annotation.customEventDetail())
                    .build()
                : null)
        .href(annotation.href())
        .js(annotation.js())
        .background(annotation.background())
        .sse(annotation.sse())
        .build();
  }

  private static boolean isCustomEventNeeded(io.mateu.uidl.annotations.Action annotation) {
    return annotation.customEventName() != null || annotation.customEventDetail() != null;
  }

  private static boolean isConfirmationTextNeeded(io.mateu.uidl.annotations.Action annotation) {
    return annotation.confirmationText() != null
        || annotation.confirmationMessage() != null
        || annotation.confirmationTitle() != null
        || annotation.confirmationDenialText() != null;
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
