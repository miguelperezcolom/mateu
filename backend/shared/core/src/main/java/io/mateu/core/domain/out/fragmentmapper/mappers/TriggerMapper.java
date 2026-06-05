package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.*;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TriggerMapper {
  public static List<TriggerDto> mapTriggers(Object serverSideObject, HttpRequest httpRequest) {
    return createTriggers(serverSideObject, httpRequest).stream()
        .map(TriggerMapper::mapTrigger)
        .toList();
  }

  public static List<Trigger> createTriggers(Object serverSideObject, HttpRequest httpRequest) {
    if (serverSideObject instanceof TriggersSupplier hasTriggers) {
      return hasTriggers.triggers(httpRequest).stream()
          .map(
              trigger ->
                  switch (trigger) {
                    case OnLoadTrigger t ->
                        new OnLoadTrigger(
                            t.actionId(), t.timeoutMillis(), t.times(), t.condition());
                    case OnCustomEventTrigger t ->
                        new OnCustomEventTrigger(t.actionId(), t.eventName(), t.condition());
                    case OnSuccessTrigger t ->
                        new OnSuccessTrigger(
                            t.actionId(), t.calledActionId(), t.condition(), t.timeoutMillis());
                    case OnErrorTrigger t ->
                        new OnErrorTrigger(t.actionId(), t.calledActionId(), t.condition());
                    case OnValueChangeTrigger t ->
                        new OnValueChangeTrigger(t.actionId(), t.propertyName(), t.condition());
                    default -> new OnLoadTrigger("", 0, 0, null);
                  })
          .map(trigger -> (Trigger) trigger)
          .toList();
    }
    var triggers =
        new ArrayList<Trigger>(
            Arrays.stream(
                    serverSideObject
                        .getClass()
                        .getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class))
                .map(TriggerMapper::mapToTrigger)
                .toList());
    var autoSave = serverSideObject.getClass().getAnnotation(AutoSave.class);
    if (autoSave != null) {
      triggers.add(new AutoSaveTrigger(autoSave.action(), autoSave.debounceMillis()));
    }
    return triggers;
  }

  public static Trigger mapToTrigger(io.mateu.uidl.annotations.Trigger annotation) {
    return switch (annotation.type()) {
      case OnCustomEvent ->
          OnCustomEventTrigger.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .eventName(annotation.eventName())
              .build();
      case OnSuccess ->
          OnSuccessTrigger.builder()
              .actionId(annotation.actionId())
              .calledActionId(annotation.calledActionId())
              .condition(annotation.condition())
              .timeoutMillis(annotation.timeoutMillis())
              .build();
      case OnError ->
          OnErrorTrigger.builder()
              .actionId(annotation.actionId())
              .calledActionId(annotation.calledActionId())
              .condition(annotation.condition())
              .build();
      case OnValueChange ->
          OnValueChangeTrigger.builder()
              .actionId(annotation.actionId())
              .propertyName(annotation.propertyName())
              .condition(annotation.condition())
              .build();
      case OnLoad ->
          OnLoadTrigger.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .timeoutMillis(annotation.timeoutMillis())
              .times(annotation.times())
              .build();
    };
  }

  public static TriggerDto mapTrigger(Trigger trigger) {
    if (trigger instanceof AutoSaveTrigger(String actionId, int debounceMillis)) {
      return AutoSaveTriggerDto.builder().actionId(actionId).debounceMillis(debounceMillis).build();
    }
    if (trigger
        instanceof OnCustomEventTrigger(String actionId, String eventName, String condition)) {
      return OnCustomEventTriggerDto.builder()
          .actionId(actionId)
          .eventName(eventName)
          .condition(condition)
          .build();
    }
    if (trigger
        instanceof
        OnSuccessTrigger(
            String actionId,
            String calledActionId,
            String condition,
            int timeoutMillis)) {
      return OnSuccessTriggerDto.builder()
          .actionId(actionId)
          .calledActionId(calledActionId)
          .condition(condition)
          .timeoutMillis(timeoutMillis)
          .build();
    }
    if (trigger
        instanceof OnErrorTrigger(String actionId, String calledActionId, String condition)) {
      return OnErrorTriggerDto.builder()
          .actionId(actionId)
          .calledActionId(calledActionId)
          .condition(condition)
          .build();
    }
    if (trigger
        instanceof OnValueChangeTrigger(String actionId, String propertyName, String condition)) {
      return OnValueChangeTriggerDto.builder()
          .actionId(actionId)
          .condition(condition)
          .propertyName(propertyName)
          .build();
    }
    if (trigger instanceof OnLoadTrigger onLoadTrigger) {
      return OnLoadTriggerDto.builder()
          .actionId(onLoadTrigger.actionId())
          .condition(onLoadTrigger.condition())
          .timeoutMillis(onLoadTrigger.timeoutMillis())
          .timeoutMillis(onLoadTrigger.timeoutMillis())
          .build();
    }
    throw new RuntimeException("not supported trigger: " + trigger.getClass().getName());
  }
}
