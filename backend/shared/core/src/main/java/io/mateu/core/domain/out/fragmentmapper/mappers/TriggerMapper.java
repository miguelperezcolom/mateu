package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.AutoSaveTriggerDto;
import io.mateu.dtos.OnCustomEventTriggerDto;
import io.mateu.dtos.OnEnterTriggerDto;
import io.mateu.dtos.OnErrorTriggerDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.OnSuccessTriggerDto;
import io.mateu.dtos.OnValueChangeTriggerDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.fluent.OnCustomEventTrigger;
import io.mateu.uidl.fluent.OnEnterTrigger;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TriggerMapper {

  public static List<TriggerDto> mapTriggers(Object serverSideObject, HttpRequest httpRequest) {
    if (serverSideObject instanceof TriggersSupplier hasTriggers) {
      return hasTriggers.triggers(httpRequest).stream()
          .map(
              trigger ->
                  switch (trigger) {
                    case OnLoadTrigger t ->
                        new OnLoadTriggerDto(
                            t.actionId(), t.timeoutMillis(), t.times(), t.condition());
                    case OnCustomEventTrigger t ->
                        new OnCustomEventTriggerDto(t.actionId(), t.eventName(), t.condition());
                    case OnSuccessTrigger t ->
                        new OnSuccessTriggerDto(
                            t.actionId(), t.calledActionId(), t.condition(), t.timeoutMillis());
                    case OnErrorTrigger t ->
                        new OnErrorTriggerDto(t.actionId(), t.calledActionId(), t.condition());
                    case OnValueChangeTrigger t ->
                        new OnValueChangeTriggerDto(t.actionId(), t.propertyName(), t.condition());
                    case OnEnterTrigger t -> new OnEnterTriggerDto(t.actionId(), t.condition());
                    default -> new OnLoadTriggerDto("", 0, 0, null);
                  })
          .map(trigger -> (TriggerDto) trigger)
          .toList();
    }
    var triggers = new ArrayList<TriggerDto>(
        Arrays.stream(
                serverSideObject
                    .getClass()
                    .getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class))
            .map(TriggerMapper::mapToTrigger)
            .toList());
    var autoSave = serverSideObject.getClass().getAnnotation(AutoSave.class);
    if (autoSave != null) {
      triggers.add(new AutoSaveTriggerDto(autoSave.action(), autoSave.debounceMillis()));
    }
    return triggers;
  }

  public static TriggerDto mapToTrigger(io.mateu.uidl.annotations.Trigger annotation) {
    return switch (annotation.type()) {
      case OnCustomEvent ->
          OnCustomEventTriggerDto.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .eventName(annotation.eventName())
              .build();
      case OnSuccess ->
          OnSuccessTriggerDto.builder()
              .actionId(annotation.actionId())
              .calledActionId(annotation.calledActionId())
              .condition(annotation.condition())
              .timeoutMillis(annotation.timeoutMillis())
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
}
