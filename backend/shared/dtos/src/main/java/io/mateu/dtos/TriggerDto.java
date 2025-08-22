package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** Parent interface for all component metadata types */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = OnEnterTriggerDto.class, name = "OnEnter"),
  @JsonSubTypes.Type(value = OnLoadTriggerDto.class, name = "OnLoad"),
  @JsonSubTypes.Type(value = OnCustomEventTriggerDto.class, name = "OnCustomEvent"),
  @JsonSubTypes.Type(value = OnSuccessTriggerDto.class, name = "OnSuccess"),
  @JsonSubTypes.Type(value = OnErrorTriggerDto.class, name = "OnError"),
  @JsonSubTypes.Type(value = OnValueChangeTriggerDto.class, name = "OnValueChange"),
})
public interface TriggerDto {}
