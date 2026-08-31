package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.infra.reflection.MetaAnnotations;
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
    // los triggers del TriggersSupplier se SUMAN a los de las anotaciones de la clase —
    // implementar el supplier no debe suprimir los @Trigger/@SubscribeTo/@AutoSave
    // declarados (antes hacía return temprano, y un AutoSaveTrigger del supplier caía al
    // default y se convertía silenciosamente en un OnLoad vacío)
    var supplied =
        serverSideObject instanceof TriggersSupplier hasTriggers
            ? hasTriggers.triggers(httpRequest).stream()
                .map(
                    trigger ->
                        switch (trigger) {
                          case OnLoadTrigger t ->
                              new OnLoadTrigger(
                                  t.actionId(), t.timeoutMillis(), t.times(), t.condition());
                          case OnCustomEventTrigger t ->
                              new OnCustomEventTrigger(
                                  t.actionId(), t.eventName(), t.condition(), t.source(), t.from());
                          case OnSuccessTrigger t ->
                              new OnSuccessTrigger(
                                  t.actionId(),
                                  t.calledActionId(),
                                  t.condition(),
                                  t.timeoutMillis());
                          case OnErrorTrigger t ->
                              new OnErrorTrigger(t.actionId(), t.calledActionId(), t.condition());
                          case OnValueChangeTrigger t ->
                              new OnValueChangeTrigger(
                                  t.actionId(), t.propertyName(), t.condition());
                          case AutoSaveTrigger t ->
                              new AutoSaveTrigger(t.actionId(), t.debounceMillis());
                          default -> new OnLoadTrigger("", 0, 0, null);
                        })
                .map(trigger -> (Trigger) trigger)
                .toList()
            : List.<Trigger>of();
    var triggers =
        new ArrayList<Trigger>(
            Arrays.stream(
                    serverSideObject
                        .getClass()
                        .getAnnotationsByType(io.mateu.uidl.annotations.Trigger.class))
                .map(TriggerMapper::mapToTrigger)
                .toList());
    triggers.addAll(
        Arrays.stream(
                serverSideObject
                    .getClass()
                    .getAnnotationsByType(io.mateu.uidl.annotations.SubscribeTo.class))
            .map(
                a ->
                    (Trigger)
                        OnCustomEventTrigger.builder()
                            .actionId(a.action())
                            .eventName(a.event())
                            .condition(a.condition())
                            .source(a.source())
                            .from(a.from().isBlank() ? null : a.from())
                            .build())
            .toList());
    var autoSave = MetaAnnotations.find(serverSideObject.getClass(), AutoSave.class);
    if (autoSave != null) {
      triggers.add(new AutoSaveTrigger(autoSave.action(), autoSave.debounceMillis()));
    }
    // @RestData: fire the synthetic __restdata__ action on load, so the screen's initial data is
    // fetched client-side and merged into the form state (ActionMapper advertises the action).
    if (MetaAnnotations.isPresent(
        serverSideObject.getClass(), io.mateu.uidl.annotations.RestData.class)) {
      triggers.add(new OnLoadTrigger(RestDataSupport.RESTDATA_ACTION_ID));
    }
    triggers.addAll(supplied);
    return triggers;
  }

  public static Trigger mapToTrigger(io.mateu.uidl.annotations.Trigger annotation) {
    return switch (annotation.type()) {
      case OnCustomEvent ->
          OnCustomEventTrigger.builder()
              .actionId(annotation.actionId())
              .condition(annotation.condition())
              .eventName(annotation.eventName())
              .source(io.mateu.uidl.annotations.SubscriptionSource.SELF)
              .from(null)
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
    if (trigger instanceof OnCustomEventTrigger t) {
      return OnCustomEventTriggerDto.builder()
          .actionId(t.actionId())
          .eventName(t.eventName())
          .condition(t.condition())
          .source(
              t.source() == null
                  ? SubscriptionSourceDto.SELF
                  : SubscriptionSourceDto.valueOf(t.source().name()))
          .from(t.from())
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
          // was a duplicated .timeoutMillis(...) — times never reached the wire (always 0)
          .times(onLoadTrigger.times())
          .build();
    }
    throw new RuntimeException("not supported trigger: " + trigger.getClass().getName());
  }
}
